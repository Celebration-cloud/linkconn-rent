import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneyMinor = z.number().int().nonnegative();
const person = z.object({ id: z.string().min(1), name: z.string().trim().min(2).max(160) });

const leaseEditableTermsObject = z.object({
  startDate: isoDate,
  endDate: isoDate,
  rentMinor: moneyMinor,
  currency: z.literal("NGN"),
  billingPeriod: z.enum(["month", "year"]),
  fees: z.array(z.object({ label: z.string().trim().min(2).max(100), amountMinor: moneyMinor })).max(20),
  schedule: z.array(z.object({ sequence: z.number().int().positive(), label: z.string().trim().min(2).max(120), amountMinor: moneyMinor, dueDate: isoDate })).min(1).max(60),
  noticeDays: z.number().int().min(0).max(365),
  renewalTerms: z.string().trim().min(2).max(2000),
  utilities: z.array(z.string().trim().min(2).max(240)).max(30),
  rules: z.array(z.string().trim().min(2).max(240)).max(50),
  specialTerms: z.string().trim().max(5000),
});

function validateLeaseTerms(value: z.infer<typeof leaseEditableTermsObject>, context: z.RefinementCtx) {
  if (value.endDate <= value.startDate) context.addIssue({ code: "custom", path: ["endDate"], message: "Lease end date must follow the start date" });
  const sequences = value.schedule.map((item) => item.sequence);
  if (new Set(sequences).size !== sequences.length) context.addIssue({ code: "custom", path: ["schedule"], message: "Schedule sequences must be unique" });
  const ordered = [...sequences].sort((left, right) => left - right);
  if (ordered.some((sequence, index) => sequence !== index + 1)) {
    context.addIssue({ code: "custom", path: ["schedule"], message: "Payment schedule must start at 1 and remain contiguous" });
  }
}

export const leaseEditableTermsSchema = leaseEditableTermsObject.superRefine(validateLeaseTerms);
export const leaseTermsSchema = leaseEditableTermsObject.extend({
  participants: z.object({ tenant: person, landlord: person }),
  property: z.object({ id: z.string().min(1), title: z.string().trim().min(2), location: z.string().trim().min(2) }),
}).superRefine(validateLeaseTerms);

export const leaseMutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("edit_terms"), expectedVersion: z.number().int().nonnegative(), expectedStatus: z.enum(["Draft", "ChangesRequested"]), terms: leaseEditableTermsSchema }),
  z.object({ action: z.literal("send"), expectedVersion: z.number().int().positive(), expectedStatus: z.literal("Draft") }),
  z.object({ action: z.literal("request_changes"), expectedVersion: z.number().int().positive(), expectedStatus: z.literal("AwaitingAcceptance"), reason: z.string().trim().min(10).max(2000) }),
  z.object({ action: z.enum(["cancel", "terminate", "complete"]), expectedVersion: z.number().int().nonnegative(), expectedStatus: z.enum(["Draft", "AwaitingAcceptance", "ChangesRequested", "AwaitingPayment", "Active"]), reason: z.string().trim().min(10).max(2000) }),
]);

export const leaseAcceptSchema = z.object({
  legalName: z.string().trim().min(2).max(160),
  consentVersion: z.literal("lease-consent-v1"),
  expectedVersion: z.number().int().positive(),
  expectedHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export const leaseRouteParamsSchema = z.object({ id: z.string().uuid() });
export type LeaseTerms = z.infer<typeof leaseTermsSchema>;
export type LeaseEditableTerms = z.infer<typeof leaseEditableTermsSchema>;
export type LeaseAcceptInput = z.infer<typeof leaseAcceptSchema>;
