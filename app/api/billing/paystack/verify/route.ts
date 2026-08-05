import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  reference: z.string().min(1, "Reference is required"),
});

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse({ reference: req.nextUrl.searchParams.get("reference") });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Missing transaction reference" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${parsed.data.reference}`, {
      headers: {
        Authorization: `Bearer ${requiredEnv("PAYSTACK_SECRET_KEY")}`,
      },
    });

    const payload = (await response.json()) as {
      status: boolean;
      message?: string;
      data?: { status?: string; reference?: string; amount?: number };
    };

    if (!response.ok || !payload.status || !payload.data) {
      return NextResponse.json(
        { success: false, message: payload.message || "Unable to verify payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      data: payload.data,
    });
  } catch (error) {
    console.error("[GET /api/billing/paystack/verify]", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
