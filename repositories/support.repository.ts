import { prisma } from "@/lib/db/client";
import type { SupportTicketInput } from "@/schemas/operating-system";

function createReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const token = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `LCR-${date}-${token}`;
}

export class SupportRepository {
  static create(input: SupportTicketInput, profileId?: string) {
    return prisma.supportTicket.create({
      data: {
        ...input,
        profileId,
        reference: createReference(),
      },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
      },
    });
  }

  static listForProfile(profileId: string) {
    return prisma.supportTicket.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        category: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
