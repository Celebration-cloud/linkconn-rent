import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    // Replace with your Termii API key
    const res = await fetch("https://api.ng.termii.com/api/sms/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        message_type: "NUMERIC",
        to: phone.toString().replace(/^0/, "234"), // ensure correct country format
        from: "Linkconn",
        channel: "generic", // back to normal SMS
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
}
