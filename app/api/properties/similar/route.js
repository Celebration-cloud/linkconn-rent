import { NextResponse } from "next/server";

import { MOCK } from "../mock";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const current = MOCK.find((p) => p.type === id);

  if (!current) return NextResponse.json([]);

  const similar = MOCK.filter(
    (p) =>
      p.id !== current.id &&
      (p.city === current.city || p.category === current.category),
  ).slice(0, 3); // limit to 3 similar results

  return NextResponse.json(similar);
}
