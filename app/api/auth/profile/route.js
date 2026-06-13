import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { withRateLimit } from "@/lib/rateLimiter";

const rateLimitedGet = withRateLimit(
  async (req) => {
    try {
      const session = await auth.getSession({ headers: req.headers });

      if (!session || !session.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      const [profile] = await sql`
      SELECT id, role, full_name, phone, avatar_url, verified, onboarded, created_at
      FROM profiles
      WHERE id = ${session.user.id}
      LIMIT 1
    `;

      if (!profile) {
        return NextResponse.json(
          { success: false, error: "Profile not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: profile.id,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          role: profile.role,
          fullName: profile.full_name,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          verified: profile.verified,
          onboarded: profile.onboarded,
          createdAt: profile.created_at,
        },
      });
    } catch (error) {
      console.error("Profile fetch error:", error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  },
  { max: 20, windowMs: 60000 },
);

export async function GET(req) {
  return rateLimitedGet(req);
}
