import { NextResponse } from "next/server";

import {
  landlordIdentitySchema,
  landlordPropertySchema,
  landlordPayoutSchema as payoutSchema,
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

      if (profile.role !== "landlord") {
        return NextResponse.json(
          { error: "Landlord onboarding is only available to landlord accounts" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const { identity, property, payout } = body;

      // Validate schemas
      landlordIdentitySchema.parse(identity);
      landlordPropertySchema.parse(property);
      payoutSchema.parse(payout);

      const landlordId = profile.id;

      // Check if already onboarded
      const existingIdentity = await sql`
        SELECT id FROM landlord_identity WHERE user_id = ${landlordId} LIMIT 1
      `;

      if (existingIdentity.length > 0) {
        return NextResponse.json(
          { error: "Landlord onboarding was already submitted" },
          { status: 409 },
        );
      }

      // Insert landlord_identity
      const [identityData] = await sql`
        INSERT INTO landlord_identity (user_id, id_type, id_file, land_doc, address, confirmed)
        VALUES (
          ${landlordId},
          ${identity.idType},
          ${identity.idFile || null},
          ${identity.landDoc || null},
          ${identity.address},
          true
        )
        RETURNING *
      `;

      // Insert property
      const [propertyData] = await sql`
        INSERT INTO properties (landlord_id, title, type, address, price, description, images)
        VALUES (
          ${landlordId},
          ${property.title},
          ${property.type},
          ${property.address},
          ${Number(property.price)},
          ${property.description},
          ${property.images}
        )
        RETURNING *
      `;

      // Insert landlord payout details
      const [payoutData] = await sql`
        INSERT INTO landlord_payouts (landlord_id, bank, account_number, account_name, confirm_ownership)
        VALUES (
          ${landlordId},
          ${payout.bank},
          ${payout.accountNumber},
          ${payout.accountName},
          ${payout.confirmOwnership}
        )
        RETURNING *
      `;

      // Update user profile status as onboarded
      await sql`
        UPDATE profiles
        SET onboarded = true,
            phone = ${identity.phone ? String(identity.phone) : null}
        WHERE id = ${landlordId}
      `;

      return NextResponse.json({
        message: "Landlord onboarding completed successfully",
        userId: landlordId,
        identityData,
        propertyData,
        payoutData,
      });
    } catch (err) {
      console.error("Landlord Onboarding Error:", err);
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
