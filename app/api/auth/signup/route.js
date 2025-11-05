import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/superbaseServer";
import { signupSchema } from "@/lib/zodSchemas";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData);

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

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    // Pick role table
    const table =
      parsed.role === "landlord"
        ? "landlords"
        : parsed.role === "agent"
          ? "agents"
          : "tenants";

    // Check if user already exists
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", parsed.email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Insert into role table first
    const rolePayload = {
      full_name: parsed.fullName,
      address: parsed.address,
      ...(parsed.role === "landlord" && { company_name: parsed.companyName }),
      ...(parsed.role === "agent" && { agency_name: parsed.agencyName }),
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

    // Insert into users and link ref_id
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .insert([
        {
          email: parsed.email,
          password: hashedPassword,
          role: parsed.role,
          ref_id: roleData.id,
          profile_pic: parsed.profilePic || null,
        },
      ])
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    return NextResponse.json(
      {
        message: "Signup successful",
        user: userData,
        roleData,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
