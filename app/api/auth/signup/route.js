import { NextResponse } from "next/server";

import { signupSchema } from "@/lib/zodSchemas";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { initializeDatabase } from "@/lib/dbInit";
import { withRateLimit } from "@/lib/rateLimiter";
import { assertSameOrigin } from "@/lib/security/request";

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error("Lazy DB init failed:", err);
    }
  }
}

const rateLimitedPost = withRateLimit(
  async (req) => {
    try {
      const originError = assertSameOrigin(req);
      if (originError) return originError;

      await ensureDbInitialized();
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

      const existingUsers = await sql`
      SELECT id FROM profiles WHERE email = ${parsed.email} LIMIT 1
    `;

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 },
        );
      }

      let neonUser;

      try {
        const { data, error } = await auth.signUp.email({
          email: parsed.email,
          password: parsed.password,
          name: parsed.fullName,
        });

        if (error) {
          // If user already exists in Neon Auth (e.g. a prior failed signup),
          // return a clear message telling them to log in instead.
          const msg = error.message || "";
          if (
            msg.toLowerCase().includes("already exists") ||
            msg.toLowerCase().includes("duplicate") ||
            error.code === "USER_ALREADY_EXISTS"
          ) {
            return NextResponse.json(
              { error: "An account with this email already exists. Please log in instead." },
              { status: 409 },
            );
          }
          throw new Error(msg || "Authentication registration failed");
        }

        if (!data || !data.user) {
          throw new Error("Neon Auth registration failed");
        }
        neonUser = data.user;
      } catch (authError) {
        // Also catch thrown errors that indicate duplicate user
        const msg = authError.message || "";
        if (
          msg.toLowerCase().includes("already exists") ||
          msg.toLowerCase().includes("duplicate")
        ) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please log in instead." },
            { status: 409 },
          );
        }
        console.error("Neon Auth API Error:", authError);
        throw new Error(msg || "Authentication registration failed");
      }

      // Upsert the profile with role-specific details from signup
      const [profile] = await sql`
        INSERT INTO profiles (id, email, role, full_name, avatar_url, address, company_name)
        VALUES (
          ${neonUser.id},
          ${parsed.email},
          ${parsed.role},
          ${parsed.fullName},
          ${parsed.profilePic || null},
          ${parsed.address},
          ${parsed.companyName || null}
        )
        ON CONFLICT (id) DO UPDATE
        SET email = COALESCE(EXCLUDED.email, profiles.email),
            role = EXCLUDED.role,
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            address = COALESCE(EXCLUDED.address, profiles.address),
            company_name = COALESCE(EXCLUDED.company_name, profiles.company_name)
        RETURNING *
      `;

      if (!profile) {
        throw new Error("Failed to update user profile metadata");
      }

      return NextResponse.json(
        {
          message: "Signup successful",
          user: {
            id: profile.id,
            email: parsed.email,
            role: profile.role,
            fullName: profile.full_name,
            address: profile.address,
            profilePic: profile.avatar_url,
            onboarded: profile.onboarded,
            verified: profile.verified,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      console.error("Signup Error:", err.message);

      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  },
  {
    max: 10,
    windowMs: 60000,
    message: "Too many signup attempts. Please try again later.",
  },
);

export async function POST(req) {
  return rateLimitedPost(req);
}
