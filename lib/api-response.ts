import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, message: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function apiError(message: string, status: number, data: null = null) {
  return NextResponse.json({ success: false, data, message }, { status });
}
