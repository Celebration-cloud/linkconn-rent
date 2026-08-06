import type { AppRole, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export class TenantOperationsRepository {
  static listMaintenance(profile: { id: string; role: AppRole }, status?: RequestStatus) {
    const landlord = profile.role === "Landlord" || profile.role === "PropertyManager";
    return prisma.maintenanceRequest.findMany({
      where: {
        ...(landlord ? { property: { ownerId: profile.id } } : { requesterId: profile.id }),
        ...(status ? { status } : {}),
      },
      include: {
        property: { select: { id: true, title: true, location: true, ownerId: true } },
        activities: { include: { actor: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async createMaintenance(
    requesterId: string,
    input: { propertyId: string; title: string; description: string; priority: "Low" | "Medium" | "High" },
  ) {
    const eligible = await prisma.application.findFirst({
      where: { tenantId: requesterId, propertyId: input.propertyId, status: "Accepted" },
      select: { id: true },
    });
    if (!eligible) throw new Error("NOT_TENANT");
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.create({
        data: { ...input, requesterId },
        include: { property: true },
      });
      await tx.maintenanceActivity.create({
        data: { requestId: request.id, actorId: requesterId, toStatus: "Pending", note: "Request created" },
      });
      return request;
    });
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
      if (input.status && current.property.ownerId !== actor.id) throw new Error("FORBIDDEN");
      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.status === "Closed" ? { closedAt: new Date() } : {}),
        },
      });
      await tx.maintenanceActivity.create({
        data: {
          requestId: id,
          actorId: actor.id,
          fromStatus: input.status ? current.status : undefined,
          toStatus: input.status,
          note: input.note,
        },
      });
      return updated;
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

  static async beginPayment(tenantId: string, id: string, reference: string, accessCode: string) {
    const result = await prisma.payment.updateMany({
      where: { id, tenantId, status: { in: ["Due", "Overdue", "Failed", "Processing"] } },
      data: { status: "Processing", reference, accessCode, initializedAt: new Date(), failureReason: null },
    });
    if (!result.count) throw new Error("NOT_PAYABLE");
    return prisma.payment.findUnique({ where: { id } });
  }

  static async completePayment(id: string, reference: string, paid: boolean, failureReason?: string) {
    const current = await prisma.payment.findUnique({ where: { id } });
    if (!current) throw new Error("NOT_FOUND");
    if (current.status === "Paid") return current;
    if (current.reference !== reference) throw new Error("REFERENCE_MISMATCH");
    return prisma.payment.update({
      where: { id },
      data: paid
        ? { status: "Paid", paidAt: new Date(), failureReason: null }
        : { status: "Failed", failureReason: failureReason || "Paystack verification failed" },
    });
  }
}
import "server-only";
