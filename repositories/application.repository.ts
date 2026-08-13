import "server-only";

import type { AppRole, ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { canTenantTransitionApplication, canTransitionApplication } from "@/lib/application-lifecycle";
import { getApplicationActions, type ApplicationDetail, type ApplicationListItem, type ApplicationMutationInput } from "@/features/applications/contracts";
import { isUniqueConstraintFor } from "@/lib/db/prisma-errors";

type Actor = { id: string; role: AppRole };
const personSelect = { id: true, firstName: true, lastName: true, verificationLevel: true } satisfies Prisma.ProfileSelect;
const propertySelect = { id: true, title: true, location: true, city: true, price: true, period: true, ownerId: true } satisfies Prisma.PropertySelect;

function name(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`.trim() || "LinkConn member";
}

function actionStatus(action: ApplicationMutationInput["action"]): ApplicationStatus {
  return { shortlist: "Shortlisted", accept: "Accepted", decline: "Declined", withdraw: "Withdrawn" }[action] as ApplicationStatus;
}

export class ApplicationRepository {
  static async create(tenantId: string, propertyId: string, message: string | undefined, idempotencyKey: string) {
    try {
      return await prisma.$transaction(async (tx) => {
      const replay = await tx.applicationActivity.findUnique({ where: { idempotencyKey }, include: { application: { include: { property: true } } } });
      if (replay) {
        if (replay.application.tenantId !== tenantId || replay.application.propertyId !== propertyId) throw new Error("IDEMPOTENCY_CONFLICT");
        return projectCreatedApplication(replay.application);
      }
      const property = await tx.property.findFirst({ where: { id: propertyId, status: "Available", moderationStatus: "Approved" }, select: { id: true, ownerId: true, title: true } });
      if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
      if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
      const eligible = await tx.profile.findFirst({ where: { id: tenantId, role: "Tenant", accountStatus: "Active", verificationLevel: { in: ["FullyVerified", "Trusted"] } }, select: { id: true } });
      if (!eligible) throw new Error("NOT_ELIGIBLE");
      const existing = await tx.application.findUnique({ where: { propertyId_tenantId: { propertyId, tenantId } }, select: { id: true } });
      if (existing) throw new Error("ALREADY_APPLIED");
      const application = await tx.application.create({ data: { tenantId, propertyId, message }, include: { property: true } });
      await tx.applicationActivity.create({ data: { applicationId: application.id, actorId: tenantId, toStatus: "Pending", note: message, idempotencyKey } });
      await tx.notification.create({ data: { profileId: property.ownerId, kind: "Application", title: "New rental application", body: `A verified tenant applied for ${property.title}.`, href: `/dashboard/applicants/${application.id}`, idempotencyKey: `notification:${idempotencyKey}` } });
      return projectCreatedApplication(application);
      });
    } catch (error) {
      if (isUniqueConstraintFor(error, ["propertyId", "tenantId"])) {
        throw new Error("ALREADY_APPLIED");
      }
      throw error;
    }
  }

  static async list(actor: Actor): Promise<ApplicationListItem[]> {
    const owner = actor.role === "Landlord" || actor.role === "PropertyManager";
    const rows = await prisma.application.findMany({
      where: owner ? { property: { ownerId: actor.id } } : { tenantId: actor.id },
      select: { id: true, status: true, createdAt: true, updatedAt: true, property: { select: { id: true, title: true, location: true, owner: { select: personSelect } } }, tenant: { select: personSelect } },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((row) => { const participant = owner ? row.tenant : row.property.owner; return { id: row.id, status: row.status, property: { id: row.property.id, title: row.property.title, location: row.property.location }, participant: { name: name(participant), verificationLevel: participant.verificationLevel }, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }; });
  }

  static async detail(actor: Actor, applicationId: string): Promise<ApplicationDetail | null> {
    const row = await prisma.application.findFirst({
      where: { id: applicationId, OR: [{ tenantId: actor.id }, { property: { ownerId: actor.id } }] },
      select: { id: true, status: true, message: true, createdAt: true, updatedAt: true, property: { select: { ...propertySelect, owner: { select: personSelect } } }, tenant: { select: personSelect }, conversation: { select: { id: true } }, lease: { select: { id: true } }, activities: { select: { id: true, fromStatus: true, toStatus: true, note: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } } },
    });
    if (!row) return null;
    return { id: row.id, status: row.status, message: row.message, property: { id: row.property.id, title: row.property.title, location: row.property.location, city: row.property.city, price: row.property.price, period: row.property.period }, tenant: { id: row.tenant.id, name: name(row.tenant), verificationLevel: row.tenant.verificationLevel }, landlord: { id: row.property.owner.id, name: name(row.property.owner), verificationLevel: row.property.owner.verificationLevel }, conversation: row.conversation ? { id: row.conversation.id, href: `/messages?conversation=${row.conversation.id}` } : null, leaseId: row.lease?.id ?? null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), actions: getApplicationActions(actor.role, row.status), timeline: row.activities.map((event) => ({ id: event.id, fromStatus: event.fromStatus, toStatus: event.toStatus, note: event.note, actorName: name(event.actor), createdAt: event.createdAt.toISOString() })) };
  }

  static transition(actor: Actor, applicationId: string, input: ApplicationMutationInput) {
    return prisma.$transaction(async (tx) => {
      const replay = await tx.applicationActivity.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { applicationId: true, actorId: true, toStatus: true } });
      if (replay) {
        if (replay.applicationId !== applicationId || replay.actorId !== actor.id) throw new Error("IDEMPOTENCY_CONFLICT");
        return { applicationId, status: replay.toStatus, replayed: true };
      }
      const application = await tx.application.findUnique({ where: { id: applicationId }, include: { property: { select: { id: true, ownerId: true, title: true } } } });
      if (!application) throw new Error("NOT_FOUND");
      const owner = (actor.role === "Landlord" || actor.role === "PropertyManager") && application.property.ownerId === actor.id;
      const tenant = actor.role === "Tenant" && application.tenantId === actor.id;
      if (!owner && !tenant) throw new Error("FORBIDDEN");
      const next = actionStatus(input.action);
      const allowed = tenant
        ? canTenantTransitionApplication({ actorId: actor.id, tenantId: application.tenantId, from: application.status, to: next })
        : input.action !== "withdraw" && canTransitionApplication(application.status, next);
      if (!allowed || application.status !== input.expectedStatus) throw new Error("INVALID_TRANSITION");
      const updated = await tx.application.updateMany({ where: { id: applicationId, status: input.expectedStatus }, data: { status: next } });
      if (updated.count !== 1) throw new Error("CONFLICT");
      const note = "reason" in input ? input.reason ?? null : null;
      await tx.applicationActivity.create({ data: { applicationId, actorId: actor.id, fromStatus: application.status, toStatus: next, note, idempotencyKey: input.idempotencyKey } });
      let conversationId: string | null = null;
      let leaseId: string | null = null;
      if (next === "Accepted") {
        const lease = await tx.lease.upsert({ where: { applicationId }, update: {}, create: { applicationId, propertyId: application.propertyId, tenantId: application.tenantId, landlordId: application.property.ownerId, status: "Draft" } });
        const applicationConversation = await tx.conversation.findUnique({ where: { applicationId }, select: { id: true } });
        const conversation = applicationConversation
          ? await tx.conversation.update({ where: { id: applicationConversation.id }, data: { leaseId: lease.id }, select: { id: true } })
          : await tx.conversation.upsert({
              where: { tenantId_landlordId_propertyId: { tenantId: application.tenantId, landlordId: application.property.ownerId, propertyId: application.propertyId } },
              update: { applicationId, leaseId: lease.id },
              create: { applicationId, leaseId: lease.id, propertyId: application.propertyId, tenantId: application.tenantId, landlordId: application.property.ownerId },
              select: { id: true },
            });
        conversationId = conversation.id; leaseId = lease.id;
      }
      const recipientId = tenant ? application.property.ownerId : application.tenantId;
      const recipientHref = tenant ? `/dashboard/applicants/${applicationId}` : `/dashboard/applications/${applicationId}`;
      await tx.notification.createMany({ data: [{ profileId: recipientId, kind: "Application", title: `Application ${next.toLowerCase()}`, body: `${application.property.title} is now ${next.toLowerCase()}.`, href: recipientHref, idempotencyKey: `notification:${input.idempotencyKey}` }], skipDuplicates: true });
      return { applicationId, status: next, conversationId, leaseId, replayed: false };
    });
  }

  static listForLandlord(landlordId: string) { return this.list({ id: landlordId, role: "Landlord" }); }
  static decide(landlordId: string, applicationId: string, status: Exclude<ApplicationStatus, "Pending" | "Withdrawn">) {
    const action = { Shortlisted: "shortlist", Accepted: "accept", Declined: "decline" }[status] as "shortlist" | "accept" | "decline";
    return this.transition({ id: landlordId, role: "Landlord" }, applicationId, { action, expectedStatus: action === "shortlist" ? "Pending" : "Pending", idempotencyKey: crypto.randomUUID(), ...(action === "decline" ? { reason: "Declined by the property owner." } : {}) } as ApplicationMutationInput);
  }
}

function projectCreatedApplication(application: { id: string; status: ApplicationStatus; propertyId: string; tenantId: string; message: string | null; createdAt: Date; property: { id: string; title: string; location: string } }) {
  return { id: application.id, status: application.status, message: application.message, property: { id: application.property.id, title: application.property.title, location: application.property.location }, createdAt: application.createdAt.toISOString() };
}
