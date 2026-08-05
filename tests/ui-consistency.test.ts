import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_ROOTS = ["app", "components", "features"];
const RAW_CONTROL_ALLOWLIST = new Set([
  "components/ui/form-controls.tsx",
  "features/auth/input.tsx",
  "components/stitch/public-home.tsx",
  "components/stitch/property-search.tsx",
  "components/sections/properties-client.tsx",
]);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(tsx|jsx)$/.test(entry.name) ? [path] : [];
  });
}

function normalized(path: string) {
  return relative(process.cwd(), path).replaceAll("\\", "/");
}

const files = SOURCE_ROOTS.flatMap(sourceFiles);

describe("sitewide UI consistency", () => {
  it("uses Lucide or approved SVG assets instead of inline or text icons", () => {
    const iconGlyphs = [
      "📊", "💰", "💬", "🏘", "🏠", "👥", "⏳", "❤️", "📝", "🔧",
      "✅", "➕", "⚙", "📍", "✔", "ℹ", "⚠", "💻", "📅", "🔔",
      "🔒", "💳", "👤", "🚀", "🛡", "🔴", "🟡", "🟢", "✉", "🪪",
      "📜", "🚨", "⭐", "🔍", "🔑", "📋", "🤫", "💎",
    ];
    const offenders = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return /<svg\b/.test(source) || iconGlyphs.some((glyph) => source.includes(glyph))
        ? [normalized(file)]
        : [];
    });

    expect(offenders).toEqual([]);
  });

  it("does not reintroduce legacy field or off-theme color utilities", () => {
    const forbidden = /stitch-field|(?:slate|gray|zinc|neutral|stone|purple|pink|blue|sky|emerald|orange|rose)-\d{2,3}|#eef3fb|#dbe6f5|#2563eb|#60a5fa|rgba\(15,\s?23,\s?42/;
    const offenders = files.flatMap((file) =>
      forbidden.test(readFileSync(file, "utf8")) ? [normalized(file)] : [],
    );

    expect(offenders).toEqual([]);
  });

  it("keeps visible text controls behind shared control components", () => {
    const offenders = files.flatMap((file) => {
      const path = normalized(file);
      if (RAW_CONTROL_ALLOWLIST.has(path)) return [];
      return /<(?:input|select|textarea)\b/.test(readFileSync(file, "utf8"))
        ? [path]
        : [];
    });

    expect(offenders).toEqual([]);
  });

  it("uses the shared LinkConn logo assets instead of the legacy mark", () => {
    const offenders = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes("linkconn-mark.svg") ? [normalized(file)] : [];
    });

    expect(offenders).toEqual([]);
  });
});
