import type { AppRole, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { canActivateLease } from "@/lib/lease-lifecycle";

export class TenantOperationsRepository {
  static async listMaintenance(profile: { id: string; role: AppRole }, status?: RequestStatus) {
    const landlord = profile.role === "Landlord" || profile.role === "PropertyManager";
    const rows = await prisma.maintenanceRequest.findMany({
      where: {
        ...(landlord ? { property: { ownerId: profile.id } } : { requesterId: profile.id }),
        ...(status ? { status } : {}),
      },
      select: {
        id: true, title: true, description: true, status: true, priority: true, leaseId: true,
        createdAt: true, updatedAt: true, closedAt: true,
        property: { select: { id: true, title: true, location: true, owner: { select: { id: true, firstName: true, lastName: true } }, applications: { where: { status: "Accepted" }, select: { tenantId: true } } } },
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        lease: { select: { id: true, status: true } },
        activities: { select: { id: true, fromStatus: true, toStatus: true, note: true, createdAt: true, actor: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((row) => {
      const { applications, ...property } = row.property;
      const eligibilitySource = row.leaseId ? "Active lease" as const : (applications ?? []).some((application) => application.tenantId === row.requester.id) ? "Legacy accepted-application record" as const : "Legacy record — eligibility unknown" as const;
      return { ...row, property, eligibilitySource };
    });
  }

  static async createMaintenance(
    requesterId: string,
    input: { propertyId: string; title: string; description: string; priority: "Low" | "Medium" | "High" },
  ) {
    return prisma.$transaction(async (tx) => {
      const eligible = await tx.lease.findFirst({ where: { tenantId: requesterId, propertyId: input.propertyId, status: "Active" }, select: { id: true, landlordId: true } });
      if (!eligible) throw new Error("ACTIVE_LEASE_REQUIRED");
      const request = await tx.maintenanceRequest.create({
        data: { ...input, requesterId, leaseId: eligible.id },
        select: { id: true, requesterId: true, propertyId: true, leaseId: true, status: true, createdAt: true },
      });
      await tx.maintenanceActivity.create({
        data: { requestId: request.id, actorId: requesterId, toStatus: "Pending", note: "Request created" },
      });
      await tx.notification.create({ data: { profileId: eligible.landlordId, kind: "Maintenance", title: "New maintenance request", body: input.title, href: `/dashboard/maintenance/${request.id}`, idempotencyKey: `maintenance:${request.id}:created` } });
      return request;
    }, { isolationLevel: "Serializable" });
  }

  static async listEligibleMaintenanceProperties(tenantId: string) {
    const leases = await prisma.lease.findMany({ where: { tenantId, status: "Active" }, select: { property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" } });
    return leases.map((lease) => lease.property);
  }

  static async updateMaintenance(
    actor: { id: string; role: AppRole },
    id: string,
    input: { status?: RequestStatus; note?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.maintenanceRequest.findFirst({
        where: {
          id,
          OR: [{ requesterId: actor.id }, { property: { ownerId: actor.id } }],
        },
        include: { property: { select: { ownerId: true } } },
      });
      if (!current) throw new Error("NOT_FOUND");
      const owner = current.property.ownerId === actor.id;
      const tenant = current.requesterId === actor.id;
      if (input.status) {
        const valid = (tenant && current.status === "Pending" && input.status === "Closed") || (owner && ((current.status === "Pending" && input.status === "InProgress") || (current.status === "InProgress" && input.status === "Completed") || (current.status === "Completed" && input.status === "Closed")));
        if (!valid) throw new Error(owner || tenant ? "INVALID_TRANSITION" : "FORBIDDEN");
      }
      if (input.status) {
        const claimed = await tx.maintenanceRequest.updateMany({
          where: { id, status: current.status, ...(tenant ? { requesterId: actor.id } : { property: { ownerId: actor.id } }) },
          data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.status === "Closed" ? { closedAt: new Date() } : {}),
          },
        });
        if (claimed.count !== 1) throw new Error("OPERATION_CONFLICT");
      }
      const activity = await tx.maintenanceActivity.create({
        data: {
          requestId: id,
          actorId: actor.id,
          fromStatus: input.status ? current.status : undefined,
          toStatus: input.status,
          note: input.note,
        },
      });
      const recipientId = actor.id === current.requesterId ? current.property.ownerId : current.requesterId;
      await tx.notification.create({ data: { profileId: recipientId, kind: "Maintenance", title: "Maintenance request updated", body: input.status ? `${current.title} is now ${input.status}.` : `A note was added to ${current.title}.`, href: `/dashboard/maintenance/${id}`, idempotencyKey: `maintenance:${id}:activity:${activity.id}` } });
      return tx.maintenanceRequest.findUnique({ where: { id } });
    });
  }

  static listOwnedProperties(ownerId: string) {
    return prisma.property.findMany({
      where: { ownerId },
      include: {
        _count: { select: { applications: true, maintenance: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async propertyAction(ownerId: string, id: string, action: "publish" | "archive" | "duplicate") {
    const property = await prisma.property.findFirst({ where: { id, ownerId } });
    if (!property) throw new Error("NOT_FOUND");
    if (action === "duplicate") {
      return prisma.property.create({
        data: {
          title: `${property.title} (Copy)`,
          type: property.type,
          location: property.location,
          city: property.city,
          price: property.price,
          period: property.period,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          toilets: property.toilets,
          area: property.area,
          latitude: property.latitude,
          longitude: property.longitude,
          images: property.images,
          amenities: property.amenities,
          houseRules: property.houseRules,
          cautionFee: property.cautionFee,
          legalFee: property.legalFee,
          agencyFee: property.agencyFee,
          serviceCharge: property.serviceCharge,
          verified: false,
          featured: false,
          rating: 0,
          description: property.description,
          ownerId,
          status: "Draft",
          moderationStatus: "PendingReview",
        },
      });
    }
    if (action === "publish" && !property.images.length) throw new Error("MEDIA_REQUIRED");
    return prisma.property.update({
      where: { id },
      data: {
        status: action === "publish" ? "Available" : "Archived",
        ...(action === "publish" ? { moderationStatus: "PendingReview" } : {}),
      },
    });
  }

  static getOwnedPayment(tenantId: string, id: string) {
    return prisma.payment.findFirst({
      where: { id, tenantId },
      include: { property: true, tenant: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  static async assertLeasePaymentPayable(tenantId: string, id: string) {
    const item = await prisma.leasePaymentScheduleItem.findFirst({
      where: { paymentId: id, sequence: 1, lease: { tenantId, status: "AwaitingPayment" } },
      select: { id: true },
    });
    if (!item) throw new Error("NOT_PAYABLE");
  }

  static async beginPayment(tenantId: string, id: string, reference: string, accessCode: string) {
    const result = await prisma.payment.updateMany({
      where: { id, tenantId, status: { in: ["Due", "Overdue", "Failed", "Processing"] } },
      data: { status: "Processing", reference, accessCode, initializedAt: new Date(), failureReason: null },
    });
    if (!result.count) throw new Error("NOT_PAYABLE");
    return prisma.payment.findUnique({ where: { id } });
  }

  static async completePayment(id: string, reference: string, paid: boolean, failureReason?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({
        where: { id },
        include: {
          leaseScheduleItem: {
            include: {
              lease: {
                include: {
                  versions: {
                    include: { acceptances: true },
                    orderBy: { version: "desc" },
                    take: 1,
                  },
                  scheduleItems: {
                    include: { payment: { select: { status: true } } },
                  },
                },
              },
            },
          },
        },
      });
      if (!current) throw new Error("NOT_FOUND");
      if (current.status === "Paid") return current;
      if (current.reference !== reference) throw new Error("REFERENCE_MISMATCH");
      const updated = await tx.payment.update({ where: { id }, data: paid ? { status: "Paid", paidAt: new Date(), failureReason: null } : { status: "Failed", failureReason: failureReason || "Paystack verification failed" } });
      const linked = current.leaseScheduleItem;
      const lease = linked?.lease;
      const version = lease?.versions[0];
      if (paid && linked?.sequence === 1 && lease?.status === "AwaitingPayment" && version && canActivateLease({ currentVersionId: version.id, currentAgreementHash: version.contentHash, acceptances: version.acceptances, paymentSchedule: lease.scheduleItems.map((item) => ({ sequence: item.sequence, paymentId: item.paymentId, paymentStatus: item.paymentId === id ? "Paid" : item.payment?.status ?? null })) })) {
        const activatedAt = new Date();
        const activated = await tx.lease.updateMany({ where: { id: lease.id, status: "AwaitingPayment", currentVersionNumber: version.version }, data: { status: "Active", activatedAt } });
        if (activated.count === 1) await tx.leaseActivity.create({ data: { leaseId: lease.id, action: "lease.activated", fromStatus: "AwaitingPayment", toStatus: "Active", note: "Activated after Paystack verified the first scheduled payment", idempotencyKey: `lease:${lease.id}:activated:payment:${id}`, metadata: { paymentId: id, reference } } });
      }
      return updated;
    });
  }
}
import "server-only";
