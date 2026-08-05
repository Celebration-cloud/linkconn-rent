import type {
  ApplicationStatus,
  Prisma,
  VerificationSubmissionType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { canTransitionApplication } from "@/lib/application-lifecycle";
import type {
  PropertyDraftInput,
  PropertyFeesInput,
  PropertySearchInput,
  VerificationDraftInput,
} from "@/schemas/operating-system";
import { getNormalizedTypes } from "@/utils/property-search";
import { createApproximateCoordinates } from "@/utils/public-coordinates";

const profileCard = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    avatar: true,
    verificationLevel: true,
  },
} satisfies Prisma.ProfileDefaultArgs;

function buildPropertyWhere(filters: PropertySearchInput): Prisma.PropertyWhereInput {
  const types = getNormalizedTypes(filters);
  return {
    status: "Available",
    moderationStatus: "Approved",
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { location: { contains: filters.q, mode: "insensitive" } },
            { city: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.location
      ? {
          AND: {
            OR: [
              { location: { contains: filters.location, mode: "insensitive" } },
              { city: { contains: filters.location, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    ...(types.length ? { type: { in: types, mode: "insensitive" } } : {}),
    ...(filters.period ? { period: filters.period } : {}),
    ...(filters.amenities?.length
      ? { amenities: { hasEvery: filters.amenities } }
      : {}),
    ...(filters.verified !== undefined ? { verified: filters.verified } : {}),
    ...(filters.bedrooms !== undefined
      ? { bedrooms: { gte: filters.bedrooms } }
      : {}),
    ...(filters.bathrooms !== undefined
      ? { bathrooms: { gte: filters.bathrooms } }
      : {}),
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

export class OperatingSystemRepository {
  static async searchProperties(filters: PropertySearchInput) {
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

  static countProperties(filters: PropertySearchInput) {
    return prisma.property.count({ where: buildPropertyWhere(filters) });
  }

  static async listSavedPropertyIds(profileId: string) {
    const saved = await prisma.savedProperty.findMany({
      where: { profileId },
      select: { propertyId: true },
      orderBy: { createdAt: "desc" },
    });
    return saved.map((item) => item.propertyId);
  }

  static async saveProperty(profileId: string, propertyId: string) {
    return prisma.savedProperty.upsert({
      where: { profileId_propertyId: { profileId, propertyId } },
      update: {},
      create: { profileId, propertyId },
      include: { property: true },
    });
  }

  static async removeSavedProperty(profileId: string, propertyId: string) {
    return prisma.savedProperty.deleteMany({ where: { profileId, propertyId } });
  }

  static async createApplication(
    tenantId: string,
    propertyId: string,
    message?: string,
  ) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "Available" },
      select: { id: true, ownerId: true },
    });
    if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
    if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");

    return prisma.application.upsert({
      where: { propertyId_tenantId: { propertyId, tenantId } },
      update: { message },
      create: { tenantId, propertyId, message },
      include: { property: true },
    });
  }

  static listLandlordApplications(landlordId: string) {
    return prisma.application.findMany({
      where: { property: { ownerId: landlordId } },
      include: { tenant: profileCard, property: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async decideApplication(
    landlordId: string,
    applicationId: string,
    status: ApplicationStatus,
  ) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, property: { ownerId: landlordId } },
    });
    if (!application) throw new Error("NOT_FOUND");
    if (!canTransitionApplication(application.status, status)) {
      throw new Error("INVALID_TRANSITION");
    }
    return prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: { tenant: profileCard, property: true },
    });
  }

  static async createViewing(
    tenantId: string,
    propertyId: string,
    scheduledAt: Date,
    note?: string,
  ) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "Available" },
      select: { ownerId: true },
    });
    if (!property) throw new Error("PROPERTY_NOT_AVAILABLE");
    if (property.ownerId === tenantId) throw new Error("OWN_PROPERTY");
    return prisma.viewing.create({
      data: {
        tenantId,
        landlordId: property.ownerId,
        propertyId,
        scheduledAt,
        note,
      },
      include: { property: true },
    });
  }

  static async createOrFindConversation(
    tenantId: string,
    propertyId: string,
    applicationId?: string,
  ) {
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
      data: {
        tenantId,
        landlordId: property.ownerId,
        propertyId,
        applicationId,
      },
    });
  }

  static listConversations(profileId: string) {
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
            messages: {
              where: { readAt: null, senderId: { not: profileId } },
            },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  static async listMessages(
    profileId: string,
    conversationId: string,
    cursor?: Date,
    limit = 40,
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ tenantId: profileId }, { landlordId: profileId }],
      },
      select: { id: true },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: cursor } } : {}),
      },
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

  static async sendMessage(
    profileId: string,
    conversationId: string,
    body: string,
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ tenantId: profileId }, { landlordId: profileId }],
      },
    });
    if (!conversation) throw new Error("NOT_FOUND");
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: { conversationId, senderId: profileId, body },
        include: { sender: profileCard },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: message.createdAt },
      });
      return message;
    });
  }

  static async archiveConversation(profileId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ tenantId: profileId }, { landlordId: profileId }],
      },
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
        data: {
          ...data,
          ...publicCoordinates,
          status: publish ? "Available" : "Draft",
        },
      });
    }
    return prisma.property.create({
      data: {
        ...data,
        ...publicCoordinates,
        ownerId,
        status: publish ? "Available" : "Draft",
      },
    });
  }

  static async updateFees(
    ownerId: string,
    propertyId: string,
    fees: PropertyFeesInput,
  ) {
    const result = await prisma.property.updateMany({
      where: { id: propertyId, ownerId },
      data: fees,
    });
    if (!result.count) throw new Error("NOT_FOUND");
    return prisma.property.findUnique({ where: { id: propertyId } });
  }

  static listVerificationSubmissions(ownerId: string) {
    return prisma.verificationSubmission.findMany({
      where: { ownerId },
      include: { documents: true, property: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async saveVerificationDraft(
    ownerId: string,
    input: VerificationDraftInput,
    canSubmit: boolean,
  ) {
    if (input.submit && !canSubmit) throw new Error("STORAGE_DISABLED");
    if (input.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: input.propertyId, ownerId },
        select: { id: true },
      });
      if (!property) throw new Error("NOT_FOUND");
    }
    const data = {
      type: input.type as VerificationSubmissionType,
      propertyId: input.propertyId,
      documentType: input.documentType,
      note: input.note,
      status: input.submit ? ("Pending" as const) : ("Draft" as const),
      submittedAt: input.submit ? new Date() : null,
    };
    if (input.id) {
      const owned = await prisma.verificationSubmission.findFirst({
        where: { id: input.id, ownerId },
        select: { id: true },
      });
      if (!owned) throw new Error("NOT_FOUND");
      return prisma.verificationSubmission.update({
        where: { id: input.id },
        data: {
          ...data,
          documents: {
            deleteMany: {},
            create: input.documents,
          },
        },
        include: { documents: true },
      });
    }
    return prisma.verificationSubmission.create({
      data: {
        ownerId,
        ...data,
        documents: { create: input.documents },
      },
      include: { documents: true },
    });
  }
}
