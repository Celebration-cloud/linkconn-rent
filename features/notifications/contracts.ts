import type { NotificationKind } from "@prisma/client";
import { z } from "zod";

export const notificationMutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark_read"), notificationId: z.string().uuid() }),
  z.object({ action: z.literal("mark_all_read") }),
]);

export type NotificationItem = { id: string; kind: NotificationKind; title: string; body: string; href: string; readAt: string | null; createdAt: string };
export type NotificationCenterData = { items: NotificationItem[]; unreadCount: number };
