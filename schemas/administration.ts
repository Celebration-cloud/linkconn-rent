import { z } from "zod";

export const queueFiltersSchema = z.object({
  status: z.string().trim().max(40).optional(),
  priority: z.string().trim().max(40).optional(),
  query: z.string().trim().max(120).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const verificationReviewSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign"), assigneeId: z.string().min(1) }),
  z.object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().min(8).max(1000),
    notes: z.string().trim().max(2000).optional(),
  }),
]);

export const disputeCreateSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(20).max(5000),
  category: z.enum(["Payment", "Listing", "Fraud", "Harassment", "Identity", "Other"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  propertyId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
});

export const disputeActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign"), assigneeId: z.string().min(1) }),
  z.object({ action: z.literal("investigate"), reason: z.string().trim().min(8).max(1000) }),
  z.object({
    action: z.enum(["resolve", "dismiss"]),
    reason: z.string().trim().min(8).max(1000),
  }),
  z.object({
    action: z.literal("note"),
    body: z.string().trim().min(2).max(3000),
    internal: z.boolean().default(true),
  }),
]);

export const userModerationSchema = z.object({
  status: z.enum(["Active", "Restricted", "Suspended"]),
  reason: z.string().trim().min(8).max(1000),
});

export const listingModerationSchema = z.object({
  status: z.enum(["Approved", "Flagged", "Removed"]),
  reason: z.string().trim().min(8).max(1000),
});

