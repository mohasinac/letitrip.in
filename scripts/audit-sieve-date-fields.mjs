#!/usr/bin/env node
/**
 * audit-sieve-date-fields.mjs — Firestore Timestamp field guard for Sieve
 * field configs.
 *
 * Root cause (2026-08-20): sievejs's default `convertValue()`
 * (node_modules/@mohasinac/sievejs/src/processor.js) only coerces
 * "true"/"false"/numeric strings — everything else, including an ISO date
 * string, is left as a plain JS string. The Firebase adapter then calls
 * `.where(field, ">=", "<iso-string>")` verbatim. When `field` is stored in
 * Firestore as a Timestamp, an inequality (`>`, `<`, `>=`, `<=`) comparing a
 * Timestamp against a string value matches ZERO documents — Firestore
 * requires the query value's type to match the field's stored type for
 * range comparisons — silently, with no error and no warning.
 *
 * This is exactly what broke the public auctions listing's default "Show
 * ended: off" view: `auctionEndDate>=<now>` matched nothing, so only
 * clicking "Show ended" (which removes the filter entirely) revealed any
 * auctions at all — see CLAUDE.md's Recurrent Root Cause Patterns.
 *
 * The fix is `SieveFieldConfig.parseValue` (appkit/src/providers/db-
 * firebase/sieve.ts) — sievejs already threads a per-field `parseValue`
 * hook through `convertValue()`; appkit just didn't expose or use it.
 * `parseSieveDateValue` (same file) converts the raw string to a real
 * `Date`, which the Admin SDK compares correctly against a Timestamp field.
 *
 * This audit statically scans every `.ts`/`.tsx` file under `appkit/src` —
 * NOT just `*.repository.ts` — for Sieve field config entries (`fieldName: {
 * canFilter: true, canSort: ..., ... }`) whose key LOOKS like a Firestore
 * Timestamp field (ends in `At`/`Date`/`Time`, or is in the small
 * named-exception list below for fields that don't follow that suffix
 * convention) and is filterable (`canFilter: true`) but has no `parseValue`.
 * Strict zero — every new Timestamp-typed filterable field must set
 * `parseValue: parseSieveDateValue` (or an explicit, reasoned
 * `// audit-sieve-date-field-ok: <reason>` on the same line for a field that
 * matches the naming heuristic but is genuinely NOT a Timestamp).
 *
 * **Whole-tree scan, not repository-only (2026-08-20 follow-up)**: a Sieve
 * field config doesn't have to live in a `*.repository.ts` file to be real —
 * `PRODUCT_FEATURE_SIEVE_FIELDS` lives in `features/products/schemas/
 * product-features.ts` and is imported into `product-features.repository.ts`.
 * An audit scoped to `*.repository.ts` filenames would miss a future
 * Timestamp field added there (or in any other schema/action/service file
 * that defines its own field-config object consumed by `sieveQuery`/
 * `applySieveToFirestore`).
 *
 * **The `findAll()` legacy query path is a separate, un-auditable gap, fixed
 * at the source instead of here**: `BaseRepository`/`FirebaseRepository`
 * (`appkit/src/providers/db-firebase/base.ts`) expose a second, older query
 * method — `findAll(query: SieveQuery)` — that parses filter strings with
 * its own standalone `coerceValue()`, entirely separate from
 * `SieveFieldConfig`/`parseValue`. There is no per-field config object on
 * that path for an audit to inspect, so a future `findAll({filters:
 * "createdAt>=..."})` call would hit the identical Timestamp-vs-string bug
 * with nothing here to catch it. `coerceValue()` was hardened directly
 * (auto-detects ISO-8601-shaped strings and converts them to `Date`) so the
 * bug class is closed at the root for that path instead of policed by a
 * static check.
 *
 * Method: plain regex over raw source text, no TS compiler in the loop —
 * matches this project's existing audit convention (see
 * audit-filter-tab-enums.mjs for precedent). Field config object literals in
 * this codebase never nest a second `{}` inside themselves, so a
 * non-greedy `\{([^{}]*)\}` capture is sufficient. Comments are stripped
 * before matching so a docstring example (e.g. the one in `sieve.ts` itself)
 * can't false-positive.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIR = join(ROOT, "appkit/src");

/**
 * Field names that don't end in At/Date/Time but ARE Firestore Timestamps —
 * add here (with the file it lives in noted) whenever a new one is found
 * that the suffix heuristic can't catch.
 */
