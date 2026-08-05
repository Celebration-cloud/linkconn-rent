import { z } from "zod";

export const billingPeriodSchema = z.enum(["monthly", "annual"]);

export const signupRoleSchema = z.enum(["Tenant", "Landlord"]);

export const planKeySchema = z.enum([
  "tenant-standard",
  "tenant-premium",
  "landlord-standard",
  "landlord-featured",
  "landlord-agency",
]);

export const signupFlowSchema = z.object({
  role: signupRoleSchema,
  planKey: planKeySchema,
  billingPeriod: billingPeriodSchema,
});

export type SignupFlowData = z.infer<typeof signupFlowSchema>;
