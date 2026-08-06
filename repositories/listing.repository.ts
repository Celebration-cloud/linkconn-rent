import "server-only";

import { prisma } from "@/lib/db/client";
import type { PropertyDraftInput, PropertyFeesInput } from "@/schemas/operating-system";
import { createApproximateCoordinates } from "@/utils/public-coordinates";

export class ListingRepository {
  static async saveDraft(ownerId: string, input: PropertyDraftInput) {
    const { id, publish, ...data } = input;
    const publicCoordinates =
      data.latitude !== undefined && data.longitude !== undefined
        ? createApproximateCoordinates(
            data.latitude,
            data.longitude,
            `${ownerId}:${id || data.title}`,
          )
        : { publicLatitude: null, publicLongitude: null };
    if (id) {
      const owned = await prisma.property.findFirst({
        where: { id, ownerId },
        select: { id: true },
      });
      if (!owned) throw new Error("NOT_FOUND");
      return prisma.property.update({
        where: { id },
        data: { ...data, ...publicCoordinates, status: publish ? "Available" : "Draft" },
      });
    }
    return prisma.property.create({
      data: { ...data, ...publicCoordinates, ownerId, status: publish ? "Available" : "Draft" },
    });
  }

  static async updateFees(ownerId: string, propertyId: string, fees: PropertyFeesInput) {
    const result = await prisma.property.updateMany({
      where: { id: propertyId, ownerId },
      data: fees,
    });
    if (!result.count) throw new Error("NOT_FOUND");
    return prisma.property.findUnique({ where: { id: propertyId } });
  }
}
