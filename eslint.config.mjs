import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "warn",
      "no-undef": "off",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // React Compiler diagnostics remain visible while legacy effect-driven
      // client coordinators migrate to server-provided initial data in slices.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "stitch-exports/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
