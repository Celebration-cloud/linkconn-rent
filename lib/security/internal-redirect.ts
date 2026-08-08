import { z } from "zod";

const CONTROL_OR_BACKSLASH = /[\\\u0000-\u001f\u007f]/;

export function isInternalRedirectPath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (CONTROL_OR_BACKSLASH.test(value)) return false;

  try {
    const parsed = new URL(value, "https://linkconn.invalid");
    return parsed.origin === "https://linkconn.invalid" && parsed.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export const internalRedirectSchema = z
  .string()
  .max(2048, "Return path is too long")
  .refine(isInternalRedirectPath, "Return path must be an internal application path");

export function getInternalRedirectPath(
  value: string | null | undefined,
  fallback: string
): string {
  return value && isInternalRedirectPath(value) ? value : fallback;
}
