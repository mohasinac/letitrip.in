#!/usr/bin/env node
/**
 * audit-tester-plugin-wiring.mjs — strict-zero.
 *
 * Guards the boundary the tester runner rests on.
 *
 * A tester run WIPES the seeded catalog from a live project and re-seeds it. That
 * is only tolerable because the wipe is tiered: real accounts, their Firebase Auth
 * records, their saved addresses and siteSettings (which carries the encrypted live
 * API keys) are PRESERVED, and only the catalog plus the transactional rows pointing
 * at it are destroyed.
 *
 * Nothing in TypeScript enforces that boundary — tester/scripts/lib/collections.mjs
 * is plain JS in a submodule, outside tsc, outside eslint, and outside every other
 * audit (all of which scan `src` and `appkit/src` only). So this is the one check.
 *
 * Rules:
 *   R1  Every collection with seed data is classified into exactly one tier.
 *       Unclassified means preserved, so a NEW collection is safe by default — but
 *       silently un-seeded, which is its own bug. This makes it visible.
 *   R2  The PRESERVE tier still contains the four collections whose loss is
 *       permanent. Removing one is how a run starts deleting real accounts.
 *   R3  Nothing under tester/scripts/ except the session helper touches the auth
 *       endpoints. /api/auth/login, /session and /me share ONE 10-request-per-60s
 *       bucket keyed on IP; a second caller exhausts the budget the run needs.
 *   R4  Time-bound tester fixtures go through tester-window.ts. A hard-coded
 *       duration cannot be shortened, which is what makes "watch an auction end"
 *       untestable in any run shorter than the literal.
 *
 * Skips cleanly (exit 0) when tester/ is absent — a fresh clone without
 * --recursive must not fail `npm run check`.
 *
 * Strict-zero, no suppression marker.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TESTER_DIR = resolve(ROOT, "tester");
const violations = [];

if (!existsSync(TESTER_DIR)) {
  console.log("audit-tester-plugin-wiring: tester/ not checked out — skipping.");
  process.exit(0);
}

const read = (p) => readFileSync(p, "utf8");
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ── Load the tier declarations ──────────────────────────────────────────── */

const collectionsPath = resolve(TESTER_DIR, "scripts/lib/collections.mjs");
if (!existsSync(collectionsPath)) {
  violations.push(`R1 missing file: tester/scripts/lib/collections.mjs — the tier boundary is undeclared`);
}

const tiers = { PRESERVE: [], SEED_OWNED: [], CASCADE: [] };
if (existsSync(collectionsPath)) {
  const src = stripComments(read(collectionsPath));
  for (const name of ["PRESERVE", "SEED_OWNED"]) {
    const m = src.match(new RegExp(`export const ${name} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`));
    if (m) tiers[name] = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  const cm = src.match(/export const CASCADE = Object\.freeze\(\[([\s\S]*?)\]\);/);
  if (cm) tiers.CASCADE = [...cm[1].matchAll(/collection:\s*"([^"]+)"/g)].map((x) => x[1]);
}

/* ── R2: the preserve tier must still hold the irreplaceable four ────────── */

const MUST_PRESERVE = ["users", "addresses", "sessions", "siteSettings"];
for (const c of MUST_PRESERVE) {
  if (!tiers.PRESERVE.includes(c)) {
    violations.push(
      `R2 "${c}" is no longer in the PRESERVE tier of tester/scripts/lib/collections.mjs. ` +
        `A run would delete it, and it cannot be rebuilt from seed data.`,
    );
  }
}

/* ── R1: every seeded collection is classified ───────────────────────────── */

// Derive collection names from the seed barrel rather than a hand-kept list —
// a hand-kept list is the drift this audit exists to prevent.
const seedIndex = resolve(ROOT, "appkit/src/seed/index.ts");
const seededCollections = new Set();
if (existsSync(seedIndex)) {
  const src = stripComments(read(seedIndex));
  for (const m of src.matchAll(/collection:\s*"([a-zA-Z]+)"/g)) seededCollections.add(m[1]);
  for (const m of src.matchAll(/^\s*([a-zA-Z]+):\s*\w+SeedData/gm)) seededCollections.add(m[1]);
}

const classified = new Set([...tiers.PRESERVE, ...tiers.SEED_OWNED, ...tiers.CASCADE]);
for (const c of seededCollections) {
  if (!classified.has(c)) {
    violations.push(
      `R1 "${c}" has seed data but is not classified in tester/scripts/lib/collections.mjs. ` +
        `Unclassified means PRESERVED, so a run will re-seed nothing for it and leave stale rows. ` +
        `Add it to PRESERVE, SEED_OWNED or CASCADE.`,
    );
  }
}

const overlap = tiers.SEED_OWNED.filter((c) => tiers.PRESERVE.includes(c));
for (const c of overlap) violations.push(`R1 "${c}" is in BOTH PRESERVE and SEED_OWNED — the tiers must be disjoint.`);

/* ── R3: only the session helper may touch the auth endpoints ────────────── */

const AUTH_RE = /\/api\/auth\/(login|session|me)\b/;
const ALLOWED_AUTH_CALLERS = new Set(["fetch-cases.mjs", "record-verdicts.mjs"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

for (const file of walk(resolve(TESTER_DIR, "scripts"))) {
  const base = file.split(/[\\/]/).pop();
  if (ALLOWED_AUTH_CALLERS.has(base)) continue;
  const src = stripComments(read(file));
  if (AUTH_RE.test(src)) {
    violations.push(
      `R3 ${file.replace(ROOT, ".")} references an /api/auth/* endpoint. ` +
        `login, session and me share ONE 10-req/60s bucket keyed on IP — only ` +
        `${[...ALLOWED_AUTH_CALLERS].join(" and ")} may call them.`,
    );
  }
}

/* ── R4: time-bound tester fixtures derive from tester-window.ts ─────────── */

const seedDir = resolve(ROOT, "appkit/src/features/tester/seed-data");
const TIME_FIELDS = /(auctionEndDate|drawWindowDurationMinutes|expiresAt|checkoutDeadline|spinWindowEnd)\s*:/;
if (existsSync(seedDir)) {
  for (const name of readdirSync(seedDir)) {
    if (!name.endsWith("-seed-data.ts")) continue;
    const file = resolve(seedDir, name);
    const src = stripComments(read(file));
    if (!TIME_FIELDS.test(src)) continue;
    if (!/from "\.\/tester-window"/.test(src)) {
      violations.push(
        `R4 ${name} sets a time-bound fixture field but does not import ./tester-window. ` +
          `A hard-coded duration cannot be shortened, so the case that watches it close ` +
          `is untestable in any run shorter than the literal.`,
      );
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────────────── */

if (violations.length > 0) {
  console.error(`\naudit-tester-plugin-wiring: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error("");
  process.exit(1);
}

console.log(
  `audit-tester-plugin-wiring: OK — ${tiers.PRESERVE.length} preserved, ` +
    `${tiers.SEED_OWNED.length} seed-owned, ${tiers.CASCADE.length} cascade.`,
);
process.exit(0);
