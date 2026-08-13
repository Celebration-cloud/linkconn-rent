import { describe, expect, it } from "vitest";
import { isUniqueConstraintFor } from "@/lib/db/prisma-errors";

describe("scoped Prisma uniqueness conflict mapping", () => {
  it("matches only the application participant/property constraint", () => {
    expect(
      isUniqueConstraintFor(
        { code: "P2002", meta: { target: ["propertyId", "tenantId"] } },
        ["propertyId", "tenantId"],
      ),
    ).toBe(true);
    expect(
      isUniqueConstraintFor(
        { code: "P2002", meta: { target: ["idempotencyKey"] } },
        ["propertyId", "tenantId"],
      ),
    ).toBe(false);
  });

  it("matches named viewing constraints without swallowing unrelated errors", () => {
    expect(
      isUniqueConstraintFor(
        { code: "P2002", meta: { target: "viewings_activeSlotKey_key" } },
        ["activeSlotKey"],
      ),
    ).toBe(true);
    expect(isUniqueConstraintFor({ code: "P2021" }, ["activeSlotKey"])).toBe(false);
  });
});
