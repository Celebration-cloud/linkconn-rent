import { NextResponse } from "next/server";
import {
  landlordIdentitySchema,
  landlordPropertySchema,
  payoutSchema,
} from "@/schemas/onboarding";
import { supabaseServer } from "@/lib/superbaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { identity, property, payout } = body;

    // Validate all sections with Zod
    landlordIdentitySchema.parse(identity);
    landlordPropertySchema.parse(property);
    payoutSchema.parse(payout);

    // Create landlord identity
    const { data: identityData, error: identityErr } = await supabaseServer
      .from("landlord_identity")
      .insert({
        user_id: identity.userId,
        id_type: identity.idType,
        id_file: identity.idFile,
        land_doc: identity.landDoc,
        address: identity.address,
      })
      .select()
      .single();

    if (identityErr) throw identityErr;

    // Add property
    const { data: propertyData, error: propertyErr } = await supabaseServer
      .from("properties")
      .insert({
        landlord_id: identity.userId,
        title: property.title,
        type: property.type,
        address: property.address,
        price: property.price,
        description: property.description,
        images: property.images,
      })
      .select()
      .single();

    if (propertyErr) throw propertyErr;

    // Add payout
    const { error: payoutErr } = await supabaseServer
      .from("landlord_payouts")
      .insert({
        landlord_id: identity.userId,
        bank: payout.bank,
        account_number: payout.accountNumber,
        account_name: payout.accountName,
        confirm_ownership: payout.confirmOwnership,
      });

    if (payoutErr) throw payoutErr;

    return NextResponse.json({
      message: "Landlord onboarding completed successfully",
      identityData,
      propertyData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
