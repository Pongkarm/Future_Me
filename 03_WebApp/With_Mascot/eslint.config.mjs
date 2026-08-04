import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

/**
 * Flat config. `npm run lint` calls `eslint .` directly rather than `next lint`,
 * which Next.js deprecated in 15.5 and removes in 16 — so the lint step will not
 * break on the next major upgrade.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      // A frozen copy kept for restore and diff, not a build input. Linting it
      // would let a rule change turn an archive into a broken build.
      "backup_questionnaire_before_chat_redesign/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
