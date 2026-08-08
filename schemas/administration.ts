import { z } from "zod";

export const queueFiltersSchema = z.object({
  status: z.enum(["Draft", "Pending", "Approved", "Rejected", "Open", "Investigating", "Resolved", "Dismissed", "Active", "Restricted", "Suspended", "PendingReview", "Flagged", "Removed", "Paid", "Due", "Overdue", "Processing", "Failed"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  query: z.string().trim().max(120).optional(),
  role: z.enum(["Tenant", "Landlord", "PropertyManager", "Moderator", "Admin", "SuperAdmin"]).optional(),
  targetType: z.enum(["Verification", "Dispute", "User", "Property", "Payment", "Maintenance", "AdminInvitation"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminQueueFilters = z.infer<typeof queueFiltersSchema>;

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
