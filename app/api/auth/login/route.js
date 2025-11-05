import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/zodSchemas";
import { supabaseServer } from "@/lib/superbaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { email, password, role } = parsed.data;

    const { data: baseUser, error: baseErr } = await supabaseServer
      .from("users")
      .select(
        "id, email, password, role, ref_id, onboarded, verification_status, profile_pic, verified"
      )
      .eq("email", email)
      .eq("role", role)
      .maybeSingle();

    if (baseErr || !baseUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, baseUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Fetch role-specific info
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
          email: baseUser.email,
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
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
