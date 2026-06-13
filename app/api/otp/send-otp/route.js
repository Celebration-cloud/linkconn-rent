import { NextResponse } from "next/server";

import { withRateLimit } from "@/lib/rateLimiter";
import { assertSameOrigin } from "@/lib/security/request";
import { auth } from "@/lib/auth/server";

const rateLimitedPost = withRateLimit(
  async (req) => {
    try {
      const originError = assertSameOrigin(req);
      if (originError) return originError;

      const session = await auth.getSession({ headers: req.headers });
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      const { phone } = await req.json();

      const res = await fetch("https://api.ng.termii.com/api/sms/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TERMII_API_KEY,
          message_type: "NUMERIC",
          to: phone.toString().replace(/^0/, "234"),
          from: "Linkconn",
          channel: "generic",
          pin_attempts: 3,
          pin_time_to_live: 5,
          pin_length: 6,
          pin_placeholder: "<123456>",
          message_text:
            "Your Linkconn verification code is <123456>. Do not share it with anyone.",
        }),
      });

      const data = await res.json();

      return NextResponse.json({ success: true, pinId: data.pinId });
    } catch (err) {
      console.error("OTP send failed:", err);

      return NextResponse.json(
        { success: false, error: err.message },
        { status: 500 },
      );
    }
  },
  { max: 5, windowMs: 60000, message: "Too many OTP requests. Please wait." },
);

export async function POST(req) {
  return rateLimitedPost(req);
}
