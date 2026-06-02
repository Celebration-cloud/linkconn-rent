import { NextResponse } from "next/server";

export async function POST(req) {
  try {
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
}
