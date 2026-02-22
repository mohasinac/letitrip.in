// @ts-check
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

/**
 * ESLint flat config for LetItRip (Phase 18.19 baseline).
 *
 * Plugins are registered so that existing `eslint-disable` comments for
 * react-hooks and @next/next rules are not reported as "rule not found".
 * Plugin rules are set to "warn" to allow gradual adoption.
 * Strict mode (errors instead of warnings) is tracked in TECH_DEBT.md.
 */
export default tseslint.config(
  // Recommended TypeScript rules
  ...tseslint.configs.recommended,
  // Register react-hooks plugin — prevents "Definition for rule not found" errors
  // on existing eslint-disable-next-line comments in source files
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Register @next/next plugin — same rationale as above
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    rules: {
      // Off — allow `any` in a large Next.js codebase (enables gradual typing)
      "@typescript-eslint/no-explicit-any": "off",
      // Warn on unused vars with _ prefix exception
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Off — CJS require() is used in some config and API files
      "@typescript-eslint/no-require-imports": "off",
      // Off — empty interfaces / types are intentional in some definitions
      "@typescript-eslint/no-empty-object-type": "off",
      // Warn only — pre-existing patterns, tracked in TECH_DEBT.md
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      // Off — Function type used intentionally in several utility signatures
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      // Off — prefer-const may conflict with destructuring patterns in this codebase
      "prefer-const": "off",
    },
  },
  {
    // Ignore generated / non-source files
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "*.config.js",
      "postcss.config.js",
      "tailwind.config.js",
      "jest.config.ts",
      "jest.setup.ts",
      "scripts/**",
      "src/sw.ts",
    ],
  },
);

