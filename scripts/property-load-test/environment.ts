import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvironmentFile(path: string) {
  const values = new Map<string, string>();
  if (!existsSync(path)) return values;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex < 1) continue;
    const name = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values.set(name, value);
  }
  return values;
}

export function loadProjectEnvironment(root = process.cwd()) {
  const externallyDefined = new Set(Object.keys(process.env));
  const loaded = new Map<string, string>();

  for (const file of [".env", ".env.local"]) {
    for (const [name, rawValue] of parseEnvironmentFile(resolve(root, file))) {
      if (externallyDefined.has(name)) continue;
      const value = rawValue.replace(/\$\{([A-Z0-9_]+)\}/g, (_, variable: string) =>
        process.env[variable] ?? loaded.get(variable) ?? `\${${variable}}`,
      );
      loaded.set(name, value);
      process.env[name] = value;
    }
  }
}
