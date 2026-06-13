import { NextResponse } from "next/server";

export function assertSameOrigin(req) {
  const requestOrigin = req.nextUrl.origin;
  const headerOrigin = req.headers.get("origin");

  if (headerOrigin && headerOrigin !== requestOrigin) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  }

  return null;
}
