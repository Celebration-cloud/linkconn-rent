import type { AppRole, ViewingStatus } from "@prisma/client";
import { z } from "zod";

export const VIEWING_ACTIONS = ["confirm", "reschedule", "accept_reschedule", "complete", "cancel"] as const;
export type ViewingAction = (typeof VIEWING_ACTIONS)[number];

export function getViewingActions(role: AppRole, status: ViewingStatus): ViewingAction[] {
  if (role === "Tenant") {
    if (status === "Rescheduled") return ["accept_reschedule", "cancel"];
    if (status === "Requested" || status === "Confirmed") return ["cancel"];
    return [];
  }
  if (role !== "Landlord" && role !== "PropertyManager") return [];
  if (status === "Requested") return ["confirm", "reschedule", "cancel"];
  if (status === "Rescheduled") return ["reschedule", "cancel"];
  if (status === "Confirmed") return ["reschedule", "complete", "cancel"];
  return [];
}

const base = { expectedStatus: z.enum(["Requested", "Confirmed", "Rescheduled"]), idempotencyKey: z.string().trim().min(8).max(100) };
export const viewingMutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("confirm"), ...base }),
  z.object({ action: z.literal("accept_reschedule"), expectedStatus: z.literal("Rescheduled"), idempotencyKey: base.idempotencyKey }),
  z.object({ action: z.literal("complete"), expectedStatus: z.literal("Confirmed"), idempotencyKey: base.idempotencyKey }),
  z.object({ action: z.literal("reschedule"), ...base, scheduledAt: z.coerce.date().refine((value) => value.getTime() > Date.now(), "Viewing time must be in the future"), reason: z.string().trim().min(5).max(500).optional() }),
  z.object({ action: z.literal("cancel"), ...base, reason: z.string().trim().min(5).max(500) }),
]);
export type ViewingMutationInput = z.infer<typeof viewingMutationSchema>;

export type ViewingListItem = { id: string; status: ViewingStatus; scheduledAt: string; property: { id: string; title: string; location: string }; participant: { name: string }; createdAt: string };
export type ViewingDetail = ViewingListItem & { note: string | null; tenant: { id: string; name: string }; landlord: { id: string; name: string }; actions: ViewingAction[]; timeline: Array<{ id: string; fromStatus: ViewingStatus | null; toStatus: ViewingStatus | null; note: string | null; actorName: string; createdAt: string }> };
