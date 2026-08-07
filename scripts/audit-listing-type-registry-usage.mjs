#!/usr/bin/env node
/**
 * audit-listing-type-registry-usage — real registry dispatch enforcement.
 *
 * EMI/art-stickers session (2026-08-07). The listing-type plugin registry
 * (`appkit/src/_internal/shared/listing-types/_registry.ts` — `pluginFor()`,
 * `LISTING_TYPE_REGISTRY`), the checkout rule registry (`_internal/shared/
 * checkout/rules` — `getListingRule()`), and the capability registry
 * (`_internal/shared/listing-types/capabilities.ts` — `capabilityFor()`)
 * are the single source of truth for how a `ListingType` value changes
 * behavior. Every call site that used to hand-roll that dispatch (ternary
 * chains, `switch` statements, OR/AND-chained `isXListing()` predicate
 * calls) was retrofitted this session to read from one of those registries
 * instead. This audit is the tripwire that keeps it that way.
 *
 * Rules (scans appkit/src/**\/*.{ts,tsx} and src/**\/*.{ts,tsx}, excluding
 * the registry-owning directories themselves):
 *
 *   LISTING_TYPE_TERNARY_CHAIN — the same `listingType`-referencing
 *     expression (bare `listingType`, `<x>.listingType`, or
 *     `normalizeListingType(<x>)`) is compared via `===`/`==` against 2+
 *     DISTINCT ListingType literal values within a ~20-line window. This is
 *     the signature of a hand-rolled ternary or if/else-if dispatch chain
 *     that duplicates what `pluginFor()` already returns.
 *
 *   LISTING_TYPE_OR_CHAIN — 2+ DISTINCT `isXListing(` / `isXProduct(`
 *     predicate calls joined by `||` or `&&` on one line. A single
 *     predicate call (`if (!isAuctionListing(x))`) is fine — it's an
 *     OR/AND-chain of two or more DIFFERENT type checks that signals ad hoc
 *     multi-type dispatch.
 *
 *   LISTING_TYPE_SWITCH — a `switch` statement whose switched expression
 *     contains `listingType`, with 2+ `case "<value>":` labels matching
 *     known ListingType literals.
 *
 * Excluded directories (the registries themselves — and the modules that
 * define the canonical predicates/types they dispatch on):
 *   appkit/src/_internal/shared/listing-types/**
 *   appkit/src/_internal/shared/checkout/rules/**
 *   appkit/src/features/products/utils/listing-type.ts (defines isXListing)
 *   **\/__tests__/**, **\/*.test.ts(x)
 *
 * Strict-zero. There is deliberately NO per-line suppression marker for
 * this audit (unlike every other audit in this repo) — see CLAUDE.md
 * feedback from the 2026-08-07 EMI/art-stickers session: a marker here
 * would hide the violation instead of fixing it. The only way to close a
 * finding is to route the call site through pluginFor() / getListingRule()
 * / capabilityFor(), or to extend one of those registries with a new field.
 *
 * Exit 0 — clean
 * Exit 1 — violations found
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_ROOTS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__mocks__"]);

// Registry-owning directories / files — excluded from scanning entirely.
const EXCLUDED_PATH_FRAGMENTS = [
  "appkit/src/_internal/shared/listing-types/",
  "appkit/src/_internal/shared/checkout/rules/",
  "appkit/src/features/products/utils/listing-type.ts",
];

const KNOWN_LISTING_TYPES = [
  "standard",
  "auction",
  "pre-order",
  "prize-draw",
  "classified",
  "digital-code",
  "live",
  "art",
  "stickers",
];

function isExcludedPath(relPath) {
  if (relPath.includes("__tests__/") || relPath.endsWith(".test.ts") || relPath.endsWith(".test.tsx")) {
    return true;
  }
  return EXCLUDED_PATH_FRAGMENTS.some((frag) => relPath.includes(frag));
}

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      const ext = extname(entry.name);
      if (ext === ".ts" || ext === ".tsx") files.push(full);
    }
  }
  return files;
}

function isCommentLine(line) {
  const t = line.trimStart();
  return t.startsWith("//") || t.startsWith("*");
}

// ── Rule 1: ternary / if-else-if chains ──────────────────────────────────────
// Matches `<expr> === "value"` / `<expr> == "value"` where <expr> is a
// listingType-referencing expression. Captures the LHS "anchor" text so
// occurrences can be grouped by the same underlying expression.
const RE_LISTING_TYPE_COMPARISON =
  /((?:[\w.]*\.listingType|(?<![\w.])listingType|normalizeListingType\([^)]*\)))\s*===?\s*"([a-z-]+)"/g;

function findTernaryChainViolations(src, lines) {
  const violations = [];
  const WINDOW_LINES = 20;

  // Collect all (lineIndex, anchor, value) matches, skipping comment lines.
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (isCommentLine(lines[i])) continue;
    let m;
    const re = new RegExp(RE_LISTING_TYPE_COMPARISON);
    while ((m = re.exec(lines[i])) !== null) {
      const anchor = m[1].replace(/\s+/g, "");
      const value = m[2];
      if (!KNOWN_LISTING_TYPES.includes(value)) continue;
      matches.push({ line: i, anchor, value });
    }
  }

  // Group matches sharing the same anchor text within a sliding window;
  // flag when a group spans 2+ distinct values AND the lines between the
  // first and last match contain actual ternary (`?`) or `else` connective
  // syntax — i.e. the comparisons are branches of ONE decision, not
  // independent sequential guard clauses that happen to reference the same
  // field for unrelated reasons (which is legitimate per-type business
  // logic, not ad hoc dispatch duplicating a registry).
  const seen = new Set();
  for (let a = 0; a < matches.length; a++) {
    const group = [matches[a]];
    for (let b = a + 1; b < matches.length; b++) {
      if (matches[b].line - matches[a].line > WINDOW_LINES) break;
      if (matches[b].anchor === matches[a].anchor) group.push(matches[b]);
    }
    const distinctValues = new Set(group.map((g) => g.value));
    if (distinctValues.size < 2) continue;

    // Every match after the first must itself begin a ternary/else-if
    // continuation (`: <expr>` or `else if (<expr>)`) — this is what
    // distinguishes branches of ONE decision from independent sequential
    // guard clauses that happen to reference the same field.
    const isConnected = group.slice(1).every((g) => /^\}?\s*(:|else\b)/.test(lines[g.line]));
    if (!isConnected) continue;

    const key = `${matches[a].anchor}:${group.map((g) => g.line).join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    violations.push({
      line: matches[a].line + 1,
      text: lines[matches[a].line].trim(),
      detail: `chain compares "${matches[a].anchor}" against ${[...distinctValues].map((v) => `"${v}"`).join(", ")}`,
    });
  }
  return violations;
}

// ── Rule 2: OR/AND-chained predicate calls ───────────────────────────────────
const RE_PREDICATE_CALL = /\bis[A-Z]\w*(?:Listing|Product)\s*\(/g;

function findOrChainViolations(lines) {
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isCommentLine(raw)) continue;
    if (!raw.includes("||") && !raw.includes("&&")) continue;
    const names = new Set();
    let m;
    const re = new RegExp(RE_PREDICATE_CALL);
    while ((m = re.exec(raw)) !== null) {
      names.add(m[0].slice(0, -1)); // drop trailing "("
    }
    if (names.size < 2) continue;
    violations.push({
      line: i + 1,
      text: raw.trim(),
      detail: `OR/AND-chains ${[...names].join(", ")}`,
    });
  }
  return violations;
}

// ── Rule 3: switch statements on listingType ─────────────────────────────────
function findSwitchViolations(src, lines) {
  const violations = [];
  const RE_SWITCH_OPEN = /switch\s*\(([^)]*)\)/;
  const RE_CASE = /case\s+"([a-z-]+)"\s*:/;

  for (let i = 0; i < lines.length; i++) {
    if (isCommentLine(lines[i])) continue;
    const openMatch = lines[i].match(RE_SWITCH_OPEN);
    if (!openMatch) continue;
    if (!openMatch[1].includes("listingType")) continue;

    // Scan forward tracking brace depth to find the switch block extent.
    let depth = 0;
    let started = false;
    const caseValues = new Set();
    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      for (const ch of line) {
        if (ch === "{") { depth++; started = true; }
        else if (ch === "}") depth--;
      }
      const caseMatch = line.match(RE_CASE);
      if (caseMatch && KNOWN_LISTING_TYPES.includes(caseMatch[1])) caseValues.add(caseMatch[1]);
      if (started && depth <= 0) break;
    }
    if (caseValues.size >= 2) {
      violations.push({
        line: i + 1,
        text: lines[i].trim(),
        detail: `switch on listingType with cases ${[...caseValues].map((v) => `"${v}"`).join(", ")}`,
      });
    }
  }
  return violations;
}

// ── Scan ──────────────────────────────────────────────────────────────────────
const files = SCAN_ROOTS.flatMap((root) => walk(root));
const allViolations = [];

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (isExcludedPath(rel)) continue;

  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");

  const found = [
    ...findTernaryChainViolations(src, lines).map((v) => ({ ...v, rule: "LISTING_TYPE_TERNARY_CHAIN" })),
    ...findOrChainViolations(lines).map((v) => ({ ...v, rule: "LISTING_TYPE_OR_CHAIN" })),
    ...findSwitchViolations(src, lines).map((v) => ({ ...v, rule: "LISTING_TYPE_SWITCH" })),
  ];
  for (const v of found) allViolations.push({ file: rel, ...v });
}

// ── Report ────────────────────────────────────────────────────────────────────
if (allViolations.length === 0) {
  console.log("audit-listing-type-registry-usage: clean");
  process.exit(0);
}

allViolations.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));

console.error(`audit-listing-type-registry-usage: ${allViolations.length} violation(s).\n`);
console.error("Every listing-type dispatch must go through a registry:");
console.error("  pluginFor(type)      — appkit/src/_internal/shared/listing-types/_registry.ts");
console.error("  getListingRule(type) — appkit/src/_internal/shared/checkout/rules");
console.error("  capabilityFor(type)  — appkit/src/_internal/shared/listing-types/capabilities.ts");
console.error("");
console.error("No suppression marker exists for this audit — fix the call site or extend a registry.\n");
for (const v of allViolations) {
  console.error(`  [${v.rule}] ${v.file}:${v.line}`);
  console.error(`    ${v.text}`);
  console.error(`    ${v.detail}`);
}
process.exit(1);
