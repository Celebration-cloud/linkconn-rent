import { z } from "zod";

export const queueFiltersSchema = z.object({
  status: z.enum(["Draft", "Pending", "Approved", "Rejected", "NeedsChanges", "Open", "Investigating", "Resolved", "Dismissed", "Active", "Restricted", "Suspended", "PendingReview", "Flagged", "Removed", "Paid", "Due", "Overdue", "Processing", "Failed", "InProgress", "WaitingOnCustomer", "Completed", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  query: z.string().trim().max(120).optional(),
  role: z.enum(["Tenant", "Landlord", "PropertyManager", "Moderator", "Admin", "SuperAdmin"]).optional(),
  targetType: z.enum(["Verification", "Dispute", "User", "Property", "Payment", "Maintenance", "Support", "AdminInvitation"]).optional(),
  assignee: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  sort: z.enum(["newest", "oldest", "priority"]).default("newest"),
  item: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminQueueFilters = z.infer<typeof queueFiltersSchema>;

const verificationFindingSchema = z.object({
  key: z.enum(["identity_match", "document_validity", "profile_consistency", "ownership_evidence", "property_match"]),
  status: z.enum(["Approved", "NeedsChanges"]),
  note: z.string().trim().min(2).max(1000).optional(),
});

const verificationDecisionBase = z.object({
  reason: z.string().trim().min(8).max(1000),
  notes: z.string().trim().max(2000).optional(),
  findings: z.array(verificationFindingSchema).min(1).max(5),
});

export const verificationReviewSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign") }),
  verificationDecisionBase.extend({ action: z.enum(["approve", "reject"]) }),
  verificationDecisionBase.extend({
    action: z.literal("request_changes"),
    correctionInstructions: z.string().trim().min(12).max(2000),
  }),
]);

export type VerificationReviewInput = z.infer<typeof verificationReviewSchema>;

export const verificationRouteParamsSchema = z.object({
  id: z.string().uuid(),
});

export const disputeCreateSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(20).max(5000),
  category: z.enum(["Payment", "Listing", "Fraud", "Harassment", "Identity", "Other"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  propertyId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
});

export const disputeActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign") }),
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

export const supportTicketActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign") }),
  z.object({
    action: z.literal("status"),
    status: z.enum(["Open", "InProgress", "WaitingOnCustomer", "Resolved", "Closed"]),
    reason: z.string().trim().min(8).max(1000),
  }),
  z.object({
    action: z.literal("note"),
    note: z.string().trim().min(2).max(3000),
  }),
]);

export const maintenanceAdminActionSchema = z.object({
  status: z.enum(["Pending", "InProgress", "Completed", "Closed"]),
  reason: z.string().trim().min(8).max(1000),
});
