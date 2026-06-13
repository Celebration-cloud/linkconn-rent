import { NextResponse } from "next/server";

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

      const body = await req.json();
      const { fullName, role, phone } = body;

      const session = await auth.getSession({ headers: req.headers });

      if (!session || !session.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized — no valid session" },
          { status: 401 },
        );
      }

      const userId = session.user.id;
      const sanitizedRole = ["tenant", "landlord", "agent", "admin"].includes(
        role,
      )
        ? role
        : "tenant";

      const existing = await sql`
      SELECT id FROM profiles WHERE id = ${userId} LIMIT 1
    `;

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "Profile already exists" },
          { status: 409 },
        );
      }

      const [profile] = await sql`
      INSERT INTO profiles (id, role, full_name, phone, verified)
      VALUES (${userId}, ${sanitizedRole}, ${fullName || null}, ${phone || null}, false)
      RETURNING *
    `;

      if (!profile) {
        throw new Error("Failed to create user profile");
      }

      return NextResponse.json(
        {
          success: true,
          message: "Profile created successfully",
          data: {
            id: profile.id,
            role: profile.role,
            fullName: profile.full_name,
            phone: profile.phone,
            verified: profile.verified,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      console.error("Register Error:", err.message);

      return NextResponse.json(
        { success: false, error: err.message },
        { status: 400 },
      );
    }
  },
  {
    max: 10,
    windowMs: 60000,
    message: "Too many registration attempts. Please try again later.",
  },
);

export async function POST(req) {
  return rateLimitedPost(req);
}
