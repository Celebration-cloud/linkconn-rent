import "server-only";

import { queueFiltersSchema, type AdminQueueFilters } from "@/schemas/administration";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function parseAdminSearchParams(searchParams: AdminSearchParams): Promise<AdminQueueFilters> {
  const values = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  return queueFiltersSchema.parse(normalized);
}
