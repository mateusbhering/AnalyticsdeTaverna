import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Script de depuração local (usa playwright-core, caminho de Chrome
    // hardcoded) — não faz parte do app, não precisa passar no lint do CI.
    "diag-tmp.cjs",
  ]),
]);

export default eslintConfig;
