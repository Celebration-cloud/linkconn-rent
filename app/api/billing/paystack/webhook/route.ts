import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, message: "Webhook secret unconfigured" }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature" }, { status: 401 });
    }

    const hash = createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as { event: string; data?: Record<string, unknown> };

    // Acknowledge receipt of the webhook event
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      data: { event: event.event },
    });
  } catch (error) {
    console.error("[POST /api/billing/paystack/webhook]", error);
    return NextResponse.json({ success: false, message: "Failed to process webhook" }, { status: 500 });
  }
}
