import "server-only";

import { prisma } from "@/lib/db/client";

export class SavedPropertyRepository {
  static async listIds(profileId: string) {
    const saved = await prisma.savedProperty.findMany({
      where: { profileId },
      select: { propertyId: true },
      orderBy: { createdAt: "desc" },
    });
    return saved.map((item) => item.propertyId);
  }

  static save(profileId: string, propertyId: string) {
    return prisma.savedProperty.upsert({
      where: { profileId_propertyId: { profileId, propertyId } },
      update: {},
      create: { profileId, propertyId },
      include: { property: true },
    });
  }

  static remove(profileId: string, propertyId: string) {
    return prisma.savedProperty.deleteMany({ where: { profileId, propertyId } });
  }
}
