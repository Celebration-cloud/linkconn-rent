import { describe, expect, it } from "vitest";
import { propertyCacheTags } from "@/lib/cache/property-tags";

describe("property cache tags", () => {
  it("keeps collection tags stable and scopes detail tags by id", () => {
    expect(propertyCacheTags.all).toBe("properties");
    expect(propertyCacheTags.featured).toBe("properties:featured");
    expect(propertyCacheTags.detail("property-42")).toBe("property:property-42");
  });
});
