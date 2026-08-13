import "server-only";

import type { AppRole, ViewingStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { canTransitionViewing } from "@/lib/viewing-lifecycle";
import { getViewingActions, type ViewingDetail, type ViewingListItem, type ViewingMutationInput } from "@/features/viewings/contracts";
import { isUniqueConstraintFor } from "@/lib/db/prisma-errors";

type Actor = { id: string; role: AppRole };
const fullName = (person: { firstName: string; lastName: string }) => `${person.firstName} ${person.lastName}`.trim() || "LinkConn member";

function nextStatus(action: ViewingMutationInput["action"]): ViewingStatus {
  return { confirm: "Confirmed", accept_reschedule: "Confirmed", reschedule: "Rescheduled", complete: "Completed", cancel: "Cancelled" }[action] as ViewingStatus;
}

export class ViewingRepository {
  static async create(tenantId: string, propertyId: string, scheduledAt: Date, note: string | undefined, idempotencyKey: string) {
    try {
      return await prisma.$transaction(async (tx) => {
      const replay = await tx.viewingActivity.findUnique({ where: { idempotencyKey }, include: { viewing: { include: { property: true } } } });
      if (replay) {
        if (replay.viewing.tenantId !== tenantId || replay.viewing.propertyId !== propertyId || replay.viewing.scheduledAt.getTime() !== scheduledAt.getTime()) throw new Error("IDEMPOTENCY_CONFLICT");
        return projectCreatedViewing(replay.viewing);
      }
      const property = await tx.property.findFirst({ where: { id: propertyId, status: "Available", moderationStatus: "Approved" }, select: { ownerId: true, title: true } });
      if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
      if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
      const duplicate = await tx.viewing.findFirst({ where: { tenantId, propertyId, status: { in: ["Requested", "Confirmed", "Rescheduled"] } }, select: { id: true } });
      if (duplicate) throw new Error("ACTIVE_VIEWING_EXISTS");
      const viewing = await tx.viewing.create({ data: { tenantId, landlordId: property.ownerId, propertyId, scheduledAt, note, activeSlotKey: `${tenantId}:${propertyId}` }, include: { property: true } });
      await tx.viewingActivity.create({ data: { viewingId: viewing.id, actorId: tenantId, toStatus: "Requested", note, metadata: { scheduledAt: scheduledAt.toISOString() }, idempotencyKey } });
      await tx.notification.create({ data: { profileId: property.ownerId, kind: "Viewing", title: "New viewing request", body: `A tenant requested a viewing for ${property.title}.`, href: `/dashboard/calendar/${viewing.id}`, idempotencyKey: `notification:${idempotencyKey}` } });
      return projectCreatedViewing(viewing);
      });
    } catch (error) {
      if (isUniqueConstraintFor(error, ["activeSlotKey"])) {
        throw new Error("ACTIVE_VIEWING_EXISTS");
      }
      throw error;
    }
  }

  static async list(actor: Actor): Promise<ViewingListItem[]> {
    const owner = actor.role === "Landlord" || actor.role === "PropertyManager";
    const rows = await prisma.viewing.findMany({ where: owner ? { landlordId: actor.id } : { tenantId: actor.id }, select: { id: true, status: true, scheduledAt: true, createdAt: true, property: { select: { id: true, title: true, location: true } }, tenant: { select: { firstName: true, lastName: true } }, landlord: { select: { firstName: true, lastName: true } } }, orderBy: { scheduledAt: "asc" } });
    return rows.map((row) => ({ id: row.id, status: row.status, scheduledAt: row.scheduledAt.toISOString(), createdAt: row.createdAt.toISOString(), property: row.property, participant: { name: fullName(owner ? row.tenant : row.landlord) } }));
  }

  static async detail(actor: Actor, viewingId: string): Promise<ViewingDetail | null> {
    const owner = actor.role === "Landlord" || actor.role === "PropertyManager";
    const row = await prisma.viewing.findFirst({ where: { id: viewingId, ...(owner ? { landlordId: actor.id } : { tenantId: actor.id }) }, select: { id: true, status: true, scheduledAt: true, note: true, createdAt: true, property: { select: { id: true, title: true, location: true } }, tenant: { select: { id: true, firstName: true, lastName: true } }, landlord: { select: { id: true, firstName: true, lastName: true } }, activities: { select: { id: true, fromStatus: true, toStatus: true, note: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } } } });
    if (!row) return null;
    return { id: row.id, status: row.status, scheduledAt: row.scheduledAt.toISOString(), note: row.note, createdAt: row.createdAt.toISOString(), property: row.property, participant: { name: fullName(owner ? row.tenant : row.landlord) }, tenant: { id: row.tenant.id, name: fullName(row.tenant) }, landlord: { id: row.landlord.id, name: fullName(row.landlord) }, actions: getViewingActions(actor.role, row.status), timeline: row.activities.map((event) => ({ id: event.id, fromStatus: event.fromStatus, toStatus: event.toStatus, note: event.note, actorName: fullName(event.actor), createdAt: event.createdAt.toISOString() })) };
  }

  static transition(actor: Actor, viewingId: string, input: ViewingMutationInput) {
    return prisma.$transaction(async (tx) => {
      const replay = await tx.viewingActivity.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { viewingId: true, actorId: true, toStatus: true } });
      if (replay) { if (replay.viewingId !== viewingId || replay.actorId !== actor.id) throw new Error("IDEMPOTENCY_CONFLICT"); return { viewingId, status: replay.toStatus, replayed: true }; }
      const viewing = await tx.viewing.findUnique({ where: { id: viewingId }, include: { property: { select: { title: true } } } });
      if (!viewing) throw new Error("NOT_FOUND");
      const tenant = actor.role === "Tenant" && viewing.tenantId === actor.id;
      const owner = (actor.role === "Landlord" || actor.role === "PropertyManager") && viewing.landlordId === actor.id;
      if (!tenant && !owner) throw new Error("FORBIDDEN");
      if ((tenant && !["accept_reschedule", "cancel"].includes(input.action)) || (owner && input.action === "accept_reschedule")) throw new Error("FORBIDDEN");
      const next = nextStatus(input.action);
      if (viewing.status !== input.expectedStatus || !canTransitionViewing(viewing.status, next)) throw new Error("INVALID_TRANSITION");
      const update = await tx.viewing.updateMany({ where: { id: viewingId, status: input.expectedStatus }, data: { status: next, ...(input.action === "reschedule" ? { scheduledAt: input.scheduledAt } : {}), ...(["Completed", "Cancelled"].includes(next) ? { activeSlotKey: null } : {}) } });
      if (update.count !== 1) throw new Error("CONFLICT");
      const note = "reason" in input ? input.reason ?? null : null;
      await tx.viewingActivity.create({ data: { viewingId, actorId: actor.id, fromStatus: viewing.status, toStatus: next, note, metadata: input.action === "reschedule" ? { scheduledAt: input.scheduledAt.toISOString() } : {}, idempotencyKey: input.idempotencyKey } });
      const recipientId = tenant ? viewing.landlordId : viewing.tenantId;
      const href = tenant ? `/dashboard/calendar/${viewingId}` : `/dashboard/viewings/${viewingId}`;
      await tx.notification.createMany({ data: [{ profileId: recipientId, kind: "Viewing", title: `Viewing ${next.toLowerCase()}`, body: `${viewing.property.title} viewing is now ${next.toLowerCase()}.`, href, idempotencyKey: `notification:${input.idempotencyKey}` }], skipDuplicates: true });
      return { viewingId, status: next, replayed: false };
    });
  }
}

function projectCreatedViewing(viewing: { id: string; status: ViewingStatus; scheduledAt: Date; note: string | null; property: { id: string; title: string; location: string } }) {
  return { id: viewing.id, status: viewing.status, scheduledAt: viewing.scheduledAt.toISOString(), note: viewing.note, property: viewing.property };
}
