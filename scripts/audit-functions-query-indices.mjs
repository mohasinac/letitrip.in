#!/usr/bin/env node
/**
 * audit-functions-query-indices.mjs — Firestore composite-index coverage for
 * server-side job/function/action queries.
 *
 * `appkit/scripts/audit-listing-indices.mjs` already covers every
 * `DataListingView` config and repository `.list()` call — the query shapes
 * driven by admin/seller/public listing toolbars. Its own doc comment names
 * the one thing it explicitly does NOT scan: "server jobs / fan-out". This
 * script covers that gap — raw `.collection(...).where(...)` chains inside
 * `appkit/src/_internal/server/**` (job runners, server actions, Cloud
 * Function implementations) and `functions/src/**` (the consumer's thin
 * binding layer).
 *
 * Heuristic, regex-based — like every other audit in this repo, it does not
 * do full type-flow analysis. It extracts each `.collection("X")` call and
 * every immediately-chained `.where(field, op, ...)` / `.orderBy(field, ...)`
 * call that follows it (stopping at `.get()`/`.limit()`/newline-broken chain
 * end), classifies each `.where()` as an equality-class filter (`==`, `in`,
 * `array-contains`, `array-contains-any`) or a range filter (`<`, `<=`, `>`,
 * `>=`, `!=`), then checks whether `firestore.indexes.json` declares a
 * composite index whose leading fields are a set-match for the query's
 * equality fields, immediately followed (if present) by the range/orderBy
 * field — Firestore's actual composite-index prefix-matching rule.
 *
 * Queries with 0 or 1 total filter fields never need a composite index
 * (Firestore auto-indexes every field for single-condition equality/range
 * queries) and are skipped.
 *
 * False negatives are possible (e.g. a field built from a constant imported
 * from a different file, multi-line chains this script's brace-depth scan
 * doesn't fully track) — this is a best-effort net, not a guarantee. When in
 * doubt, verify manually against the Firestore emulator or console.
 *
 * Strict-zero. Suppress a genuine false positive with
 * `// audit-functions-query-indices-ok: <reason>` on the `.collection(...)`
 * line.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEXES_PATH = join(ROOT, "appkit", "firebase", "base", "firestore.indexes.json");

const SCAN_DIRS = [
  join(ROOT, "appkit", "src", "_internal", "server"),
  join(ROOT, "functions", "src"),
  // Consumer app tree — catches any page.tsx/route.ts that bypasses the
  // repository layer with a raw Firestore chain (audit-listing-indices.mjs
  // covers repository-method call sites; this covers what's left).
  join(ROOT, "src", "app"),
];

const RANGE_OPS = new Set(["<", "<=", ">", ">=", "!="]);
const EQ_OPS = new Set(["==", "in", "array-contains", "array-contains-any"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "__tests__" || entry.includes(".test.")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function loadIndexesByCollection() {
  const idx = JSON.parse(readFileSync(INDEXES_PATH, "utf8"));
  const byColl = {};
  for (const e of idx.indexes ?? []) {
    (byColl[e.collectionGroup] ??= []).push(
      e.fields.map((f) => f.fieldPath),
    );
  }
  return byColl;
}

/** Prefix-matching rule: query's equality fields must appear as the index's
 * leading N fields (any order), immediately followed by the range field. */
function satisfies(indexFields, eqFields, rangeField) {
  const need = rangeField ? eqFields.length + 1 : eqFields.length;
  if (indexFields.length < need) return false;
  const prefix = indexFields.slice(0, eqFields.length);
  const eqSet = new Set(eqFields);
  if (prefix.length !== eqSet.size) return false;
  for (const f of prefix) if (!eqSet.has(f)) return false;
  if (rangeField) return indexFields[eqFields.length] === rangeField;
  return true;
}

// Matches `.collection(SOME_CONST_OR_"literal")` — captures the argument
// expression as-is; resolved against a small set of known string literals
// only (constants imported from other files can't be resolved statically
// here — those chains are silently skipped, a known false-negative).
const COLLECTION_RE = /\.collection\(\s*(?:"([^"]+)"|'([^']+)'|(\w+))\s*\)/g;

function extractChain(source, startIdx) {
  // Grab a generous window after the .collection(...) call — chained
  // .where()/.orderBy() calls, stopping at the first .get()/.set()/.add()/
  // .create()/.update()/.delete() terminal call or a blank line gap that
  // signals the chain ended (heuristic).
  const window = source.slice(startIdx, startIdx + 1500);
  const terminalMatch = window.search(/\.(get|set|add|create|update|delete|doc)\(/);
  const chain = terminalMatch >= 0 ? window.slice(0, terminalMatch) : window;
  return chain;
}

function parseFilters(chain) {
  const eqFields = [];
  let rangeField = null;
  const whereRe = /\.where\(\s*(?:"([^"]+)"|'([^']+)'|([\w.]+))\s*,\s*"([^"]+)"/g;
  let m;
  while ((m = whereRe.exec(chain))) {
    const field = m[1] ?? m[2] ?? m[3];
    const op = m[4];
    if (!field || field.includes(".")) continue; // skip unresolved dotted constant refs
    if (RANGE_OPS.has(op)) {
      if (!rangeField) rangeField = field;
      // A second range condition on the SAME field (e.g. deadline<=X, deadline>Y)
      // doesn't add a new index field — Firestore treats it as one range clause.
    } else if (EQ_OPS.has(op)) {
      if (!eqFields.includes(field)) eqFields.push(field);
    }
  }
  const orderByRe = /\.orderBy\(\s*(?:"([^"]+)"|'([^']+)')/;
  const ob = orderByRe.exec(chain);
  if (ob && !rangeField) rangeField = ob[1] ?? ob[2];
  return { eqFields, rangeField };
}

function isSuppressed(source, idx) {
  const before = source.slice(Math.max(0, idx - 200), idx);
  return /audit-functions-query-indices-ok:/.test(before);
}

const byColl = loadIndexesByCollection();
const files = SCAN_DIRS.filter((d) => {
  try {
    return statSync(d).isDirectory();
  } catch {
    return false;
  }
}).flatMap((d) => walk(d));

const failures = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  let m;
  COLLECTION_RE.lastIndex = 0;
  while ((m = COLLECTION_RE.exec(source))) {
    const coll = m[1] ?? m[2];
    if (!coll) continue; // identifier arg (e.g. a variable) — can't resolve statically
    if (isSuppressed(source, m.index)) continue;
    const chain = extractChain(source, m.index + m[0].length);
    const { eqFields, rangeField } = parseFilters(chain);
    const totalFields = eqFields.length + (rangeField ? 1 : 0);
    if (totalFields <= 1) continue; // single-condition queries are auto-indexed
    const candidates = byColl[coll] || [];
    const ok = candidates.some((f) => satisfies(f, eqFields, rangeField));
    if (!ok) {
      const line = source.slice(0, m.index).split("\n").length;
      failures.push(
        `${relative(ROOT, file)}:${line}  collection "${coll}"  ` +
          `eq=[${eqFields.join(",")}]${rangeField ? ` range=${rangeField}` : ""}  ` +
          `— no composite index covers this combination`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("audit-functions-query-indices: FAILED — missing composite indices:\n");
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    `\n${failures.length} violation(s). Add the composite index to ` +
      `appkit/firebase/base/firestore.indexes.json, or suppress a genuine ` +
      `false positive with // audit-functions-query-indices-ok: <reason>.`,
  );
  process.exit(1);
}

console.log(`audit-functions-query-indices: clean ✓ (${files.length} files scanned)`);
