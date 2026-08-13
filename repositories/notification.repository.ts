import "server-only";

import { prisma } from "@/lib/db/client";
import type { NotificationCenterData } from "@/features/notifications/contracts";

export class NotificationRepository {
  static async list(profileId: string, limit = 20): Promise<NotificationCenterData> {
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { profileId },
        select: { id: true, kind: true, title: true, body: true, href: true, readAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { profileId, readAt: null } }),
    ]);
    return {
      unreadCount,
      items: items.map((item) => ({ ...item, readAt: item.readAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() })),
    };
  }

  static async markRead(profileId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, profileId, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count === 0) {
      const exists = await prisma.notification.findFirst({ where: { id: notificationId, profileId }, select: { id: true } });
      if (!exists) throw new Error("NOT_FOUND");
    }
    return prisma.notification.findFirst({ where: { id: notificationId, profileId }, select: { id: true, readAt: true } });
  }

  static markAllRead(profileId: string) {
    return prisma.notification.updateMany({ where: { profileId, readAt: null }, data: { readAt: new Date() } });
  }

  static unreadCount(profileId: string) {
    return prisma.notification.count({ where: { profileId, readAt: null } });
  }
}
