import { prisma } from "@/lib/db/client";
import type { SupportTicketInput } from "@/schemas/operating-system";

function createReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const token = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `LCR-${date}-${token}`;
}

export class SupportRepository {
  static create(profile: { id: string; firstName: string; lastName: string; email: string }, input: SupportTicketInput) {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          category: input.category,
          subject: input.subject,
          message: input.message,
          profileId: profile.id,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          email: profile.email,
          reference: createReference(),
        },
        select: { id: true, reference: true, status: true, createdAt: true },
      });
      await tx.supportTicketActivity.create({ data: { ticketId: ticket.id, actorId: profile.id, toStatus: "Open", note: "Support request created" } });
      return ticket;
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

  static detailForProfile(profileId: string, id: string) {
    return prisma.supportTicket.findFirst({
      where: { id, profileId },
      select: {
        id: true, reference: true, category: true, subject: true, message: true, status: true, createdAt: true, updatedAt: true,
        assignedTo: { select: { firstName: true, lastName: true } },
        activities: { orderBy: { createdAt: "asc" }, select: { id: true, fromStatus: true, toStatus: true, note: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } } },
      },
    });
  }
}
import "server-only";
