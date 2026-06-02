import { NextResponse } from "next/server";

import { MOCK } from "../mock";

export async function GET(request, { params }) {
  const { id } = await params; // ✅ must await params

  const property = MOCK.find((p) => p.slug === id);

  console.log("property:", property);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}
