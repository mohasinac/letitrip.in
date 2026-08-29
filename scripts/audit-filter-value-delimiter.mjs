#!/usr/bin/env node
/**
 * audit-filter-value-delimiter.mjs — one delimiter for multi-value filters.
 *
 * WHY THIS EXISTS
 *
 * Two filter systems wrote the same URL keys with different separators.
 * `ProductFilters` and the eleven components like it joined on `"|"`; the
 * `usePendingFilters` hook and `FilterPanel` split and joined on `","`.
 *
 * Nothing looked broken, which is what let it live: a pipe-joined string
 * survives a comma split as ONE element and round-trips byte-identically. So
 * every value reached Firestore correctly and only the COUNT was wrong — the
 * active-filter badge read "1" for a three-category selection. The same
 * coincidence propped up `usePendingTable.get`, which returned `pending[k][0]`
 * and got the whole `"a|b|c"` string back.
 *
 * That is the dangerous shape: the bug and the thing hiding it were the same
 * line, so fixing either one alone would have broken the other.
 *
 * `"|"` is not arbitrary. sievejs reads same-field `|` as an OR-group, which
 * the Firestore adapter upgrades to an `in` query; a comma is a clause
 * SEPARATOR, so `condition==new,condition==used` is an AND of two equalities
 * on one field and matches nothing (the `sieveMultiEq` defect, Root Cause #59).
 *
 * ## The rule
 *
 * FVD_COMMA_DELIMITER — a `.split(",")` or `.join(",")` on a filter value in
 * any filter component or filter hook. Route it through `splitFilterValues` /
 * `joinFilterValues` instead.
 *
 * Strict zero. Suppression `// audit-filter-delimiter-ok: <reason>` on the
 * line or the one above, for a genuine comma-separated payload that is not a
 * multi-value filter key (a CSV export column, a `style` attribute).
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "node:fs";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = resolve(import.meta.dirname, "..");

/**
 * Where a multi-value filter param is parsed or serialised. Deliberately the
 * filter components and the filter/table hooks — not the whole tree, where a
 * comma join is usually just a display string.
 */
const PATTERNS = [
  "appkit/src/features/filters/**/*.{ts,tsx}",
  "appkit/src/features/*/components/*Filters.tsx",
  "appkit/src/react/hooks/usePending*.ts",
  "appkit/src/react/hooks/useUrlTable.ts",
  "src/components/**/*Filters.tsx",
];

const SUPPRESS = /audit-filter-delimiter-ok:/;
const OFFENDER = /\.(?:split|join)\(\s*","\s*\)/;

const files = PATTERNS.flatMap((p) => globSync(p, { cwd: ROOT })).sort();
const violations = [];

for (const rel of files) {
  const raw = readFileSync(resolve(ROOT, rel), "utf8");
  const stripped = stripComments(raw).split("\n");
  const rawLines = raw.split("\n");

  stripped.forEach((line, i) => {
    if (!OFFENDER.test(line)) return;
    if (SUPPRESS.test(rawLines[i] ?? "") || SUPPRESS.test(rawLines[i - 1] ?? "")) return;
    violations.push({ file: rel, line: i + 1, text: line.trim() });
  });
}

if (violations.length === 0) {
  console.log(
    `audit-filter-value-delimiter: clean ✓ (${files.length} filter files on one delimiter)`,
  );
  process.exit(0);
}

console.error(`audit-filter-value-delimiter: ${violations.length} violation(s)\n`);
for (const v of violations) {
  console.error(`  [FVD_COMMA_DELIMITER] ${relative(ROOT, resolve(ROOT, v.file))}:${v.line}`);
  console.error(`      ${v.text}`);
  console.error(
    `      Multi-value filters use "|" (FILTER_VALUE_DELIMITER). A comma is a` +
      ` Sieve clause separator, so it ANDs two equalities on one field and` +
      ` matches nothing — and it makes the badge count a joined string as 1.\n`,
  );
}
process.exit(1);
