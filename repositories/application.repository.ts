import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";
import { canTransitionApplication } from "@/lib/application-lifecycle";
import { prisma } from "@/lib/db/client";

const profileCard = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    avatar: true,
    verificationLevel: true,
  },
} satisfies Prisma.ProfileDefaultArgs;

export class ApplicationRepository {
  static async create(tenantId: string, propertyId: string, message?: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "Available" },
      select: { id: true, ownerId: true },
    });
    if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
    if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
    return prisma.application.upsert({
      where: { propertyId_tenantId: { propertyId, tenantId } },
      update: { message },
      create: { tenantId, propertyId, message },
      include: { property: true },
    });
  }

  static listForLandlord(landlordId: string) {
    return prisma.application.findMany({
      where: { property: { ownerId: landlordId } },
      include: { tenant: profileCard, property: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async decide(landlordId: string, applicationId: string, status: ApplicationStatus) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, property: { ownerId: landlordId } },
    });
    if (!application) throw new Error("NOT_FOUND");
    if (!canTransitionApplication(application.status, status)) {
      throw new Error("INVALID_TRANSITION");
    }
    return prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: { tenant: profileCard, property: true },
    });
  }

  static async createViewing(
    tenantId: string,
    propertyId: string,
    scheduledAt: Date,
    note?: string,
  ) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "Available" },
      select: { ownerId: true },
    });
    if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
    if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
    return prisma.viewing.create({
      data: { tenantId, landlordId: property.ownerId, propertyId, scheduledAt, note },
      include: { property: true },
    });
  }
}
