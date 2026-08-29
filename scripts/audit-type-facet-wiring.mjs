#!/usr/bin/env node
/**
 * audit-type-facet-wiring.mjs — the per-listing-type facets, checked at every
 * end of the chain instead of one.
 *
 * WHY THIS EXISTS
 *
 * `audit-sieve-field-schema-parity` already checks SIEVE_FIELDS against the
 * document and against emitters — and it was clean while every per-type facet
 * on /classified, /live and /digital-codes was broken. Two blind spots, both
 * structural rather than unlucky:
 *
 *   1. **The emitter is a variable.** The facet clause is built as
 *      `sieveFilter(TYPE_FACET_FIELD[key], op, value)`. A regex looking for a
 *      literal field name in a `sieveFilter(...)` call cannot resolve that, so
 *      the whole family was invisible to the emitter half of that audit.
 *
 *   2. **A parent object is a real field.** `classified.meetupArea` was in
 *      SIEVE_FIELDS and IS on the document — as an object. So it was not an
 *      orphan by that audit's definition, while being unable to match anything
 *      a user could type. The facet emitted `classified.meetupArea.city`,
 *      which had no entry, so `findField` returned undefined and
 *      `throwExceptions:false` dropped the clause.
 *
 * And one end no field-vs-document audit can see at all:
 *
 *   3. **The composite index.** A facet that IS allowlisted and DOES reach
 *      Firestore still fails with FAILED_PRECONDITION if
 *      `(status, listingType, <field>, createdAt DESC)` is not declared.
 *      `runQuery` logs that and returns null, which every caller renders as an
 *      empty grid. All 8 facets were in this state: the store-scoped indexes
 *      existed, the public ones never did.
 *
 * Three different silences, one user-visible symptom — "this filter matches
 * nothing" — which is why this checks all of them together.
 *
 * ## The rules
 *
 * TFW_UNALLOWLISTED   a TYPE_FACET_FIELD path with no SIEVE_FIELDS entry.
 * TFW_MISSING_INDEX   a facet path with no public or no store-scoped index at
 *                     FACET_FETCH_SORT.
 * TFW_UNREAD_KEY      a key in a component's FILTER_KEYS that no reader
 *                     consumes — it inflates the active-filter badge and
 *                     filters nothing. `liveTransportMethod` was one.
 *
 * Strict zero. No suppression marker: a facet either reaches Firestore or it
 * does not, and there is no legitimate third state.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const LIST_PUBLIC = "appkit/src/_internal/server/features/products/list-public.ts";
const PRODUCTS_REPO = "appkit/src/features/products/repository/products.repository.ts";
const TABLE_KEYS_FILE = "appkit/src/constants/table-keys.ts";
const INDEXES = "appkit/firebase/base/firestore.indexes.json";

/** Components whose FILTER_KEYS drive an active-filter badge. */
const FILTER_KEY_SOURCES = [
  "appkit/src/features/stores/components/StoreLiveItemsListing.tsx",
  "appkit/src/features/stores/components/StoreClassifiedsListing.tsx",
  "appkit/src/features/stores/components/StoreDigitalCodesListing.tsx",
];

const read = (rel) => {
  const abs = resolve(ROOT, rel);
  return existsSync(abs) ? stripComments(readFileSync(abs, "utf8")) : null;
};

const violations = [];
const add = (rule, file, message) => violations.push({ rule, file, message });

// ---------------------------------------------------------------------------
// Parse the three sources of truth
// ---------------------------------------------------------------------------

/** `TABLE_KEYS.FOO` → its string value, so a facet key can be resolved. */
function readTableKeys(src) {
  const out = new Map();
  for (const m of src.matchAll(/^\s*([A-Z0-9_]+):\s*"([^"]+)"/gm)) out.set(m[1], m[2]);
  return out;
}

