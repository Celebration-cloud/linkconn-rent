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
          { verified: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      const { pinId, pin } = await req.json();

      const res = await fetch("https://api.ng.termii.com/api/sms/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TERMII_API_KEY,
          pin_id: pinId,
          pin,
        }),
      });

      const data = await res.json();

      if (data.verified === true) {
        return NextResponse.json({ verified: true });
      }

      return NextResponse.json({ verified: false, error: "Invalid code" });
    } catch (err) {
      console.error("OTP verify failed:", err);

      return NextResponse.json(
        { verified: false, error: err.message },
        { status: 500 },
      );
    }
  },
  {
    max: 10,
    windowMs: 60000,
    message: "Too many verification attempts. Please wait.",
  },
);

export async function POST(req) {
  return rateLimitedPost(req);
}
