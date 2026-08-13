import type { AppRole, ApplicationStatus } from "@prisma/client";
import { z } from "zod";

export const APPLICATION_ACTIONS = ["shortlist", "accept", "decline", "withdraw"] as const;
export type ApplicationAction = (typeof APPLICATION_ACTIONS)[number];

export function getApplicationActions(role: AppRole, status: ApplicationStatus): ApplicationAction[] {
  if (role === "Tenant") return status === "Pending" || status === "Shortlisted" ? ["withdraw"] : [];
  if (role !== "Landlord" && role !== "PropertyManager") return [];
  if (status === "Pending") return ["shortlist", "accept", "decline"];
  if (status === "Shortlisted") return ["accept", "decline"];
  return [];
}

const applicationActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("shortlist"), expectedStatus: z.literal("Pending"), idempotencyKey: z.string().trim().min(8).max(100) }),
  z.object({ action: z.literal("accept"), expectedStatus: z.enum(["Pending", "Shortlisted"]), idempotencyKey: z.string().trim().min(8).max(100) }),
  z.object({ action: z.literal("decline"), expectedStatus: z.enum(["Pending", "Shortlisted"]), reason: z.string().trim().min(10).max(500), idempotencyKey: z.string().trim().min(8).max(100) }),
  z.object({ action: z.literal("withdraw"), expectedStatus: z.enum(["Pending", "Shortlisted"]), reason: z.string().trim().max(500).optional(), idempotencyKey: z.string().trim().min(8).max(100) }),
]);

export const applicationMutationSchema = applicationActionSchema;
export type ApplicationMutationInput = z.infer<typeof applicationMutationSchema>;

export type ApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  property: { id: string; title: string; location: string };
  participant: { name: string; verificationLevel: string };
  createdAt: string;
  updatedAt: string;
};

export type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  property: { id: string; title: string; location: string; city: string; price: number; period: string };
  tenant: { id: string; name: string; verificationLevel: string };
  landlord: { id: string; name: string; verificationLevel: string };
  conversation: { id: string; href: string } | null;
  leaseId: string | null;
  createdAt: string;
  updatedAt: string;
  actions: ApplicationAction[];
  timeline: Array<{ id: string; fromStatus: ApplicationStatus | null; toStatus: ApplicationStatus | null; note: string | null; actorName: string; createdAt: string }>;
};
