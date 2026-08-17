#!/usr/bin/env node
/**
 * audit-feature-flags.mjs — Strict-zero guard for disabled-feature surfaces.
 *
 * Each FEATURE_* flag disables a product area. This audit verifies that every
 * known "disabled surface" — nav link, page export, API route handler — is
 * guarded by the correct flag check so that flipping the env var is the ONLY
 * thing needed to expose or hide a feature.
 *
 * What it checks:
 *   1. API routes under disabled-feature paths must call getFlag() and return
 *      early (404/405) when the flag is off.
 *   2. No FEATURE_* env var is read via process.env directly in .tsx/.ts files
 *      outside src/lib/features.ts — all reads must go through getFlag().
 *   3. Dashboard `layout.tsx` files under a route segment matching a known
 *      gated feature must call requireFeatureFlag(...) — catches a page-level
 *      guard being skipped the same way route guards are caught by Check 1
 *      (e.g. the original admin-dashboard Payouts-card bug: nav hid the link,
 *      but direct navigation still hit the guarded API unconditionally).
 *   4. Env-var/schema parity: every FEATURE_* declared in .env.example must
 *      exist in FEATURE_FLAGS (src/lib/features.ts), and vice versa — catches
 *      an orphaned env var whose gated feature was deleted (found and fixed
 *      2026-08-17: FEATURE_SHIPROCKET/FEATURE_MOCK_PAYMENT survived their own
 *      feature removals in .env.example/vitest.config.ts/the GitHub Actions
 *      feature-toggle workflow, invisible until someone happened to grep for
 *      them) as well as the opposite mistake — a new FEATURE_FLAGS entry with
 *      no corresponding .env.example line for developers to discover.
 *
 * Suppression: `// audit-feature-flag-ok: <reason>` on the same line.
 *
 * Mode: strict-zero (no baseline drift).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Rule 1: direct process.env["FEATURE_*"] reads outside the allowed file ──
// All flag reads must go through src/lib/features.ts → getFlag().
const ALLOWED_DIRECT_ENV_READ = [
  "src/lib/features.ts",
  "src/lib/features.js",
];

// Matches: process.env.FEATURE_  OR  process.env["FEATURE_"]
const DIRECT_ENV_RE = /process\.env(?:\[["']|\.)(FEATURE_[A-Z_]+)/g;

// ─── Rule 2: disabled-feature API route directories must contain a flag guard ─
// Format: { dir: "relative/path/to/api/route/dir", flag: "FEATURE_NAME" }
// Acceptable guard patterns: getFlag( or withFeatureGuard(
const GUARDED_ROUTES = [
  // AUCTIONS (P-5)
  { dir: "src/app/api/auctions",             flag: "FEATURE_AUCTIONS" },
  { dir: "src/app/api/bids",                 flag: "FEATURE_AUCTIONS" },
  { dir: "src/app/api/admin/bids",           flag: "FEATURE_AUCTIONS" },
  { dir: "src/app/api/realtime/bids",        flag: "FEATURE_AUCTIONS" },
  { dir: "src/app/api/store/bids",           flag: "FEATURE_AUCTIONS" },
  { dir: "src/app/api/user/bids",            flag: "FEATURE_AUCTIONS" },
  // EVENTS (P-4 / P-10 prize draws)
  { dir: "src/app/api/events",               flag: "FEATURE_EVENTS" },
  { dir: "src/app/api/admin/events",         flag: "FEATURE_EVENTS" },
  // RAZORPAY (P-13)
  { dir: "src/app/api/payment",              flag: "FEATURE_RAZORPAY" },
  // COUPONS (P-2)
  { dir: "src/app/api/admin/coupons",        flag: "FEATURE_COUPONS" },
  { dir: "src/app/api/store/coupons",        flag: "FEATURE_COUPONS" },
  { dir: "src/app/api/user/coupons",         flag: "FEATURE_COUPONS" },
  // PAYOUTS (P-7)
  { dir: "src/app/api/admin/payouts",        flag: "FEATURE_PAYOUTS" },
  { dir: "src/app/api/store/payouts",        flag: "FEATURE_PAYOUTS" },
  // BLOG (P-3)
  { dir: "src/app/api/admin/blog",           flag: "FEATURE_BLOG" },
  // CHAT (P-11)
  { dir: "src/app/api/chat",                 flag: "FEATURE_CHAT" },
  { dir: "src/app/api/user/conversations",   flag: "FEATURE_CHAT" },
  // SCAM_REGISTRY (P-12)
  { dir: "src/app/api/admin/scammers",       flag: "FEATURE_SCAM_REGISTRY" },
  { dir: "src/app/api/scams",                flag: "FEATURE_SCAM_REGISTRY" },
  // BUNDLES (P-17)
  { dir: "src/app/api/admin/bundles",        flag: "FEATURE_BUNDLES" },
];

// ─── Rule 3: gated dashboard page segments must have a page-level guard ──────
// Format: { dir: "relative/path/to/[locale]/section", flag: "FEATURE_NAME" }
// The layout.tsx at that path (or a layout.tsx in an ancestor up to and
// excluding the shared admin/store/user root layout) must call
// requireFeatureFlag(...). Mirrors GUARDED_ROUTES but for pages, not APIs.
const GUARDED_PAGES = [
  { dir: "src/app/[locale]/admin/coupons",   flag: "FEATURE_COUPONS" },
  { dir: "src/app/[locale]/admin/blog",      flag: "FEATURE_BLOG" },
  { dir: "src/app/[locale]/admin/scammers",  flag: "FEATURE_SCAM_REGISTRY" },
  { dir: "src/app/[locale]/admin/payouts",   flag: "FEATURE_PAYOUTS" },
  { dir: "src/app/[locale]/admin/bundles",   flag: "FEATURE_BUNDLES" },
  { dir: "src/app/[locale]/store/coupons",   flag: "FEATURE_COUPONS" },
  { dir: "src/app/[locale]/store/payouts",   flag: "FEATURE_PAYOUTS" },
  { dir: "src/app/[locale]/user/coupons",    flag: "FEATURE_COUPONS" },
  { dir: "src/app/[locale]/user/bids",       flag: "FEATURE_AUCTIONS" },
];

function walkTs(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (["node_modules", "dist", ".next", "__tests__"].includes(entry)) continue;
    const s = statSync(full, { throwIfNoEntry: false });
    if (!s) continue;
    if (s.isDirectory()) out.push(...walkTs(full));
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function fileContains(filePath, pattern) {
  try {
    return readFileSync(filePath, "utf8").includes(pattern);
  } catch {
    return false;
  }
}

function dirExists(rel) {
  try { statSync(join(ROOT, rel)); return true; } catch { return false; }
}

const violations = [];

// ─── Check 1: direct process.env FEATURE_* reads ─────────────────────────────
for (const file of walkTs(join(ROOT, "src"))) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (ALLOWED_DIRECT_ENV_READ.some(a => rel.endsWith(a))) continue;
  const src = readFileSync(file, "utf8");
  DIRECT_ENV_RE.lastIndex = 0;
  let m;
  while ((m = DIRECT_ENV_RE.exec(src)) !== null) {
    const lineStart = src.lastIndexOf("\n", m.index) + 1;
    const lineEnd = src.indexOf("\n", m.index);
    const line = src.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    if (line.includes("audit-feature-flag-ok")) continue;
    const lineNum = src.slice(0, m.index).split("\n").length;
    violations.push({
      rule: "DIRECT_ENV_READ",
      file: rel,
      line: lineNum,
      detail: `Direct \`process.env.${m[1]}\` — use \`getFlag("${m[1].replace("FEATURE_", "")}")\` from @/lib/features`,
    });
  }
}

// ─── Check 2: disabled-feature route dirs must guard with getFlag ─────────────
for (const { dir, flag } of GUARDED_ROUTES) {
  if (!dirExists(dir)) continue; // route doesn't exist yet — skip
  // Find all route.ts files in this directory tree
  const routeFiles = walkTs(join(ROOT, dir)).filter(f => f.endsWith("route.ts") || f.endsWith("route.tsx"));
  for (const rf of routeFiles) {
    const src = readFileSync(rf, "utf8");
    const rel = relative(ROOT, rf).replace(/\\/g, "/");
    // Must contain getFlag( or withFeatureGuard( somewhere in the file
    if (!src.includes("getFlag(") && !src.includes("withFeatureGuard(")) {
      violations.push({
        rule: "MISSING_FEATURE_GUARD",
        file: rel,
        line: 1,
        detail: `Route under disabled-feature path must call withFeatureGuard("${flag.replace("FEATURE_", "")}") or getFlag(...) — returns 404 when flag is off`,
      });
    }
  }
}

// ─── Check 3: gated page segments must have a layout.tsx flag guard ──────────
for (const { dir, flag } of GUARDED_PAGES) {
  if (!dirExists(dir)) continue; // page doesn't exist yet — skip
  const layoutPath = join(ROOT, dir, "layout.tsx");
  if (!fileContains(layoutPath, "requireFeatureFlag(")) {
    violations.push({
      rule: "MISSING_PAGE_GUARD",
      file: `${dir}/layout.tsx`,
      line: 1,
      detail: `Gated page segment must have a layout.tsx calling requireFeatureFlag("${flag.replace("FEATURE_", "")}")`,
    });
  }
}

// ─── Check 4: FEATURE_FLAGS (code) <-> .env.example parity ───────────────────
{
  const featuresSrc = readFileSync(join(ROOT, "src", "lib", "features.ts"), "utf8");
  const arrayMatch = featuresSrc.match(/export const FEATURE_FLAGS = \[([\s\S]*?)\] as const;/);
  const codeFlags = new Set(
    arrayMatch
      ? [...arrayMatch[1].matchAll(/"([A-Z_]+)"/g)].map((m) => m[1])
      : [],
  );

  const envExamplePath = join(ROOT, ".env.example");
  let envFlags = new Set();
  try {
    const envSrc = readFileSync(envExamplePath, "utf8");
    envFlags = new Set(
      [...envSrc.matchAll(/^FEATURE_([A-Z_]+)=/gm)].map((m) => m[1]),
    );
  } catch {
    // .env.example not present (e.g. a checkout that never copied it) —
    // nothing to reconcile against.
  }

  if (envFlags.size > 0) {
    for (const flag of envFlags) {
      if (!codeFlags.has(flag)) {
        violations.push({
          rule: "ORPHANED_ENV_FLAG",
          file: ".env.example",
          line: 1,
          detail: `FEATURE_${flag} is declared but has no entry in FEATURE_FLAGS (src/lib/features.ts) — the feature it gated was likely removed. Delete the env var (here, .env.local, vitest.config.ts, .github/workflows/feature-toggle.yml).`,
        });
      }
    }
    for (const flag of codeFlags) {
      if (!envFlags.has(flag)) {
        violations.push({
          rule: "MISSING_ENV_EXAMPLE_ENTRY",
          file: "src/lib/features.ts",
          line: 1,
          detail: `FEATURE_FLAGS includes "${flag}" but .env.example has no FEATURE_${flag}= line — add one so developers can discover and set it.`,
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-feature-flags: clean ✓");
  process.exit(0);
}

const byRule = {};
for (const v of violations) {
  (byRule[v.rule] ??= []).push(v);
}

for (const [rule, hits] of Object.entries(byRule)) {
  console.error(`\n[${rule}] ${hits.length} violation(s)`);
  for (const v of hits.slice(0, 20)) {
    console.error(`  ${v.file}:${v.line} — ${v.detail}`);
  }
  if (hits.length > 20) console.error(`  ... and ${hits.length - 20} more`);
}

console.error(`\naudit-feature-flags: ${violations.length} violation(s). See above.`);
process.exit(1);
