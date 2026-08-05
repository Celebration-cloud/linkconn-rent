import { prisma } from "../lib/db/client";
import type { Profile, AppRole } from "@prisma/client";

export class UserRepository {
  static async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        properties: true,
        applications: true,
        maintenance: true,
        payments: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email },
      include: {
        properties: true,
        applications: true,
        maintenance: true,
        payments: true,
      },
    });
  }

  static async create(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: AppRole;
    avatar?: string;
    onboardingComplete?: boolean;
  }) {
    return prisma.profile.create({
      data: {
        ...data,
        verificationLevel: "PartiallyVerified",
      },
    });
  }

  static async update(id: string, data: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>) {
    return prisma.profile.update({
      where: { id },
      data,
    });
  }

  static async listAll() {
    return prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
