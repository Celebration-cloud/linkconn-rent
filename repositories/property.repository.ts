import { prisma } from "../lib/db/client";
import type { Prisma, Property } from "@prisma/client";

export class PropertyRepository {
  static async findById(id: string) {
    return prisma.property.findFirst({
      where: { id, status: "Available", moderationStatus: "Approved" },
      include: { owner: true },
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
