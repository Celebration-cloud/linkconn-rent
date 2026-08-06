import { prisma } from "@/lib/db/client";
import type { CurrentProfile } from "@/lib/auth/current-profile";
import type { DashboardSnapshot } from "@/domain/types/operating-system";

export class DashboardRepository {
  static async getSnapshot(profile: CurrentProfile): Promise<DashboardSnapshot> {
    const landlord =
      profile.role === "Landlord" || profile.role === "PropertyManager";

    if (landlord) {
      const [properties, applications, viewings, maintenance] =
        await Promise.all([
          prisma.property.findMany({
            where: { ownerId: profile.id },
            select: { id: true, price: true, status: true },
          }),
          prisma.application.findMany({
            where: { property: { ownerId: profile.id } },
            include: {
              tenant: {
                select: { firstName: true, lastName: true },
              },
              property: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          }),
          prisma.viewing.findMany({
            where: { landlordId: profile.id, scheduledAt: { gte: new Date() } },
            include: { property: { select: { title: true } } },
            orderBy: { scheduledAt: "asc" },
            take: 8,
          }),
          prisma.maintenanceRequest.findMany({
            where: {
              property: { ownerId: profile.id },
              status: { in: ["Pending", "InProgress"] },
            },
            include: { property: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
            take: 8,
          }),
        ]);

      const rentable = properties.filter((item) => item.status !== "Draft");
      const rented = rentable.filter((item) => item.status === "Rented").length;
      return {
        portfolioValue: properties.reduce((total, item) => total + item.price, 0),
        occupancyRate: rentable.length ? (rented / rentable.length) * 100 : 0,
        activeListings: properties.filter((item) => item.status === "Available")
          .length,
        pendingApplications: applications.filter(
          (item) =>
            item.status === "Pending" || item.status === "Shortlisted",
        ).length,
        savedHomes: 0,
        openMaintenance: maintenance.length,
        nextPayment: null,
        applications: applications.map((item) => ({
          id: item.id,
          tenantName:
            `${item.tenant.firstName} ${item.tenant.lastName}`.trim() ||
            "Applicant",
          propertyTitle: item.property.title,
          status: item.status,
          score: item.score,
          createdAt: item.createdAt.toISOString(),
        })),
        viewings: viewings.map((item) => ({
          id: item.id,
          propertyTitle: item.property.title,
          participantName: "Tenant",
          scheduledAt: item.scheduledAt.toISOString(),
          status: item.status,
        })),
        maintenance: maintenance.map((item) => ({
          id: item.id,
          title: item.title,
          propertyTitle: item.property.title,
          priority: item.priority,
          status: item.status,
        })),
      };
    }

    const [savedHomes, applications, viewings, maintenance, payment] =
      await Promise.all([
        prisma.savedProperty.count({ where: { profileId: profile.id } }),
        prisma.application.findMany({
          where: { tenantId: profile.id },
          include: {
            tenant: { select: { firstName: true, lastName: true } },
            property: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.viewing.findMany({
          where: { tenantId: profile.id, scheduledAt: { gte: new Date() } },
          include: { property: { select: { title: true } } },
          orderBy: { scheduledAt: "asc" },
          take: 8,
        }),
        prisma.maintenanceRequest.findMany({
          where: {
            requesterId: profile.id,
            status: { in: ["Pending", "InProgress"] },
          },
          include: { property: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.payment.findFirst({
          where: {
            tenantId: profile.id,
            status: { in: ["Due", "Overdue"] },
          },
          orderBy: { dueDate: "asc" },
        }),
      ]);

    return {
      portfolioValue: 0,
      occupancyRate: 0,
      activeListings: 0,
      pendingApplications: applications.filter(
        (item) => item.status === "Pending" || item.status === "Shortlisted",
      ).length,
      savedHomes,
      openMaintenance: maintenance.length,
      nextPayment: payment
        ? { amount: payment.amount, dueDate: payment.dueDate.toISOString() }
        : null,
      applications: applications.map((item) => ({
        id: item.id,
        tenantName:
          `${item.tenant.firstName} ${item.tenant.lastName}`.trim() || "You",
        propertyTitle: item.property.title,
        status: item.status,
        score: item.score,
        createdAt: item.createdAt.toISOString(),
      })),
      viewings: viewings.map((item) => ({
        id: item.id,
        propertyTitle: item.property.title,
        participantName: "Landlord",
        scheduledAt: item.scheduledAt.toISOString(),
        status: item.status,
      })),
      maintenance: maintenance.map((item) => ({
        id: item.id,
        title: item.title,
        propertyTitle: item.property.title,
        priority: item.priority,
        status: item.status,
      })),
    };
  }
}
import "server-only";
