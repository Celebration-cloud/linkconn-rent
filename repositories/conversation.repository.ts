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
    const existing = await prisma.conversation.findFirst({
      where: { tenantId, landlordId: property.ownerId, propertyId },
    });
    if (existing) return existing;
    return prisma.conversation.create({
      data: { tenantId, landlordId: property.ownerId, propertyId, applicationId },
    });
  }

  static list(profileId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { tenantId: profileId, archivedByTenant: false },
          { landlordId: profileId, archivedByLandlord: false },
        ],
      },
      include: {
        property: true,
        tenant: profileCard,
        landlord: profileCard,
        application: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: { where: { readAt: null, senderId: { not: profileId } } },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  static async listMessages(profileId: string, conversationId: string, cursor?: Date, limit = 40) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ tenantId: profileId }, { landlordId: profileId }] },
      select: { id: true },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    const messages = await prisma.message.findMany({
      where: { conversationId, ...(cursor ? { createdAt: { lt: cursor } } : {}) },
      include: { sender: profileCard },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: profileId }, readAt: null },
      data: { readAt: new Date() },
    });
    return messages.reverse();
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
      return message;
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
