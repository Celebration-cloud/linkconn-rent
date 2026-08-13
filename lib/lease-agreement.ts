import { createHash } from "node:crypto";

export type CanonicalJsonPrimitive = string | number | boolean | null;

export type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | readonly CanonicalJsonValue[]
  | CanonicalJsonObject;

export interface CanonicalJsonObject {
  readonly [key: string]: CanonicalJsonValue | undefined;
}

export type CanonicalLeaseTerms = CanonicalJsonObject;

function canonicalizeValue(value: CanonicalJsonValue): CanonicalJsonValue {
  if (Array.isArray(value)) {
    return value.map(canonicalizeValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter((entry): entry is [string, CanonicalJsonValue] => {
          return entry[1] !== undefined;
        })
        .sort(([left], [right]) => {
          if (left < right) return -1;
          if (left > right) return 1;
          return 0;
        })
        .map(([key, child]) => [key, canonicalizeValue(child)]),
    );
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Canonical lease terms require finite numbers");
  }

  return value;
}

export function canonicalizeLeaseTerms(terms: CanonicalLeaseTerms) {
  return JSON.stringify(canonicalizeValue(terms));
}

export function hashLeaseTerms(terms: CanonicalLeaseTerms) {
  return createHash("sha256")
    .update(canonicalizeLeaseTerms(terms), "utf8")
    .digest("hex");
}
