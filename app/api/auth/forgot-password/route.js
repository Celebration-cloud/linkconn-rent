import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { forgotPasswordSchema } from "@/lib/zodSchemas";

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function POST(req) {
  let email;

  try {
    const formData = await req.formData();
    const rawEmail = formData.get("email");

    const parsed = forgotPasswordSchema.parse({ email: rawEmail });

    email = parsed.email;
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const send = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    console.log("Password reset email sent to:", send);
  } catch (err) {
    // swallow error on purpose
    console.log("Error sending password reset email:", err);
  }

  return NextResponse.json(
    {
      message:
        "If an account exists with this email, a password reset link has been sent.",
    },
    { status: 200 },
  );
}
