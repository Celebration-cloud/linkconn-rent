import { describe, expect, it } from "vitest";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import {
  getPropertySearchStorageKey,
  isPropertySearchRestorationCompatible,
  normalizePropertySearchQuery,
  parsePropertySearchRestoration,
  PROPERTY_SEARCH_RESTORE_VERSION,
} from "@/utils/property-search-restoration";

const validState = {
  version: PROPERTY_SEARCH_RESTORE_VERSION,
  expiresAt: 2_000,
  batches: [{ page: 1, items: [FALLBACK_PROPERTIES[0]] }],
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  compareIds: [FALLBACK_PROPERTIES[0].id],
  lastVisiblePage: 1,
  scrollY: 420,
};

describe("property search restoration", () => {
  it("normalizes equivalent list queries and removes view-only state", () => {
    const first = normalizePropertySearchQuery(
      "sort=newest&types=Duplex,Apartment&page=3&north=7&south=6&east=4&west=3",
    );
    const second = normalizePropertySearchQuery(
      "types=Apartment,Duplex&sort=newest",
    );
    expect(first).toBe(second);
    expect(getPropertySearchStorageKey(first)).toContain("v3:");
  });

  it("accepts current unexpired restoration state", () => {
    expect(parsePropertySearchRestoration(JSON.stringify(validState), 1_000)).toMatchObject({
      lastVisiblePage: 1,
      scrollY: 420,
    });
  });

  it("rejects expired, malformed, and old-version state", () => {
    expect(parsePropertySearchRestoration(JSON.stringify(validState), 2_001)).toBeNull();
    expect(parsePropertySearchRestoration("not-json", 1_000)).toBeNull();
    expect(
      parsePropertySearchRestoration(
        JSON.stringify({ ...validState, version: 1 }),
        1_000,
      ),
    ).toBeNull();
  });

  it("rejects restoration batches when the live result set changed", () => {
    expect(
      isPropertySearchRestorationCompatible(validState, {
        ...validState.pagination,
        totalItems: 500,
      }),
    ).toBe(false);
    expect(
      isPropertySearchRestorationCompatible(validState, validState.pagination),
    ).toBe(true);
  });
});
