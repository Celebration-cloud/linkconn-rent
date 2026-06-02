import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/zodSchemas";
import { supabaseServer } from "@/lib/superbaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { email, password, role } = parsed.data;

    console.log("Login attempt for:", email, "as", role);

    // 1️⃣ Sign in via Supabase Auth
    const { data: sessionData, error: sessionError } =
      await supabaseServer.auth.signInWithPassword({ email, password });

    if (sessionError || !sessionData.user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const authUserId = sessionData.user.id;

    // 2️⃣ Fetch metadata from public users table
    const { data: baseUser, error: baseErr } = await supabaseServer
      .from("users")
      .select(
        "id, auth_id, role, ref_id, onboarded, verification_status, profile_pic, verified",
      )
      .eq("auth_id", authUserId)
      .maybeSingle();

    if (baseErr || !baseUser) {
      return NextResponse.json(
        { error: "User not found: ", baseErr },
        { status: 404 },
      );
    }

    if (baseUser?.role !== role) {
      return NextResponse.json({ error: `Role mismatch` }, { status: 403 });
    }

    // 3️⃣ Fetch role-specific info
    const { data: roleData } = await supabaseServer
      .from(`${role}s`)
      .select("full_name, address")
      .eq("id", baseUser.ref_id)
      .maybeSingle();

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: baseUser.id,
          email,
          role: baseUser.role,
          refId: baseUser.ref_id,
          fullName: roleData?.full_name,
          address: roleData?.address,
          profilePic: baseUser.profile_pic,
          onboarded: baseUser.onboarded,
          verified: baseUser.verified,
          verificationStatus: baseUser.verification_status,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
