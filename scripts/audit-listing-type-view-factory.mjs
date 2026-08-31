#!/usr/bin/env node
/**
 * audit-listing-type-view-factory.mjs — one config per listing type, not N.
 *
 * WHY THIS EXISTS
 *
 *   `buildListingTypeListingConfig` was written to end exactly this
 *   duplication, is tagged `pattern:factory`, and its own header describes the
 *   problem. It then acquired five ADMIN callers and zero SELLER ones, while
 *   1,033 lines of hand-written seller equivalents sat in the same repository.
 *   Nothing failed, because nothing was looking: `DataListingView` takes an
 *   opaque `TResponse` and per-view `mapRows`, so N divergent copies typecheck
 *   perfectly.
 *
 *   The drift it hid was real. Digital Codes offered four sort options where
 *   its four siblings offered five, and all five hand-wrote a sort array the
 *   plugin registry already publishes. A fix to any of it had to be applied
 *   five times, and never was.
 *
 * WHAT IT CHECKS
 *
 *   R1  A per-type listing view stays a WRAPPER. A file whose whole job is one
 *       listing type must not declare its own `ListingViewConfig` — that is
 *       the sixth copy starting.
 *
 *   R2  No raw `"listingType==<type>"` string literal. The five originals all
 *       built that clause by hand, which is invisible to
 *       `audit-sieve-field-schema-parity` and to every other check that reads
 *       field names: a typo returns zero rows forever with no error anywhere
 *       (Root Cause #33). Use `sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, …)`.
 *
 *   R3  The spec registry stays exhaustive for the types that have a dedicated
 *       seller page. A page under `src/app/[locale]/store/<slug>/page.tsx`
 *       rendering a listing-type view must have a matching spec entry —
 *       otherwise the page renders and the type has no config.
 *
 * Strict-zero. Suppression: `// audit-listing-type-view-ok: <reason>` on the
 * offending line or the line above.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "audit-listing-type-view-ok";

/** The one component and the one factory that are ALLOWED to hold a config. */
const OWNERS = new Set([
  "SellerListingTypeView.tsx",
  "listing-type-listing-config.ts",
]);

/**
 * Views that legitimately span MORE than one listing type, so they are not
 * per-type wrappers and keep their own config.
 */
const MULTI_TYPE = new Set([
  "SellerProductsView.tsx",
  "AdminProductsView.tsx",
]);

const violations = [];

function suppressed(lines, i) {
  return (lines[i] ?? "").includes(MARKER) || (lines[i - 1] ?? "").includes(MARKER);
}

/**
 * Blank out comments, keeping line numbers.
 *
 * 🛑 Not optional. The first draft of this audit skipped it and reported 20
 * violations, of which six were DOCSTRINGS describing the very pattern being
 * banned — `products.repository.ts` explaining why `listingType==X` clauses
 * replaced boolean combos, `useFeaturedAuctions` narrating a past bug. An audit
 * that flags the explanation of a rule alongside its breach trains people to
 * ignore it. Same defect Root Cause #87 records finding in its own audit.
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let mode = "code"; // code | line | block | str | tpl
  let quote = "";
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") { mode = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && n === "*") { mode = "block"; out += "  "; i += 2; continue; }
      if (c === '"' || c === "'") { mode = "str"; quote = c; out += c; i++; continue; }
      if (c === "`") { mode = "tpl"; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === "line") {
      if (c === "\n") { mode = "code"; out += c; i++; continue; }
      out += " "; i++; continue;
    }
    if (mode === "block") {
      if (c === "*" && n === "/") { mode = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? "\n" : " "; i++; continue;
    }
    // str / tpl — copied verbatim, including escapes, so a literal is intact.
    if (c === "\\") { out += c + (n ?? ""); i += 2; continue; }
    if (mode === "str" && c === quote) { mode = "code"; out += c; i++; continue; }
    if (mode === "tpl" && c === "`") { mode = "code"; out += c; i++; continue; }
    out += c; i++;
  }
  return out;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

const FILES = [
  ...walk(join(ROOT, "appkit", "src")),
  ...walk(join(ROOT, "src")),
];

/**
 * A view for one of the five types the shared component covers.
 *
 * Deliberately NOT every per-type view. Auctions, Pre-Orders and Prize Draws
 * carry real per-type content the generic row cannot express — a bid count and
 * reserve, a delivery date, a "View entries" action — so they legitimately hold
 * their own config, and demanding otherwise would push people toward
 * suppression markers instead of the factory. The five below are the ones whose
 * configs were byte-identical modulo a string.
 */
