#!/usr/bin/env node
/**
 * audit-config-factories.mjs — verify consumer config files use appkit helpers.
 *
 * appkit ships three config factory helpers in `@mohasinac/appkit/configs`:
 *
 *   defineNextConfig(override)    → next.config.js
 *   defineTailwindConfig(override) → tailwind.config.js
 *   defineEslintConfig(override)   → eslint.config.mjs
 *
 * Each factory encapsulates appkit-required settings (external packages,
 * file tracing, dark-mode strategy, plugin registration) so the consumer
 * file stays thin — only project-specific additions live there.
 *
 * This script checks whether each config file imports and calls its factory.
 * It uses a baseline-drift policy: if a config is already using the factory
 * and the import is removed, that is a regression (exit 1). Configs that
 * haven't adopted the factory yet count against the baseline (default 2 —
 * tailwind + eslint pending as of S11).
 *
 * USAGE
 * -----
 *   node scripts/audit-config-factories.mjs          # audit with baseline
 *   node scripts/audit-config-factories.mjs --strict  # baseline=0
 *   node scripts/audit-config-factories.mjs --verbose # show details for all
 *
 * Exits 0 when all factories adopted (or within baseline), 1 on regression.
 *
 * MIGRATION GUIDE (printed for each pending config)
 * --------------------------------------------------
 * tailwind.config.js:
 *   const { defineTailwindConfig } = require("@mohasinac/appkit/configs");
 *   module.exports = defineTailwindConfig({
 *     content: ["./src/**\/*.{ts,tsx}", "./src/**\/*.{js,jsx}"],
 *     safelist: [ ...existing safelist entries... ],
 *   });
 *
 * eslint.config.mjs:
 *   // ADDITIVE — keep all existing rules; spread the appkit base at the start
 *   import { defineEslintConfig } from "@mohasinac/appkit/configs";
 *   export default [
 *     ...defineEslintConfig(),   // ← add this line
 *     ...existingConfig,         // ← existing rules unchanged
 *   ];
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Config checks
// ---------------------------------------------------------------------------

const CHECKS = [
  {
    file: "next.config.js",
    factory: "defineNextConfig",
    pkg: "@mohasinac/appkit/configs",
    migration: [
      "const { defineNextConfig } = require(\"@mohasinac/appkit/configs\");",
      "module.exports = withNextIntl(defineNextConfig({ /* project overrides */ }));",
    ],
  },
  {
    file: "tailwind.config.js",
    factory: "defineTailwindConfig",
    pkg: "@mohasinac/appkit/configs",
    migration: [
      "const { defineTailwindConfig } = require(\"@mohasinac/appkit/configs\");",
      "module.exports = defineTailwindConfig({",
      "  content: [\"./src/**/*.{ts,tsx,js,jsx}\"],",
      "  safelist: [ ...existing safelist entries... ],",
      "});",
    ],
  },
  {
    file: "eslint.config.mjs",
    factory: "defineEslintConfig",
    pkg: "@mohasinac/appkit/configs",
    migration: [
      "// ADDITIVE — keep all existing rules intact:",
      "import { defineEslintConfig } from \"@mohasinac/appkit/configs\";",
      "export default [",
      "  ...defineEslintConfig(),   // spread appkit base at the start",
      "  ...existingConfig,          // all existing lir/* rules unchanged",
      "];",
    ],
  },
];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const STRICT  = argv.includes("--strict");
const VERBOSE = argv.includes("--verbose");
const baselineArg = argv.find((a) => a.startsWith("--baseline="));

// Default baseline = number of configs NOT yet adopted.
// Lower this number as each config migrates to its factory.
// Set to 0 (or --strict) once all three are adopted.
const DEFAULT_BASELINE = STRICT ? 0 : 2; // tailwind + eslint pending as of S11
const BASELINE = Number(baselineArg ? baselineArg.split("=")[1] : (process.env.AUDIT_CONFIG_FACTORY_BASELINE ?? DEFAULT_BASELINE));

// ---------------------------------------------------------------------------
// Run checks
// ---------------------------------------------------------------------------

const adopted   = [];
const pending   = [];
const missing   = []; // file doesn't exist (unexpected)

for (const check of CHECKS) {
  const filePath = join(ROOT, check.file);

  if (!existsSync(filePath)) {
    missing.push(check);
    continue;
  }

  const content = readFileSync(filePath, "utf8");

  // Check 1: factory function is imported from the appkit configs package
  const importsFactory = content.includes(check.factory) && content.includes(check.pkg);

  // Check 2: factory is actually called (not just imported)
  const callsFactory = content.includes(`${check.factory}(`);

  if (importsFactory && callsFactory) {
    adopted.push(check);
  } else {
    pending.push({ ...check, importsFactory, callsFactory });
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const pendingCount = pending.length + missing.length;

if (VERBOSE || STRICT || pendingCount > BASELINE) {
  console.log("audit-config-factories:\n");
  for (const c of adopted) {
    console.log(`  ✓ ${c.file.padEnd(24)} uses ${c.factory}`);
  }
  for (const c of pending) {
    const why = !c.importsFactory
      ? `missing import of ${c.factory} from "${c.pkg}"`
      : `imported but ${c.factory}() is never called`;
    console.log(`  ✗ ${c.file.padEnd(24)} PENDING — ${why}`);
  }
  for (const c of missing) {
    console.log(`  ? ${c.file.padEnd(24)} file not found`);
  }
  console.log("");
}

if (pendingCount === 0) {
  console.log("audit-config-factories: all config factories adopted ✓");
  process.exit(0);
}

if (pendingCount <= BASELINE && !STRICT) {
  console.log(
    `audit-config-factories: ${pendingCount} config(s) pending factory adoption` +
    ` (baseline ${BASELINE}) — pass.`,
  );
  if (!VERBOSE) console.log("Run with --verbose to see details and migration guides.");
  process.exit(0);
}

// Regression or strict mode: print migration guides and exit 1
process.stderr.write(
  `audit-config-factories: ${pendingCount} config(s) not using appkit factory helpers` +
  (pendingCount > BASELINE ? ` (regression: ${pendingCount} > baseline ${BASELINE})` : "") +
  ".\n\n",
);

for (const c of pending) {
  process.stderr.write(`[PENDING] ${c.file}\n`);
  process.stderr.write(`  Import and call ${c.factory} from "${c.pkg}".\n\n`);
  process.stderr.write("  Migration:\n");
  for (const line of c.migration) {
    process.stderr.write(`    ${line}\n`);
  }
  process.stderr.write("\n");
}

process.exit(1);
