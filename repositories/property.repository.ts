import "server-only";

import { prisma } from "../lib/db/client";
import type { Prisma, Property } from "@prisma/client";

export class PropertyRepository {
  static async findById(id: string) {
    return prisma.property.findFirst({
      where: { id, status: "Available", moderationStatus: "Approved" },
      include: { owner: true },
    });
  }

  static async findNavigationTarget(id: string) {
    return prisma.property.findFirst({
      where: {
        id,
        status: "Available",
        moderationStatus: "Approved",
        coordinateVerified: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { id: true, title: true, location: true, latitude: true, longitude: true },
    });
  }

  static async findNavigationTargets(ids: string[]) {
    const uniqueIds = [...new Set(ids)].slice(0, 4);
    if (!uniqueIds.length) return [];
    const records = await prisma.property.findMany({
      where: {
        id: { in: uniqueIds },
        status: "Available",
        moderationStatus: "Approved",
        coordinateVerified: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { id: true, title: true, location: true, latitude: true, longitude: true },
    });
    const byId = new Map(records.map((record) => [record.id, record]));
    return uniqueIds.flatMap((id) => {
      const record = byId.get(id);
      return record ? [record] : [];
    });
  }

  static async listAll(filters?: {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }) {
    const where: Prisma.PropertyWhereInput = {
      status: "Available",
      moderationStatus: "Approved",
    };
    
    if (filters?.city && filters.city !== "All") {
      where.city = filters.city;
    }
    
    if (filters?.type && filters.type !== "All") {
      where.type = filters.type;
    }
    
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    
    if (filters?.bedrooms && filters.bedrooms > 0) {
      where.bedrooms = { gte: filters.bedrooms };
    }

    return prisma.property.findMany({
      where,
      include: { owner: true },
      orderBy: { rating: "desc" },
    });
  }

  static async listFeatured(take = 3) {
    return prisma.property.findMany({
      where: { status: "Available", moderationStatus: "Approved" },
      include: { owner: true },
      orderBy: [
        { featured: "desc" },
        { verified: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
        { id: "asc" },
      ],
      take,
    });
  }

  static async listRelated(propertyId: string, city: string, type: string, take = 3) {
    return prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: "Available",
        moderationStatus: "Approved",
        OR: [{ city }, { type }],
      },
      include: { owner: true },
      orderBy: [{ verified: "desc" }, { rating: "desc" }, { id: "asc" }],
      take,
    });
  }

  static async listComparisonCandidates(propertyIds: string[], take = 12) {
    const uniqueIds = [...new Set(propertyIds)].slice(0, 4);
    const commonWhere: Prisma.PropertyWhereInput = {
      status: "Available",
      moderationStatus: "Approved",
    };
    const [selected, recommendations] = await Promise.all([
      uniqueIds.length
        ? prisma.property.findMany({
            where: { ...commonWhere, id: { in: uniqueIds } },
            include: { owner: true },
          })
        : Promise.resolve([]),
      prisma.property.findMany({
        where: commonWhere,
        include: { owner: true },
        orderBy: [{ featured: "desc" }, { verified: "desc" }, { rating: "desc" }, { id: "asc" }],
        take,
      }),
    ]);
    const selectedById = new Map(selected.map((property) => [property.id, property]));
    const orderedSelected = uniqueIds.flatMap((id) => {
      const property = selectedById.get(id);
      return property ? [property] : [];
    });
    return [...orderedSelected, ...recommendations].filter(
      (property, index, properties) =>
        properties.findIndex((candidate) => candidate.id === property.id) === index,
    ).slice(0, take);
  }

  static async create(data: Omit<Property, "id" | "rating" | "verified" | "featured">) {
    return prisma.property.create({
      data: {
        ...data,
        rating: 4.5,
        verified: true,
      },
    });
  }

  static async update(id: string, data: Partial<Omit<Property, "id">>) {
    return prisma.property.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.property.delete({
      where: { id },
    });
  }

  static async getDashboardStats() {
    const totalCount = await prisma.property.count();
    const activeListings = await prisma.property.count({ where: { status: "Available" } });
    const rentedListings = await prisma.property.count({ where: { status: "Rented" } });
    const occupancyRate = totalCount > 0 ? (rentedListings / totalCount) * 100 : 0;
    
    return {
      totalCount,
      activeListings,
      occupancyRate,
      rentedListings,
    };
  }
}
import "server-only";
