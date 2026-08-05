import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LINKCONN_ASSET_COUNT,
  LINKCONN_ASSETS,
} from "@/domain/constants/linkconn-assets";

describe("generated LinkConn image system", () => {
  it("ships all 32 inspected project assets", () => {
    expect(LINKCONN_ASSET_COUNT).toBe(32);

    for (const asset of Object.values(LINKCONN_ASSETS)) {
      expect(
        existsSync(join(process.cwd(), "public", asset.src)),
        asset.src,
      ).toBe(true);
      expect(asset.alt.trim().length).toBeGreaterThan(12);
      expect(asset.width).toBeGreaterThan(1000);
      expect(asset.height).toBeGreaterThan(900);
      expect(asset.route).toMatch(/^\//);
      expect(asset.focalPoint).toMatch(/^\d+% \d+%$/);
    }
  });
});
