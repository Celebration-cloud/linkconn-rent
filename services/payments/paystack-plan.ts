import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type {
  AccountPlanPaymentMetadata,
  AccountPlanTransaction,
} from "@/domain/billing";
import {
  billingPeriodSchema,
  planKeySchema,
  signupRoleSchema,
} from "@/schemas/billing";

const initializationSchema = z.object({
  authorization_url: z.string().url(),
  access_code: z.string().min(1),
  reference: z.string().min(1),
});

const verificationSchema = z.object({
  status: z.string(),
  reference: z.string().min(1),
  amount: z.number().int().nonnegative(),
  currency: z.string(),
  customer: z.object({ email: z.string().email() }),
  metadata: z.object({
    purpose: z.literal("account-plan"),
    profileId: z.string().min(1),
    role: signupRoleSchema,
    planKey: planKeySchema,
    billingPeriod: billingPeriodSchema,
  }),
});

const webhookSchema = z.object({
  event: z.literal("charge.success"),
  data: verificationSchema,
});

type PaystackEnvelope = {
  status?: boolean;
  message?: string;
  data?: unknown;
};

function secretKey() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("PAYSTACK_NOT_CONFIGURED");
  return value;
}

async function paystackRequest(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as PaystackEnvelope;
  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message || "PAYSTACK_ERROR");
  }
  return payload.data;
}

export async function initializeAccountPlanPayment(input: {
  email: string;
  amountMinor: number;
  reference: string;
  callbackUrl: string;
  metadata: AccountPlanPaymentMetadata;
}) {
  const data = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinor,
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: "NGN",
      metadata: input.metadata,
    }),
  });
  return initializationSchema.parse(data);
}

export async function verifyAccountPlanPayment(
  reference: string,
): Promise<AccountPlanTransaction> {
  const data = verificationSchema.parse(
    await paystackRequest(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    ),
  );
  return {
    status: data.status,
    reference: data.reference,
    amount: data.amount,
    currency: data.currency,
    customerEmail: data.customer.email,
    metadata: data.metadata,
  };
}

export function hasValidPaystackSignature(body: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(body).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

export function parseAccountPlanWebhook(body: string): AccountPlanTransaction | null {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return null;
  }
  const parsed = webhookSchema.safeParse(payload);
  if (!parsed.success) return null;
  return {
    status: parsed.data.data.status,
    reference: parsed.data.data.reference,
    amount: parsed.data.data.amount,
    currency: parsed.data.data.currency,
    customerEmail: parsed.data.data.customer.email,
    metadata: parsed.data.data.metadata,
  };
}
