import "server-only";

import type { Prisma } from "@prisma/client";
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

export class ConversationRepository {
  static async createOrFind(tenantId: string, propertyId: string, applicationId?: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });
    if (!property) throw new Error("NOT_FOUND");
    if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
    const conversation = await prisma.conversation.upsert({
      where: { tenantId_landlordId_propertyId: { tenantId, landlordId: property.ownerId, propertyId } },
      update: applicationId ? { applicationId } : {},
      create: { tenantId, landlordId: property.ownerId, propertyId, applicationId },
      select: { id: true, propertyId: true, applicationId: true, leaseId: true, tenantId: true, landlordId: true, lastMessageAt: true },
    });
    return { ...conversation, lastMessageAt: conversation.lastMessageAt.toISOString() };
  }

  static async list(profileId: string) {
    const rows = await prisma.conversation.findMany({
      where: {
        OR: [
          { tenantId: profileId, archivedByTenant: false },
          { landlordId: profileId, archivedByLandlord: false },
        ],
      },
      select: {
        id: true, tenantId: true, landlordId: true, lastMessageAt: true,
        property: { select: { id: true, title: true, location: true } },
        tenant: profileCard,
        landlord: profileCard,
        application: { select: { id: true, status: true } },
        lease: { select: { id: true } },
        messages: { select: { id: true, body: true, senderId: true, readAt: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: { where: { readAt: null, senderId: { not: profileId } } },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    return rows.map((row) => ({ ...row, lastMessageAt: row.lastMessageAt.toISOString(), messages: row.messages.map((message) => ({ ...message, readAt: message.readAt?.toISOString() ?? null, createdAt: message.createdAt.toISOString() })) }));
  }

  static async listMessages(profileId: string, conversationId: string, cursor?: Date, limit = 40) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ tenantId: profileId }, { landlordId: profileId }] },
      select: { id: true },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    const messages = await prisma.message.findMany({
      where: { conversationId, ...(cursor ? { createdAt: { lt: cursor } } : {}) },
      select: { id: true, senderId: true, type: true, body: true, attachmentName: true, attachmentUrl: true, readAt: true, createdAt: true, sender: profileCard },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: profileId }, readAt: null },
      data: { readAt: new Date() },
    });
    return messages.reverse().map((message) => ({ ...message, readAt: message.readAt?.toISOString() ?? null, createdAt: message.createdAt.toISOString() }));
  }

  static async sendMessage(profileId: string, conversationId: string, body: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ tenantId: profileId }, { landlordId: profileId }] },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    return prisma.$transaction(async (transaction) => {
      const message = await transaction.message.create({
        data: { conversationId, senderId: profileId, body },
        include: { sender: profileCard },
      });
      await transaction.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: message.createdAt },
      });
      const recipientId = conversation.tenantId === profileId
        ? conversation.landlordId
        : conversation.tenantId;
      await transaction.notification.create({
        data: {
          profileId: recipientId,
          kind: "Message",
          title: "New message",
          body: body.length > 120 ? `${body.slice(0, 117)}…` : body,
          href: `/messages?conversation=${conversationId}`,
          idempotencyKey: `message:${message.id}:notification`,
        },
      });
      return { id: message.id, senderId: message.senderId, type: message.type, body: message.body, attachmentName: message.attachmentName, attachmentUrl: message.attachmentUrl, readAt: message.readAt?.toISOString() ?? null, createdAt: message.createdAt.toISOString(), sender: message.sender };
    });
  }

  static async archive(profileId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ tenantId: profileId }, { landlordId: profileId }] },
      select: { tenantId: true, landlordId: true },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    return prisma.conversation.update({
      where: { id: conversationId },
      data:
        conversation.tenantId === profileId
          ? { archivedByTenant: true }
          : { archivedByLandlord: true },
    });
  }
}
