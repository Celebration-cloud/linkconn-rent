import { NextResponse } from "next/server";
import {
  agentIdentitySchema,
  agentLicenseSchema,
  agentPayoutSchema,
} from "@/schemas/onboarding";
import { supabaseServer } from "@/lib/superbaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { identity, license, payout } = body;

    // Validate
    agentIdentitySchema.parse(identity);
    agentLicenseSchema.parse(license);
    agentPayoutSchema.parse(payout);

    // Insert identity
    const { error: idErr } = await supabaseServer.from("agent_identity").insert({
      user_id: identity.userId,
      id_type: identity.idType,
      id_image: identity.idImage,
      passport: identity.passport,
    });

    if (idErr) throw idErr;

    // Insert license
    const { error: licenseErr } = await supabaseServer.from("agent_license").insert({
      agent_id: identity.userId,
      agency_name: license.agencyName,
      cac_number: license.cacNumber,
      license_number: license.licenseNumber,
      office_address: license.officeAddress,
      agency_email: license.agencyEmail,
      documents: license.documents,
    });

    if (licenseErr) throw licenseErr;

    // Insert payout
    const { error: payoutErr } = await supabaseServer.from("agent_payouts").insert({
      agent_id: identity.userId,
      bank: payout.bank,
      account_number: payout.accountNumber,
      account_name: payout.accountName,
      confirm_ownership: payout.confirmOwnership,
    });

    if (payoutErr) throw payoutErr;

    return NextResponse.json({
      message: "Agent onboarding completed successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
