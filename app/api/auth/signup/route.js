import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/superbaseServer";
import { signupSchema } from "@/lib/zodSchemas";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData);

    // Validate input
    const parsed = signupSchema.parse({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      address: data.address,
      profilePic: data.profilePic,
      role: data.role,
      companyName: data.companyName,
      agencyName: data.agencyName,
      preferredLocation: data.preferredLocation,
      budgetRange: data.budgetRange,
      moveInDate: data.moveInDate,
    });

    // 1️⃣ Check if user already exists
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", parsed.email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 2️⃣ Create user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email: parsed.email,
        password: parsed.password,
        email_confirm: true,
      });

    if (authError) throw new Error(authError.message);

    // 3️⃣ Insert into public users table first (metadata)
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .insert([
        {
          auth_id: authUser.user.id,
          email: parsed.email,
          role: parsed.role,
          profile_pic: parsed.profilePic || null,
          onboarded: false,
          verification_status: "pending",
        },
      ])
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    // 4️⃣ Insert role-specific data and link user_id
    const table = parsed.role === "landlord" ? "landlords" : "tenants";

    const rolePayload = {
      user_id: userData.id, // Link role row to user
      full_name: parsed.fullName,
      address: parsed.address,
      ...(parsed.role === "landlord" && { company_name: parsed.companyName }),
      ...(parsed.role === "tenant" && {
        preferred_location: parsed.preferredLocation || null,
        budget_range: parsed.budgetRange || null,
        move_in_date: parsed.moveInDate || null,
      }),
    };

    const { data: roleData, error: roleError } = await supabaseServer
      .from(table)
      .insert([rolePayload])
      .select()
      .single();

    if (roleError) throw new Error(roleError.message);

    // 5️⃣ Update users.ref_id to point to role row
    const { error: refError } = await supabaseServer
      .from("users")
      .update({ ref_id: roleData.id })
      .eq("id", userData.id);

    if (refError) throw new Error(refError.message);

    return NextResponse.json(
      {
        message: "Signup successful",
        user: userData,
        roleData,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Signup Error:", err.message);

    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
