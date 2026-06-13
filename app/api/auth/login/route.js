import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { loginSchema } from "@/lib/zodSchemas";
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

const rateLimitedGet = withRateLimit(
  async (req) => {
    try {
      const session = await auth.getSession({ headers: req.headers });

      if (!session || !session.user) {
        return NextResponse.json(
          { success: false, error: "Not authenticated" },
          { status: 401 },
        );
      }

      const userId = session.user.id;

      const [profile] = await sql`
      SELECT id, role, full_name, phone, avatar_url, verified, created_at
      FROM profiles
      WHERE id = ${userId}
      LIMIT 1
    `;

      if (!profile) {
        return NextResponse.json(
          {
            success: true,
            message: "No profile found — needs registration",
            data: {
              id: userId,
              email: session.user.email,
              emailVerified: session.user.emailVerified,
              needsProfile: true,
            },
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Login verified",
          data: {
            id: profile.id,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
            role: profile.role,
            fullName: profile.full_name,
            phone: profile.phone,
            avatarUrl: profile.avatar_url,
            verified: profile.verified,
            createdAt: profile.created_at,
          },
        },
        { status: 200 },
      );
    } catch (err) {
      console.error("Login route error:", err);

      return NextResponse.json(
        { success: false, error: err.message },
        { status: 500 },
      );
    }
  },
  { max: 20, windowMs: 60000 },
);

const rateLimitedPost = withRateLimit(
  async (req) => {
    try {
      const originError = assertSameOrigin(req);
      if (originError) return originError;

      await ensureDbInitialized();
      const body = await req.json();
      const parsed = loginSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.message },
          { status: 400 },
        );
      }

      const { email, password, role } = parsed.data;

      console.log("Login verification request for:", email, "as", role);

      const [profile] = await sql`
      SELECT id, role, onboarded, verified, avatar_url, full_name, address
      FROM profiles
      WHERE email = ${email}
      LIMIT 1
    `;

      if (!profile) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }

      if (profile.role !== role) {
        return NextResponse.json({ error: "Role mismatch" }, { status: 403 });
      }

      return NextResponse.json(
        {
          message: "Login verified",
          user: {
            id: profile.id,
            email,
            role: profile.role,
            fullName: profile.full_name || null,
            address: profile.address || null,
            profilePic: profile.avatar_url,
            onboarded: profile.onboarded,
            verified: profile.verified,
          },
        },
        { status: 200 },
      );
    } catch (err) {
      console.error("Login verification POST error:", err);

      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  },
  {
    max: 10,
    windowMs: 60000,
    message: "Too many login attempts. Please try again later.",
  },
);

export async function GET(req) {
  return rateLimitedGet(req);
}

export async function POST(req) {
  return rateLimitedPost(req);
}
