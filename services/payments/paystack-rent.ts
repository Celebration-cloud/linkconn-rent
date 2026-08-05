interface PaystackEnvelope<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializationData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerificationData {
  status: string;
  reference: string;
  amount: number;
  metadata?: { paymentId?: string };
}

function secretKey() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("PAYSTACK_NOT_CONFIGURED");
  return value;
}

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const result = (await response.json()) as PaystackEnvelope<T>;
  if (!response.ok || !result.status) throw new Error(result.message || "PAYSTACK_ERROR");
  return result.data;
}

export function initializeRentPayment(input: {
  email: string;
  amount: number;
  reference: string;
  paymentId: string;
  callbackUrl: string;
  channel: "card" | "bank" | "ussd";
}) {
  return paystackRequest<InitializationData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: [input.channel],
      metadata: { paymentId: input.paymentId, purpose: "rent-payment" },
    }),
  });
}

export function verifyRentPayment(reference: string) {
  return paystackRequest<VerificationData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

