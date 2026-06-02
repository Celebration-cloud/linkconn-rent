import { NextResponse } from "next/server";

import {
  tenantIdentitySchema,
  tenantEmploymentSchema,
  tenantPreferenceSchema,
} from "@/schemas/onboarding";
import { supabaseServer } from "@/lib/superbaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { identity, employment, preference } = body;

    // Validate
    tenantIdentitySchema.parse(identity);
    tenantEmploymentSchema.parse(employment);
    tenantPreferenceSchema.parse(preference);

    // Insert identity
    const { error: idErr } = await supabaseServer
      .from("tenant_identity")
      .insert({
        user_id: identity.userId,
        id_type: identity.idType,
        id_upload: identity.idUpload,
        address: identity.address,
        confirmed: identity.confirm,
      });

    if (idErr) throw idErr;

    // Insert employment
    const { error: empErr } = await supabaseServer
      .from("tenant_employment")
      .insert({
        tenant_id: identity.userId,
        employment_status: employment.employmentStatus,
        company_name: employment.companyName,
        monthly_income: employment.monthlyIncome,
        occupation: employment.occupation,
        payslip: employment.payslip,
        confirmed: employment.confirm,
      });

    if (empErr) throw empErr;

    // Insert preference
    const { error: prefErr } = await supabaseServer
      .from("tenant_preferences")
      .insert({
        tenant_id: identity.userId,
        location: preference.location,
        min_budget: preference.minBudget,
        max_budget: preference.maxBudget,
        property_type: preference.propertyType,
        move_in_date: preference.moveInDate,
        agree_to_policy: preference.agreeToPolicy,
      });

    if (prefErr) throw prefErr;

    return NextResponse.json({
      message: "Tenant onboarding completed successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
