import { z } from "zod";
import type { Property } from "@/domain/types/property";
import type { PropertyPagination } from "@/domain/types/property-search";

export const PROPERTY_SEARCH_RESTORE_VERSION = 2 as const;
export const PROPERTY_SEARCH_RESTORE_TTL = 30 * 60 * 1_000;
const STORAGE_PREFIX = "linkconn.property-search:";

export type PropertyResultBatch = { page: number; items: Property[] };

export type PropertySearchRestorationState = {
  version: typeof PROPERTY_SEARCH_RESTORE_VERSION;
  expiresAt: number;
  batches: PropertyResultBatch[];
  pagination: PropertyPagination;
  compareIds: string[];
  lastVisiblePage: number;
  scrollY: number;
};

const propertySchema = z.custom<Property>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string",
);

const restorationSchema = z.object({
  version: z.literal(PROPERTY_SEARCH_RESTORE_VERSION),
  expiresAt: z.number().finite(),
  batches: z.array(
    z.object({
      page: z.number().int().positive(),
      items: z.array(propertySchema),
    }),
  ).min(1),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
  compareIds: z.array(z.string()).max(4),
  lastVisiblePage: z.number().int().positive(),
  scrollY: z.number().finite().nonnegative(),
});

export function normalizePropertySearchQuery(query: string) {
  const params = new URLSearchParams(query);
  ["page", "pageSize", "mode", "north", "south", "east", "west"].forEach((key) =>
    params.delete(key),
  );
  for (const key of ["types", "amenities"]) {
    const value = params.get(key);
    if (value) {
      params.set(
        key,
        [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))]
          .sort((first, second) => first.localeCompare(second))
          .join(","),
      );
    }
  }
  return [...params.entries()]
    .filter(([, value]) => value !== "")
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export function getPropertySearchStorageKey(query: string) {
  return `${STORAGE_PREFIX}v${PROPERTY_SEARCH_RESTORE_VERSION}:${normalizePropertySearchQuery(query) || "all"}`;
}

export function parsePropertySearchRestoration(
  raw: string,
  now = Date.now(),
): PropertySearchRestorationState | null {
  try {
    const result = restorationSchema.safeParse(JSON.parse(raw) as unknown);
    if (!result.success || result.data.expiresAt <= now) return null;
    return result.data;
  } catch {
    return null;
  }
}