const PER_TYPE_NAME =
  /^(Seller|Admin)(Art|Stickers|Classified|DigitalCodes|Live)View\.tsx$/;

for (const file of FILES) {
  const name = basename(file);
  if (OWNERS.has(name) || MULTI_TYPE.has(name)) continue;

  const raw = readFileSync(file, "utf8");
  // Code only, for matching. Suppression markers live in comments, so they are
  // read from `rawLines` — line numbers are preserved across both.
  const lines = stripComments(raw).split(/\r?\n/);
  const rawLines = raw.split(/\r?\n/);
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");

  // R1 — a per-type view declaring its own config.
  if (PER_TYPE_NAME.test(name)) {
    lines.forEach((line, i) => {
      if (/:\s*ListingViewConfig\s*</.test(line) && !suppressed(rawLines, i)) {
        violations.push({
          rule: "PER_TYPE_VIEW_OWNS_CONFIG",
          file: rel,
          line: i + 1,
          detail:
            `${name} declares its own ListingViewConfig. A per-type view is a wrapper — ` +
            `render <SellerListingTypeView type="…"> or call buildListingTypeListingConfig(type).`,
        });
      }
    });
  }

  // R2 — a hand-built listingType clause, anywhere.
  lines.forEach((line, i) => {
    if (/["'`]listingType\s*==/.test(line) && !suppressed(rawLines, i)) {
      violations.push({
        rule: "RAW_LISTING_TYPE_CLAUSE",
        file: rel,
        line: i + 1,
        detail:
          `Raw "listingType==…" literal. Use sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, type) ` +
          `— a hand-built clause is invisible to the field-name audits, and a typo returns zero rows silently.`,
      });
    }
  });
}

// R3 — every store page that renders the shared view has a spec entry.
const SPEC_FILE = join(ROOT, "appkit/src/features/seller/components/SellerListingTypeView.tsx");
if (existsSync(SPEC_FILE)) {
  const specSrc = readFileSync(SPEC_FILE, "utf8");
  const block = specSrc.slice(specSrc.indexOf("SELLER_LISTING_TYPE_SPECS"));
  const declared = new Set(
    [...block.matchAll(/^\s{2}"?([a-z-]+)"?:\s*\{/gm)].map((m) => m[1]),
  );

  /*
   * 🛑 Scans EVERY file, not just store pages.
   *
   * The first draft looked only under `src/app/[locale]/store/**`, and the
   * pages there render the named wrappers (`<SellerArtView />`) — they never
   * mention `SellerListingTypeView` at all. So the check matched nothing and
   * reported OK for exactly the state it exists to catch: planting a broken
   * spec key produced zero violations. It was caught only by deliberately
   * breaking it and watching it pass (Root Cause #87's rule).
   */
  for (const file of FILES) {
    if (file === SPEC_FILE) continue;
    const src = stripComments(readFileSync(file, "utf8"));
    const used = [...src.matchAll(/<SellerListingTypeView\s[^>]*type="([a-z-]+)"/g)].map((m) => m[1]);
    for (const type of used) {
      if (!declared.has(type)) {
        violations.push({
          rule: "SPEC_MISSING_FOR_RENDERED_TYPE",
          file: file.slice(ROOT.length + 1).replace(/\\/g, "/"),
          line: 1,
          detail: `Renders <SellerListingTypeView type="${type}"> but SELLER_LISTING_TYPE_SPECS has no "${type}" entry.`,
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("[audit-listing-type-view-factory] OK — 0 violations");
  process.exit(0);
}

console.error(`[audit-listing-type-view-factory] ${violations.length} violation(s).\n`);
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.file}:${v.line}`);
  console.error(`    ${v.detail}\n`);
}
console.error(`Suppress a genuine exception with: // ${MARKER}: <reason>`);
process.exit(1);
