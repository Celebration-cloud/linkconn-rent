import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readPngHeader(relativePath: string) {
  const bytes = readFileSync(join(process.cwd(), relativePath));
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

describe("LinkConn brand assets", () => {
  it("ships transparent, tightly cropped lockup and mark variants", () => {
    const lockup = readPngHeader("public/icons/linkconn-logo.png");
    const mark = readPngHeader("public/icons/linkconn-symbol.png");

    expect(lockup).toEqual({ width: 1160, height: 557, colorType: 6 });
    expect(mark).toEqual({ width: 1008, height: 1008, colorType: 6 });
  });

  it("ships browser and installable-app icons", () => {
    expect(existsSync(join(process.cwd(), "app/favicon.ico"))).toBe(true);
    expect(readPngHeader("app/icon.png")).toEqual({
      width: 512,
      height: 512,
      colorType: 6,
    });
    expect(readPngHeader("app/apple-icon.png")).toEqual({
      width: 180,
      height: 180,
      colorType: 2,
    });
  });
});
