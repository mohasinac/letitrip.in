#!/usr/bin/env node
/**
 * audit-feature-flags.mjs — the feature-flag concept must not come back.
 *
 * ## What this audit used to be
 *
 * It enforced that every disabled-feature surface — nav link, page export, API
 * route — was correctly gated by one of the `FEATURE_*` env flags, and that
 * `.env.example` and `FEATURE_FLAGS` stayed in parity. All of that was careful
 * work policing a mechanism that, measured on 2026-08-29, was doing nothing:
 *
 *   · `siteSettings.featureFlags` had 14 keys, **11 with no reader anywhere**.
 *     An admin could switch "Wishlists" or "Reviews" off and watch nothing
 *     happen.
 *   · The separate env system had 15 flags, **every one `true` in every
 *     environment**, guarding 68 routes and 9 layouts that were therefore
 *     always open.
 *   · The two shared the name "feature flags" and no data, so "is X enabled"
 *     had two unrelated answers.
 *
 * Both were deleted. The controls that were never flags moved to where they
 * belong and kept working:
 *
 *   featureFlags.listingTypes / .categoryTypes -> siteSettings.listings.*
 *   featureFlags.smsVerification               -> siteSettings.payment.*
 *   featureFlags.adminCheckoutBypass           -> siteSettings.payment.*
 *   FEATURE_RAZORPAY                           -> siteSettings.payment.razorpayEnabled
 *                                                 (via withRazorpayEnabled)
 *   FEATURE_COD                                -> siteSettings.payment.codEnabled
 *
 * ## What it checks now
 *
 * That none of it returns. A flag is a temporary switch around unfinished
 * work; every one of these outlived its feature and became a control that lied
 * about having an effect. If a future change genuinely needs one, it should be
 * a named setting with a reader, not a boolean nobody can trace.
 *
 * Rules:
 *   1. No `src/lib/features.ts`, and no imports from it.
 *   2. No `withFeatureGuard` / `requireFeatureFlag` / `getFlag` / `FEATURE_FLAGS`
 *      / `useFeatureFlags` identifiers.
 *   3. No `process.env.FEATURE_*` reads.
 *   4. No `featureFlags` key on the site-settings document or its consumers.
 *   5. No `FEATURE_*` entries left in `.env.example` — an orphaned env var
 *      outlives the code that read it and reads as configuration that matters.
 *
 * Suppression: `// audit-feature-flag-ok: <reason>` on the same line. Reserved
 * for prose that has to name the deleted mechanism (this file, CHANGELOGs,
 * the migration comments that explain where a control went).
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_ROOTS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__"]);
const EXTS = /\.(ts|tsx|mjs)$/;

const SUPPRESS = /\/\/\s*audit-feature-flag-ok\s*:/;

const BANNED = [
  { rx: /from\s+["']@\/lib\/features["']/, label: "imports the deleted src/lib/features.ts" },
  { rx: /\bwithFeatureGuard\s*\(/, label: "withFeatureGuard() — the env-flag route wrapper" },
  { rx: /\brequireFeatureFlag\s*\(/, label: "requireFeatureFlag() — the env-flag page guard" },
  { rx: /\bgetFlag\s*\(/, label: "getFlag() — the env-flag reader" },
  { rx: /\buseFeatureFlags\s*\(/, label: "useFeatureFlags() — the client flag hook" },
  { rx: /\bFEATURE_FLAG_META\b/, label: "FEATURE_FLAG_META — the admin flag list" },
  { rx: /process\.env\.FEATURE_[A-Z_]+/, label: "a raw process.env.FEATURE_* read" },
  { rx: /\bfeatureFlags\s*[:?.]/, label: "a `featureFlags` property — the deleted settings group" },
  /*
   * 🛑 The pattern this audit was NAMED for, and did not have.
   *
   * Every rule above targets one of the two systems deleted in W2f, so a bare
   * `FEATURE_FLAGS` object literal matched none of them — and one was live the
   * whole time: `appkit/src/core/site-config.ts` exported
   * `FEATURE_FLAGS = { CHAT_ENABLED: false }` with four readers, gating the
   * entire chatRooms stack off at runtime, while this audit printed
   * "clean ✓ (no flag concept in the tree)".
   *
   * The recorded definition of done — `git grep featureFlags|withFeatureGuard|
   * useFeatureFlags|getFlag(` returning zero — was satisfied and still wrong,
   * because that grep was a restatement of the same narrow list. A rule
   * narrower than its own claim is the W3-denominator failure (Root Cause #84),
   * here in the audit written to prevent this exact class.
   */
  { rx: /\bFEATURE_FLAGS\b/, label: "a `FEATURE_FLAGS` constant — flags by another name" },
];

const violations = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.test(e.name)) out.push(full);
  }
  return out;
}

// Rule 1 — the module itself must stay gone.
const FEATURES_MODULE = join(ROOT, "src", "lib", "features.ts");
if (existsSync(FEATURES_MODULE)) {
  violations.push({
    file: "src/lib/features.ts",
    line: 0,
    detail:
      "the env feature-flag module is back. Every one of its 15 flags was `true` " +
      "in every environment while guarding 68 routes; a control that cannot be off " +
      "is not a control. Use a named siteSettings field with a real reader.",
  });
}

// Rules 2-4 — no identifier or property survives.
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (rel === "scripts/audit-feature-flags.mjs") continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (SUPPRESS.test(line)) return;
      // Prose in a block comment explaining the migration is fine; code is not.
      const trimmed = line.trim();
      if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;
      for (const { rx, label } of BANNED) {
        if (rx.test(line)) {
          violations.push({ file: rel, line: i + 1, detail: `${label} — ${trimmed.slice(0, 100)}` });
          break;
        }
      }
    });
  }
}

// Rule 5 — no orphaned env vars advertising a mechanism that no longer exists.
const ENV_EXAMPLE = join(ROOT, ".env.example");
if (existsSync(ENV_EXAMPLE)) {
  readFileSync(ENV_EXAMPLE, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*FEATURE_[A-Z_]+\s*=/.test(line)) {
      violations.push({
        file: ".env.example",
        line: i + 1,
        detail: `orphaned flag env var: ${line.trim()} — nothing reads FEATURE_* any more`,
      });
    }
  });
}

if (violations.length === 0) {
  console.log("audit-feature-flags: clean ✓ (no flag concept in the tree)");
  process.exit(0);
}

console.error(`audit-feature-flags: ${violations.length} violation(s).\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.detail}\n`);
}
console.error(
  "Both feature-flag systems were deleted on 2026-08-29 — 11 of 14 siteSettings\n" +
    "flags had no reader, and all 15 env flags were `true` everywhere. If you need\n" +
    "to switch something off, add a named field to siteSettings with a real reader\n" +
    "and an admin control, so the state is visible and traceable.",
);
process.exit(1);