/** `[TABLE_KEYS.CITY]: "classified.meetupArea.city"` → key → field path. */
function readTypeFacetMap(src, tableKeys) {
  const block = src.match(/const TYPE_FACET_FIELD:[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return null;
  const out = new Map();
  for (const m of block[1].matchAll(/\[TABLE_KEYS\.([A-Z0-9_]+)\]:\s*"([^"]+)"/g)) {
    const key = tableKeys.get(m[1]);
    if (key) out.set(key, m[2]);
  }
  return out;
}

/** The products SIEVE_FIELDS keys, quoted or bare. */
function readSieveFields(src) {
  const block = src.match(/SIEVE_FIELDS[^=]*=\s*\{([\s\S]*?)\n\s{2}\};/);
  if (!block) return null;
  const out = new Set();
  for (const m of block[1].matchAll(/^\s*(?:"([^"]+)"|([A-Za-z0-9_$]+)):\s*\{/gm)) {
    out.add(m[1] ?? m[2]);
  }
  return out;
}

/** `export const FACET_FETCH_SORT = sortBy(PRODUCT_FIELDS.CREATED_AT);` */
function readFacetFetchSort(src) {
  const m = src.match(/FACET_FETCH_SORT\s*=\s*sortBy\(\s*PRODUCT_FIELDS\.([A-Z0-9_]+)\s*(?:,\s*"(ASC|DESC)")?\s*\)/);
  if (!m) return null;
  // `sortBy(field)` defaults to descending in this codebase.
  const field = m[1] === "CREATED_AT" ? "createdAt" : null;
  return field ? { field, order: m[2] === "ASC" ? "ASCENDING" : "DESCENDING" } : null;
}

const listPublic = read(LIST_PUBLIC);
const repo = read(PRODUCTS_REPO);
const tableKeysSrc = read(TABLE_KEYS_FILE);

if (!listPublic || !repo || !tableKeysSrc) {
  console.error("audit-type-facet-wiring: a source file moved — update the paths.");
  process.exit(1);
}

const tableKeys = readTableKeys(tableKeysSrc);
const facets = readTypeFacetMap(listPublic, tableKeys);
const sieveFields = readSieveFields(repo);
const fetchSort = readFacetFetchSort(listPublic);

if (!facets || !sieveFields || !fetchSort) {
  console.error(
    "audit-type-facet-wiring: could not parse TYPE_FACET_FIELD / SIEVE_FIELDS / FACET_FETCH_SORT.\n" +
      "  The audit is inert rather than passing — fix the parse before trusting a clean run.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Rule 1 — every facet path is allowlisted
// ---------------------------------------------------------------------------

for (const [key, path] of facets) {
  if (!sieveFields.has(path)) {
    add(
      "TFW_UNALLOWLISTED",
      PRODUCTS_REPO,
      `facet "${key}" filters on \`${path}\`, which has no SIEVE_FIELDS entry — ` +
        `sievejs drops the clause silently (throwExceptions:false).`,
    );
  }
}

// ---------------------------------------------------------------------------
// Rule 2 — every facet path has both index shapes at FACET_FETCH_SORT
// ---------------------------------------------------------------------------

const indexJson = JSON.parse(readFileSync(resolve(ROOT, INDEXES), "utf8"));
const shapeOf = (fields) =>
  fields.map((f) => `${f.fieldPath}:${f.order ?? f.arrayConfig}`).join("|");
const declared = new Set(
  indexJson.indexes.filter((i) => i.collectionGroup === "products").map((i) => shapeOf(i.fields)),
);

/**
 * An array field is indexed CONTAINS, a scalar ASCENDING. Derived from the
 * operator `list-public` actually uses, not from a second hand-written list.
 */
const containsFields = new Set(
  [...facets.values()].filter((p) => p.endsWith("jurisdictionAllowed")),
);
const cfgFor = (p) => (containsFields.has(p) ? "CONTAINS" : "ASCENDING");
const sortLeg = `${fetchSort.field}:${fetchSort.order}`;

for (const [key, path] of facets) {
  const publicShape = `status:ASCENDING|listingType:ASCENDING|${path}:${cfgFor(path)}|${sortLeg}`;
  const storeShape = `storeId:ASCENDING|${publicShape}`;
  for (const [scope, shape] of [
    ["public browse", publicShape],
    ["store-scoped", storeShape],
  ]) {
    if (!declared.has(shape)) {
      add(
        "TFW_MISSING_INDEX",
        INDEXES,
        `facet "${key}" has no ${scope} index — expected \`${shape}\`. ` +
          `Without it the query throws FAILED_PRECONDITION, which runQuery logs ` +
          `and returns as null, i.e. an empty grid.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 3 — no FILTER_KEYS entry that nothing reads
// ---------------------------------------------------------------------------

/*
 * The keys a public product query understands are exactly the ones its params
 * reader pulls off the query string. Derived from source, never re-listed here
 * — a hand-copied allowlist is how the thing being audited drifts from the
 * audit (Root Cause #84).
 */
const readKeys = new Set();
for (const m of listPublic.matchAll(/\bget\(\s*TABLE_KEYS\.([A-Z0-9_]+)\s*\)/g)) {
  const v = tableKeys.get(m[1]);
  if (v) readKeys.add(v);
}
for (const m of listPublic.matchAll(/\bget\(\s*"([^"]+)"\s*\)/g)) readKeys.add(m[1]);
for (const k of facets.keys()) readKeys.add(k);

/** Keys that are real UI state but deliberately not query params. */
const NON_QUERY_KEYS = new Set(["view", "tab"]);

for (const rel of FILTER_KEY_SOURCES) {
  const src = read(rel);
  if (!src) continue;
  const block = src.match(/(?:const\s+FILTER_KEYS|filterKeys)\s*[:=]\s*\[([\s\S]*?)\]/);
  if (!block) continue;
  const keys = [];
  for (const m of block[1].matchAll(/TABLE_KEYS\.([A-Z0-9_]+)|"([^"]+)"/g)) {
    const v = m[1] ? tableKeys.get(m[1]) : m[2];
    if (v) keys.push(v);
  }
  for (const k of keys) {
    if (readKeys.has(k) || NON_QUERY_KEYS.has(k)) continue;
    add(
      "TFW_UNREAD_KEY",
      rel,
      `FILTER_KEYS lists "${k}", which no reader consumes — it counts toward the ` +
        `active-filter badge and filters nothing. Either map it in ` +
        `TYPE_FACET_FIELD or remove it from FILTER_KEYS.`,
    );
  }
}

// ---------------------------------------------------------------------------

if (violations.length === 0) {
  console.log(
    `audit-type-facet-wiring: clean ✓ (${facets.size} facets — allowlisted, indexed, and read)`,
  );
  process.exit(0);
}

console.error(`audit-type-facet-wiring: ${violations.length} violation(s)\n`);
for (const v of violations) {
  console.error(`  [${v.rule}] ${relative(ROOT, resolve(ROOT, v.file))}`);
  console.error(`      ${v.message}\n`);
}
process.exit(1);