const EXTRA_TIMESTAMP_FIELD_NAMES = new Set([
  "lastActivity", // session.repository.ts
]);

/** Suppression marker: `// audit-sieve-date-field-ok: <reason>` on the same line. */
const SUPPRESS_RE = /audit-sieve-date-field-ok\s*:/;

/** camelCase suffix heuristic: createdAt, auctionEndDate, expiresAt, etaDate, submittedAt, occurredAt... */
const DATE_SUFFIX_RE = /(?:[a-z0-9])(?:At|Date|Time)$/;

function looksLikeDateField(key) {
  const bare = key.replace(/^"|"$/g, "").split(".").pop() ?? key;
  return DATE_SUFFIX_RE.test(bare) || EXTRA_TIMESTAMP_FIELD_NAMES.has(bare);
}

const SKIP_DIR_NAMES = new Set(["node_modules", "__tests__", "dist"]);
const SKIP_FILE_RE = /\.(test|spec|d)\.tsx?$/;

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      walk(p, out);
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !SKIP_FILE_RE.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Extracts every `key: { ...body... }` field-config entry from a source
 * file. Keys may be bare identifiers or quoted dot-paths
 * (`"validity.startDate"`). Object bodies here never contain a nested `{}`.
 */
function extractFieldConfigs(src) {
  const clean = stripComments(src);
  const entries = [];
  const re = /("[^"]+"|\b[A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const [full, rawKey, body] = m;
    if (!/canFilter\s*:/.test(body) || !/canSort\s*:/.test(body)) continue; // not a SieveFieldConfig entry
    const key = rawKey.replace(/^"|"$/g, "");
    const lineStart = src.lastIndexOf("\n", m.index) + 1;
    const lineEnd = src.indexOf("\n", m.index);
    const line = src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
    const lineNo = src.slice(0, m.index).split("\n").length;
    entries.push({ key, body, line, lineNo, canFilter: /canFilter\s*:\s*true/.test(body), hasParseValue: /parseValue\s*:/.test(body) });
  }
  return entries;
}

function main() {
  const files = walk(SCAN_DIR, []);
  const violations = [];

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const relPath = file.slice(ROOT.length + 1).replace(/\\/g, "/");
    for (const entry of extractFieldConfigs(src)) {
      if (!entry.canFilter) continue;
      if (entry.hasParseValue) continue;
      if (!looksLikeDateField(entry.key)) continue;
      if (SUPPRESS_RE.test(entry.line)) continue;
      violations.push({ file: relPath, line: entry.lineNo, key: entry.key });
    }
  }

  if (violations.length === 0) {
    console.log(`audit-sieve-date-fields: clean ✓ (${files.length} file(s) checked)`);
    process.exit(0);
  }

  console.error(`audit-sieve-date-fields: ${violations.length} violation(s) found.\n`);
  console.error("A Sieve field config whose key looks like a Firestore Timestamp field is");
  console.error("filterable (canFilter: true) but has no parseValue — any GTE/LTE/GT/LT filter");
  console.error("on it will silently match ZERO documents (Timestamp field vs. string filter");
  console.error("value type mismatch). Add `parseValue: parseSieveDateValue` (import from");
  console.error("\"../../../providers/db-firebase\") to the field config, or suppress with");
  console.error("`// audit-sieve-date-field-ok: <reason>` if the field genuinely isn't a");
  console.error("Timestamp.\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — "${v.key}"`);
  }
  process.exit(1);
}

main();
