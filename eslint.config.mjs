import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname || process.cwd(),
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "stitch-exports/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "warn",
      "no-undef": "off",
      "no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
