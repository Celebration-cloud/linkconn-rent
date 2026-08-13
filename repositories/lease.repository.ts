import "server-only";
import type { AppRole, LeaseStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { buildLeaseVersion } from "@/features/leases/agreement";
import { leaseTermsSchema, type LeaseAcceptInput, type LeaseEditableTerms, type LeaseTerms } from "@/features/leases/contracts";
import { canTransitionLease } from "@/lib/lease-lifecycle";

type Actor = { id: string; role: AppRole };
const personSelect = { id: true, firstName: true, lastName: true } as const;
const accessWhere = (actor: Actor) => actor.role === "Tenant" ? { tenantId: actor.id } : actor.role === "Landlord" || actor.role === "PropertyManager" ? { landlordId: actor.id } : ["Admin", "SuperAdmin"].includes(actor.role) ? {} : { id: "__forbidden__" };
const name = (person: { firstName: string; lastName: string }) => `${person.firstName} ${person.lastName}`.trim();

export class LeaseRepository {
  static async list(actor: Actor) {
    const rows = await prisma.lease.findMany({ where: accessWhere(actor), select: { id: true, status: true, currentVersionNumber: true, activatedAt: true, createdAt: true, updatedAt: true, property: { select: { id: true, title: true, location: true } }, tenant: { select: personSelect }, landlord: { select: personSelect }, scheduleItems: { select: { amount: true, dueDate: true, sequence: true, payment: { select: { id: true, status: true } } }, orderBy: { sequence: "asc" } } }, orderBy: { updatedAt: "desc" } });
    return rows.map((row) => ({ id: row.id, status: row.status, currentVersionNumber: row.currentVersionNumber, property: row.property, tenant: { id: row.tenant.id, name: name(row.tenant) }, landlord: { id: row.landlord.id, name: name(row.landlord) }, nextPayment: row.scheduleItems.find((item) => item.payment?.status !== "Paid") ? { amount: row.scheduleItems.find((item) => item.payment?.status !== "Paid")!.amount, dueDate: row.scheduleItems.find((item) => item.payment?.status !== "Paid")!.dueDate, status: row.scheduleItems.find((item) => item.payment?.status !== "Paid")!.payment?.status ?? "Due" } : null, activatedAt: row.activatedAt, createdAt: row.createdAt, updatedAt: row.updatedAt }));
  }

  static async detail(actor: Actor, id: string) {
    const row = await prisma.lease.findFirst({ where: { id, ...accessWhere(actor) }, select: { id: true, status: true, currentVersionNumber: true, activatedAt: true, completedAt: true, terminatedAt: true, createdAt: true, updatedAt: true, property: { select: { id: true, title: true, location: true } }, tenant: { select: personSelect }, landlord: { select: personSelect }, versions: { select: { id: true, version: true, terms: true, contentHash: true, renderedAgreement: true, sentAt: true, createdAt: true, acceptances: { select: { party: true, legalName: true, consentVersion: true, agreementHash: true, acceptedAt: true } } }, orderBy: { version: "desc" } }, scheduleItems: { select: { id: true, sequence: true, label: true, amount: true, dueDate: true, payment: { select: { id: true, status: true, paidAt: true, reference: true } } }, orderBy: { sequence: "asc" } }, activities: { select: { id: true, action: true, fromStatus: true, toStatus: true, note: true, createdAt: true, actor: { select: personSelect } }, orderBy: { createdAt: "asc" } } } });
    if (!row) return null;
    return { ...row, tenant: { id: row.tenant.id, name: name(row.tenant) }, landlord: { id: row.landlord.id, name: name(row.landlord) }, versions: row.versions.map((version) => ({ ...version, terms: leaseTermsSchema.parse(version.terms), acceptances: version.acceptances })), activities: row.activities.map((event) => ({ id: event.id, action: event.action, fromStatus: event.fromStatus, toStatus: event.toStatus, note: event.note, createdAt: event.createdAt, actorName: event.actor ? name(event.actor) : "System" })) };
  }

  static async revise(actor: Actor, id: string, input: { expectedVersion: number; expectedStatus: "Draft" | "ChangesRequested"; terms: LeaseEditableTerms }) {
    if (actor.role !== "Landlord" && actor.role !== "PropertyManager") throw new Error("FORBIDDEN");
    return prisma.$transaction(async (tx) => {
      const current = await tx.lease.findFirst({ where: { id, landlordId: actor.id }, include: { tenant: { select: personSelect }, landlord: { select: personSelect }, property: { select: { id: true, title: true, location: true } } } }); if (!current) throw new Error("NOT_FOUND");
      if (input.expectedVersion > 0) {
        const firstVersion = await tx.leaseVersion.findFirst({ where: { leaseId: id, version: 1 }, select: { terms: true } });
        const firstSchedule = (firstVersion?.terms as { schedule?: unknown } | null)?.schedule;
        if (JSON.stringify(firstSchedule) !== JSON.stringify(input.terms.schedule)) throw new Error("SCHEDULE_IMMUTABLE");
      }
      const claimed = await tx.lease.updateMany({ where: { id, landlordId: actor.id, status: input.expectedStatus, currentVersionNumber: input.expectedVersion }, data: { currentVersionNumber: input.expectedVersion + 1, status: "Draft" } });
      if (claimed.count !== 1) throw new Error("LEASE_CONFLICT");
      const terms: LeaseTerms = { ...input.terms, participants: { tenant: { id: current.tenant.id, name: name(current.tenant) }, landlord: { id: current.landlord.id, name: name(current.landlord) } }, property: current.property };
      const snapshot = buildLeaseVersion(terms);
      const version = await tx.leaseVersion.create({ data: { leaseId: id, version: input.expectedVersion + 1, createdById: actor.id, terms: snapshot.terms as Prisma.InputJsonValue, contentHash: snapshot.contentHash, renderedAgreement: snapshot.renderedAgreement } });
      if (input.expectedVersion === 0) for (const item of input.terms.schedule) {
        const payment = await tx.payment.create({ data: { propertyId: current.propertyId, tenantId: current.tenantId, amount: item.amountMinor / 100, dueDate: new Date(`${item.dueDate}T00:00:00.000Z`), status: "Due" }, select: { id: true } });
        await tx.leasePaymentScheduleItem.create({ data: { leaseId: id, sequence: item.sequence, label: item.label, amount: item.amountMinor / 100, dueDate: new Date(`${item.dueDate}T00:00:00.000Z`), paymentId: payment.id } });
      }
      await tx.leaseActivity.create({ data: { leaseId: id, actorId: actor.id, action: "lease.version.created", fromStatus: current.status, toStatus: "Draft", metadata: { version: input.expectedVersion + 1, contentHash: snapshot.contentHash } } });
      return { id: version.id, version: version.version, contentHash: version.contentHash, createdAt: version.createdAt };
    }, { isolationLevel: "Serializable" });
  }

  static async accept(actor: Actor, id: string, input: LeaseAcceptInput & { ipHash: string; userAgentHash: string }) {
    if (actor.role !== "Tenant" && actor.role !== "Landlord") throw new Error("FORBIDDEN");
    return prisma.$transaction(async (tx) => {
      const current = await tx.lease.findFirst({ where: { id, status: "AwaitingAcceptance", ...(actor.role === "Tenant" ? { tenantId: actor.id } : { landlordId: actor.id }) }, include: { versions: { where: { version: input.expectedVersion }, select: { id: true, version: true, contentHash: true } } } });
      const version = current?.versions[0]; if (!current || !version) throw new Error("NOT_FOUND");
      if (current.currentVersionNumber !== input.expectedVersion || version.contentHash !== input.expectedHash) throw new Error("LEASE_CONFLICT");
      const party = actor.role === "Tenant" ? "Tenant" : "Landlord";
      await tx.leaseAcceptance.create({ data: { leaseVersionId: version.id, profileId: actor.id, party, legalName: input.legalName, consentVersion: input.consentVersion, agreementHash: version.contentHash, ipHash: input.ipHash, userAgentHash: input.userAgentHash } });
      await tx.lease.updateMany({ where: { id, status: "AwaitingAcceptance", currentVersionNumber: input.expectedVersion, versions: { some: { id: version.id, contentHash: version.contentHash, acceptances: { some: { party: "Tenant", agreementHash: version.contentHash } }, AND: { acceptances: { some: { party: "Landlord", agreementHash: version.contentHash } } } } } }, data: { status: "AwaitingPayment" } });
      await tx.leaseActivity.create({ data: { leaseId: id, actorId: actor.id, action: "lease.accepted", fromStatus: "AwaitingAcceptance", metadata: { party, version: input.expectedVersion, agreementHash: version.contentHash, consentVersion: input.consentVersion } } });
      await tx.notification.create({ data: { profileId: party === "Tenant" ? current.landlordId : current.tenantId, kind: "Lease", title: `${party} accepted the agreement`, body: `${input.legalName} accepted version ${input.expectedVersion}.`, href: `/dashboard/leases?item=${id}`, idempotencyKey: `lease:${id}:version:${input.expectedVersion}:accepted:${party}` } });
      return { leaseId: id, version: input.expectedVersion, party, accepted: true };
    }, { isolationLevel: "Serializable" });
  }

  static async transition(actor: Actor, id: string, input: { action: "send" | "request_changes" | "cancel" | "terminate" | "complete"; expectedVersion: number; expectedStatus: LeaseStatus; reason?: string }) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.lease.findFirst({ where: { id, ...accessWhere(actor) } }); if (!current) throw new Error("NOT_FOUND");
      const landlordAction = input.action === "send" || input.action === "cancel" || input.action === "terminate" || input.action === "complete";
      if (landlordAction && actor.id !== current.landlordId) throw new Error("FORBIDDEN");
      if (input.action === "request_changes" && actor.id !== current.tenantId) throw new Error("FORBIDDEN");
      const next = input.action === "send" ? "AwaitingAcceptance" : input.action === "request_changes" ? "ChangesRequested" : input.action === "cancel" ? "Cancelled" : input.action === "terminate" ? "Terminated" : "Completed";
      if (!canTransitionLease(current.status, next)) throw new Error("INVALID_TRANSITION");
      const updated = await tx.lease.updateMany({ where: { id, status: input.expectedStatus, currentVersionNumber: input.expectedVersion }, data: { status: next, ...(next === "Terminated" ? { terminatedAt: new Date() } : {}), ...(next === "Completed" ? { completedAt: new Date() } : {}) } });
      if (updated.count !== 1) throw new Error("LEASE_CONFLICT");
      if (input.action === "send") await tx.leaseVersion.updateMany({ where: { leaseId: id, version: input.expectedVersion, sentAt: null }, data: { sentAt: new Date() } });
      await tx.leaseActivity.create({ data: { leaseId: id, actorId: actor.id, action: `lease.${input.action}`, fromStatus: current.status, toStatus: next, note: input.reason, metadata: { version: input.expectedVersion } } });
      await tx.notification.createMany({ data: [{ profileId: current.tenantId, kind: "Lease", title: "Lease updated", body: `Your tenancy agreement is now ${next}.`, href: `/dashboard/leases?item=${id}`, idempotencyKey: `lease:${id}:${input.action}:${input.expectedVersion}:tenant` }, { profileId: current.landlordId, kind: "Lease", title: "Lease updated", body: `The tenancy agreement is now ${next}.`, href: `/dashboard/leases?item=${id}`, idempotencyKey: `lease:${id}:${input.action}:${input.expectedVersion}:landlord` }], skipDuplicates: true });
      return { id, status: next, currentVersionNumber: input.expectedVersion };
    });
  }
}
