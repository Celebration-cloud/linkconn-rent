import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(process.cwd());
const SOURCE_ROOTS = ["app", "components", "features", "hooks", "lib", "providers", "repositories", "services", "stores", "utils"];
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const ALLOWED_CLIENT_ROUTES = new Set([
  "app/(auth)/account-review/page.tsx",
  "app/(auth)/billing/complete/page.tsx",
  "app/(auth)/onboarding/page.tsx",
]);

function collectFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? collectFiles(path)
      : EXTENSIONS.includes(extname(path))
        ? [path]
        : [];
  });
}

const files = SOURCE_ROOTS.flatMap((directory) => collectFiles(join(ROOT, directory)));
const normalized = (path: string) => relative(ROOT, path).replaceAll("\\", "/");

function importsFor(path: string) {
  const source = readFileSync(path, "utf8");
  return [...source.matchAll(/(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((specifier): specifier is string => Boolean(specifier));
}

function resolveLocalImport(from: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? join(ROOT, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(from), specifier)
      : null;
  if (!base) return null;
  const candidates = [
    base,
    ...EXTENSIONS.map((extension) => `${base}${extension}`),
    ...EXTENSIONS.map((extension) => join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

describe("architecture boundaries", () => {
  it("keeps privileged server modules out of direct client imports", () => {
    const violations = files.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      if (!/^\s*["']use client["'];?/m.test(source)) return [];
      return importsFor(path)
        .filter(
          (specifier) =>
            specifier.startsWith("@/repositories/") ||
            specifier === "@/lib/db/client" ||
            specifier === "@/lib/neon-auth" ||
            /^@\/features\/[^/]+\/server\//.test(specifier),
        )
        .map((specifier) => `${normalized(path)} -> ${specifier}`);
    });
    expect(violations).toEqual([]);
  });

  it("allows only documented interactive page boundaries", () => {
    const clientPages = files
      .filter((path) => normalized(path).startsWith("app/"))
      .filter((path) => /\/page\.(?:tsx|jsx)$/.test(normalized(path)))
      .filter((path) => /^\s*["']use client["'];?/m.test(readFileSync(path, "utf8")))
      .map(normalized)
      .filter((path) => !ALLOWED_CLIENT_ROUTES.has(path));
    expect(clientPages).toEqual([]);
  });

  it("has no direct circular local imports", () => {
    const graph = new Map(
      files.map((path) => [
        path,
        importsFor(path)
          .map((specifier) => resolveLocalImport(path, specifier))
          .filter((dependency): dependency is string => Boolean(dependency)),
      ]),
    );
    const cycles = new Set<string>();
    const visited = new Set<string>();
    const active = new Set<string>();

    function visit(path: string, trail: string[]) {
      if (active.has(path)) {
        const start = trail.indexOf(path);
        cycles.add(trail.slice(start).concat(path).map(normalized).join(" -> "));
        return;
      }
      if (visited.has(path)) return;
      active.add(path);
      for (const dependency of graph.get(path) ?? []) visit(dependency, [...trail, path]);
      active.delete(path);
      visited.add(path);
    }

    for (const path of files) visit(path, []);
    expect([...cycles]).toEqual([]);
  });
});
