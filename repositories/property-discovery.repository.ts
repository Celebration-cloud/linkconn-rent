import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import type { PropertySearchInput } from "@/schemas/operating-system";
import { getNormalizedTypes } from "@/utils/property-search";

export function buildPropertyWhere(
  filters: PropertySearchInput,
): Prisma.PropertyWhereInput {
  const types = getNormalizedTypes(filters);
  return {
    status: "Available",
    moderationStatus: "Approved",
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { description: { contains: filters.q, mode: "insensitive" as const } },
            { location: { contains: filters.q, mode: "insensitive" as const } },
            { city: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.location
      ? {
          AND: {
            OR: [
              { location: { contains: filters.location, mode: "insensitive" as const } },
              { city: { contains: filters.location, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    ...(types.length ? { type: { in: types, mode: "insensitive" } } : {}),
    ...(filters.period ? { period: filters.period } : {}),
    ...(filters.amenities?.length ? { amenities: { hasEvery: filters.amenities } } : {}),
    ...(filters.verified !== undefined ? { verified: filters.verified } : {}),
    ...(filters.bedrooms !== undefined ? { bedrooms: { gte: filters.bedrooms } } : {}),
    ...(filters.bathrooms !== undefined ? { bathrooms: { gte: filters.bathrooms } } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.north !== undefined &&
    filters.south !== undefined &&
    filters.east !== undefined &&
    filters.west !== undefined
      ? {
          publicLatitude: { gte: filters.south, lte: filters.north },
          publicLongitude: { gte: filters.west, lte: filters.east },
        }
      : {}),
  };
}

export class PropertyDiscoveryRepository {
  static async search(filters: PropertySearchInput) {
    const where = buildPropertyWhere(filters);
    const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
      filters.sort === "newest"
        ? [{ createdAt: "desc" }, { id: "asc" }]
        : filters.sort === "lowest-rent"
          ? [{ price: "asc" }, { id: "asc" }]
          : filters.sort === "highest-rent"
            ? [{ price: "desc" }, { id: "asc" }]
            : [
                { featured: "desc" },
                { verified: "desc" },
                { rating: "desc" },
                { createdAt: "desc" },
                { id: "asc" },
              ];
    const pageSize = filters.mode === "map" ? 200 : filters.pageSize;

    return prisma.$transaction(async (transaction) => {
      const totalItems = await transaction.property.count({ where });
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const page = filters.mode === "map" ? 1 : Math.min(filters.page, totalPages);
      const items = await transaction.property.findMany({
        where,
        include: { owner: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return {
        items,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    });
  }

  static count(filters: PropertySearchInput) {
    return prisma.property.count({ where: buildPropertyWhere(filters) });
  }
}
