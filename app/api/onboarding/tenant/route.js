import { NextResponse } from "next/server";

import {
  tenantIdentitySchema,
  tenantEmploymentSchema,
  tenantPreferenceSchema,
} from "@/lib/zodSchemas";
import { withRateLimit } from "@/lib/rateLimiter";
import { assertSameOrigin } from "@/lib/security/request";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

const rateLimitedPost = withRateLimit(
  async (req) => {
    try {
      const originError = assertSameOrigin(req);
      if (originError) return originError;

      const session = await auth.getSession({ headers: req.headers });
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }

      const [profile] = await sql`
        SELECT id, role
        FROM profiles
        WHERE id = ${session.user.id}
        LIMIT 1
      `;

      if (!profile) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );
      }

      if (profile.role !== "tenant") {
        return NextResponse.json(
          { error: "Tenant onboarding is only available to tenant accounts" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const { identity, employment, preference } = body;

      // Validate using Zod schemas
      tenantIdentitySchema.parse(identity);
      tenantEmploymentSchema.parse(employment);
      tenantPreferenceSchema.parse(preference);

      const tenantId = profile.id;

      // Check if already onboarded
      const existingIdentity = await sql`
        SELECT id FROM tenant_identity WHERE user_id = ${tenantId} LIMIT 1
      `;

      if (existingIdentity.length > 0) {
        return NextResponse.json(
          { error: "Tenant onboarding was already submitted" },
          { status: 409 },
        );
      }

      // Insert tenant_identity details in Neon DB
      await sql`
        INSERT INTO tenant_identity (user_id, id_type, id_upload, address, confirmed)
        VALUES (${tenantId}, ${identity.idType}, ${identity.idUpload || null}, ${identity.address}, ${identity.confirm})
      `;

      // Insert tenant_employment details in Neon DB
      await sql`
        INSERT INTO tenant_employment (tenant_id, employment_status, company_name, monthly_income, occupation, payslip, confirmed)
        VALUES (${tenantId}, ${employment.employmentStatus}, ${employment.companyName || null}, ${employment.monthlyIncome}, ${employment.occupation}, ${employment.payslip || null}, ${employment.confirm})
      `;

      // Insert tenant_preferences details in Neon DB
      await sql`
        INSERT INTO tenant_preferences (tenant_id, location, min_budget, max_budget, property_type, move_in_date, agree_to_policy)
        VALUES (${tenantId}, ${preference.location}, ${String(preference.minBudget)}, ${String(preference.maxBudget)}, ${preference.propertyType}, ${preference.moveInDate}, ${preference.agreeToPolicy})
      `;

      // Update user profile status as onboarded
      await sql`
        UPDATE profiles
        SET onboarded = true,
            phone = ${identity.phone ? String(identity.phone) : null}
        WHERE id = ${tenantId}
      `;

      return NextResponse.json({
        message: "Tenant onboarding completed successfully",
        userId: tenantId,
      });
    } catch (err) {
      console.error("Tenant Onboarding Error:", err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  },
  {
    max: 5,
    windowMs: 3600000,
    message: "Onboarding already submitted. Please wait or contact support.",
  },
);

export async function POST(req) {
  return rateLimitedPost(req);
}
