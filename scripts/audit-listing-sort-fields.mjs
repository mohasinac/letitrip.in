#!/usr/bin/env node
/**
 * audit-listing-sort-fields.mjs — a sort option that silently does nothing.
 *
 * WHY THIS EXISTS
 *
 * A sort value like `-featured` only works if `featured` is in the target
 * repository's `SIEVE_FIELDS` with `canSort: true`. If it isn't, sievejs's
 * `findField(..., { canSort: true })` returns undefined and the sort is
 * DROPPED — no error, because `sieve.ts` sets `throwExceptions: false`. The
 * dropdown option appears, the user picks it, the list doesn't reorder.
 *
 * `STANDARD_SORT_OPTIONS` shipped "Featured First" (`-featured`) and
 * "Promoted First" (`-isPromoted`) against two `canSort: false` fields. Both
 * were dead on arrival, and nothing anywhere reported it (2026-08-21).
 *
 * Related failure mode this also catches: a `ListingViewConfig` whose
 * `defaultSort` isn't one of its own `sortOptions`, so the dropdown opens with
 * nothing selected; and one with no `sortOptions` at all, so the toolbar
 * renders no sort control (`AdminCarouselView` shipped like this).
 *
 * METHOD
 *
 * Plain Node + regex over raw source, no TS compiler — this project's audit
 * convention. Sort VALUES are resolved from three shapes:
 *   `sortBy("field", "DESC")`, a bare `"-field"` / `"field"` string, and
 *   `PRODUCT_FIELDS.FOO` constants.
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Sort-option sources, each paired with the repository whose SIEVE_FIELDS
 * governs whether a field is actually sortable.
 *
 * @type {{name: string, files: string[], sieveFile: string, sieveExport: string}[]}
 */
const SORT_SOURCES = [
  {
    name: "products",
    files: [
      "appkit/src/features/products/constants/sieve.ts",
      "appkit/src/features/admin/components/AdminProductsView.tsx",
      "appkit/src/features/seller/components/SellerProductsView.tsx",
    ],
    sieveFile: "appkit/src/features/products/repository/products.repository.ts",
    sieveExport: "SIEVE_FIELDS",
  },
];

/**
 * Every `ListingViewConfig` must declare a non-empty `sortOptions` and a
 * `defaultSort` that appears in it. Scanned across all DataListingView
 * consumers; see MISSING_SORT_OPTIONS / DEFAULT_SORT_NOT_OFFERED below.
 *
 * BLOCKING. All 79 configs pass as of 2026-08-21 — the two real offenders
 * (AdminAddressesView / AdminPaymentMethodsView, both defaulting to
 * `-bannedAt` while only offering `bannedAt`, so the dropdown opened with
 * nothing selected) were fixed rather than baselined. Set `MIGRATE=report` for
 * a non-blocking run while doing a large refactor.
 */
const STRICT_CONFIG_CHECKS = process.env.MIGRATE !== "report";

const CONFIG_SCAN_DIRS = [
  "appkit/src/features",
  "src/app",
];

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

/**
 * Balanced slice of `name`'s initialiser, covering BOTH a standalone
 * declaration (`const sortOptions = [ … ]`) and an object property
 * (`sortOptions: [ … ]`) — a `ListingViewConfig` uses the latter.
 *
 * Anchoring only on `= [` and then scanning forward finds the next `= [`
 * ANYWHERE later in the file when the property form is used, silently
 * returning an unrelated array.
 */
function sliceInitializer(src, name, open = "{", close = "}") {
  const declRe = new RegExp(
    `(?:static\\s+readonly\\s+|export\\s+)?(?:const\\s+)?\\b${name}\\b\\s*(?:=|:)\\s*(?:\\{|\\[)`,
  );
  const m = declRe.exec(src);
  if (!m) return null;
  // The opener is the last char of the matched declaration.
  const start = m.index + m[0].length - 1;
  if (src[start] !== open) return null;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

function topLevelKeys(body) {
  const keys = [];
  let depth = 0;
  for (const line of body.split("\n")) {
    if (depth === 0) {
      const m = /^\s*(?:"([^"]+)"|([A-Za-z_][\w-]*))\s*:/.exec(line);
      if (m) keys.push(m[1] ?? m[2]);
    }
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
    }
  }
  return keys;
}

/** Fields marked `canSort: true` in a repository's SIEVE_FIELDS. */
function sortableFields(rel, exportName) {
  const body = sliceInitializer(stripComments(read(rel)), exportName);
  if (body === null) return null;
  /** @type {Set<string>} */
  const sortable = new Set();
  let depth = 0;
  for (const line of body.split("\n")) {
    if (depth === 0) {
      const m = /^\s*(?:"([^"]+)"|([A-Za-z_][\w-]*))\s*:\s*\{(.*)$/.exec(line);
      if (m && /canSort:\s*true/.test(m[3])) sortable.add(m[1] ?? m[2]);
    }
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
    }
  }
  return sortable;
}

function buildConstantMap(constantName) {
  const src = stripComments(read("appkit/src/constants/field-names.ts"));
  const body = sliceInitializer(src, constantName);
  if (!body) return {};
  /** @type {Record<string,string>} */
  const map = {};
  for (const m of body.matchAll(/^\s*([A-Z0-9_]+):\s*"([^"]+)"/gm)) map[m[1]] = m[2];
  return map;
}

/**
 * Bodies of every array in `src` whose name reads as a sort-option list.
 *
 * Scoping matters: a bare `value: "…"` scan over a whole file also picks up
 * `<Select>` option arrays and filter-tab arrays, which are not sorts at all.
 * That produced a false NOT_SORTABLE on the seller TypeDropdown's
 * `{ value: "all" }` entry.
 */
function sortOptionArrayBodies(src) {
  /** @type {{body: string, at: number}[]} */
  const out = [];
  const nameRe = /\b([A-Za-z_]\w*(?:SORT_OPTIONS|SortOptions|sortOptions))\b\s*(?:=|:)\s*\[/g;
  for (const m of src.matchAll(nameRe)) {
    const start = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = start; i < src.length; i++) {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") {
        depth--;
        if (depth === 0) {
          out.push({ body: src.slice(start + 1, i), at: start + 1 });
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Sort field names referenced as an option `value:` inside a sort-option
 * array, with the leading `-` (descending marker) stripped.
 *
 * @returns {{field: string, raw: string, line: number}[]}
 */
function sortFieldsIn(src, constMap) {
  /** @type {{field:string,raw:string,line:number}[]} */
  const out = [];
  const lineOf = (idx) => src.slice(0, idx).split("\n").length;

  for (const { body, at } of sortOptionArrayBodies(src)) {
    // value: sortBy(PRODUCT_FIELDS.X, "DESC")  |  value: sortBy("x")
    for (const m of body.matchAll(
      /value:\s*sortBy\(\s*(?:([A-Z_]+)\.([A-Z0-9_]+)|"([^"]+)")\s*(?:,[^)]*)?\)/g,
    )) {
      const field = m[3] ?? constMap[m[2]];
      if (field) out.push({ field, raw: m[0], line: lineOf(at + m.index) });
    }
    // value: "-createdAt"  |  value: "title"
    for (const m of body.matchAll(/value:\s*"(-?[\w.]+)"/g)) {
      out.push({
        field: m[1].replace(/^-/, ""),
        raw: m[0],
        line: lineOf(at + m.index),
      });
    }
  }
  return out;
}

/**
 * Resolve a sort expression to the Sieve token it actually produces.
 *
 * `sortBy(field, dir)` (appkit/src/constants/sort.ts) prefixes "-" for DESC —
 * which is the DEFAULT — and nothing for ASC. So `sortBy("order","ASC")` and
 * the literal `"order"` are the same token, and `sortBy("bannedAt","DESC")` is
 * `"-bannedAt"`, NOT `"bannedAt"`.
 *
 * Returns null for anything not statically resolvable (a shared constant
 * reference), so the caller can skip rather than guess.
 */
function resolveSortToken(expr) {
  const literal = /^"([^"]*)"$/.exec(expr);
  if (literal) return literal[1];
  const call = /^sortBy\(\s*"([^"]+)"\s*(?:,\s*"(ASC|DESC)"\s*)?\)$/.exec(expr);
  if (call) return `${call[2] === "ASC" ? "" : "-"}${call[1]}`;
  return null;
}

/** Recursively collect files under `dir` matching `pred`. */
function walk(dir, pred, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "__tests__") continue;
      walk(full, pred, acc);
    } else if (e.isFile() && pred(full)) acc.push(full);
  }
  return acc;
}

function main() {
  /** @type {string[]} */
  const violations = [];
  /** @type {string[]} */
  const reportOnly = [];
  let optionCount = 0;

  // ── 1. Every sort option must target a canSort:true field ───────────────
  const constMap = buildConstantMap("PRODUCT_FIELDS");
  for (const source of SORT_SOURCES) {
    const sortable = sortableFields(source.sieveFile, source.sieveExport);
    if (!sortable) {
      violations.push(
        `UNPARSEABLE — could not read \`${source.sieveExport}\` from ${source.sieveFile}.`,
      );
      continue;
    }
    for (const rel of source.files) {
      if (!existsSync(join(ROOT, rel))) {
        violations.push(`MISSING_FILE — ${rel} is registered here but does not exist.`);
        continue;
      }
      const src = stripComments(read(rel));
      for (const { field, line } of sortFieldsIn(src, constMap)) {
        optionCount++;
        if (sortable.has(field)) continue;
        violations.push(
          `NOT_SORTABLE — ${rel}:${line} offers a sort on "${field}", but ` +
            `${source.sieveExport} does not mark it \`canSort: true\`.\n    ` +
            `sievejs drops the sort silently — the option renders and does nothing. ` +
            `Either set canSort (and add the composite index) or remove the option.`,
        );
      }
    }
  }

  // ── 2. Every ListingViewConfig needs sortOptions + a matching default ───
  const configFiles = CONFIG_SCAN_DIRS.flatMap((d) =>
    walk(join(ROOT, d), (f) => f.endsWith(".tsx") || f.endsWith(".ts")),
  ).filter((f) => {
    // DataListingView.tsx DEFINES ListingViewConfig; it isn't a config itself.
    if (f.replace(/\\/g, "/").endsWith("/DataListingView.tsx")) return false;
    const src = readFileSync(f, "utf8");
    return src.includes("ListingViewConfig<");
  });

  for (const abs of configFiles) {
    const rel = relative(ROOT, abs).replace(/\\/g, "/");
    const src = stripComments(readFileSync(abs, "utf8"));
    if (!/\bsortOptions\s*:/.test(src)) {
      reportOnly.push(
        `MISSING_SORT_OPTIONS — ${rel} declares a ListingViewConfig with no ` +
          `\`sortOptions\`, so ListingToolbar renders no sort control at all.`,
      );
      continue;
    }
    // A defaultSort that isn't among the offered values leaves the dropdown
    // showing no selection.
    const dm = /defaultSort:\s*(sortBy\([^)]*\)|"[^"]*"|[A-Z_][\w.]*)/.exec(src);
    if (!dm) {
      reportOnly.push(`MISSING_DEFAULT_SORT — ${rel} declares no \`defaultSort\`.`);
      continue;
    }
    const optionsBody = sliceInitializer(src, "sortOptions", "[", "]");
    if (optionsBody === null) continue; // options come from a shared constant

    // Compare RESOLVED sort tokens, not source text: `sortBy("order","ASC")`
    // and the literal `"order"` are the same value, and comparing raw text
    // reported four false mismatches on exactly that pair.
    const defaultToken = resolveSortToken(dm[1]);
    if (defaultToken === null) continue;
    const offered = new Set(
      [...optionsBody.matchAll(/value:\s*(sortBy\([^)]*\)|"[^"]*")/g)]
        .map((m) => resolveSortToken(m[1]))
        .filter((t) => t !== null),
    );
    if (!offered.has(defaultToken)) {
      reportOnly.push(
        `DEFAULT_SORT_NOT_OFFERED — ${rel} defaults to "${defaultToken}", which is not ` +
          `among its own sortOptions (${[...offered].map((o) => `"${o}"`).join(", ")}). ` +
          `The sort dropdown opens with nothing selected.`,
      );
    }
  }

  const hardFailures = STRICT_CONFIG_CHECKS ? [...violations, ...reportOnly] : violations;

  if (reportOnly.length > 0 && !STRICT_CONFIG_CHECKS) {
    console.log(
      `audit-listing-sort-fields: ${reportOnly.length} config issue(s) — REPORT ONLY ` +
        `(run with MIGRATE=strict to block). These are pre-existing dashboard views ` +
        `awaiting the inline-sort sweep:`,
    );
    for (const r of reportOnly.slice(0, 10)) console.log(`  ${r}`);
    if (reportOnly.length > 10) console.log(`  … and ${reportOnly.length - 10} more`);
    console.log("");
  }

  if (hardFailures.length === 0) {
    console.log(
      `audit-listing-sort-fields: clean ✓ (${optionCount} sort option(s), ` +
        `${configFiles.length} listing config(s) checked)`,
    );
    process.exit(0);
  }

  console.error(`audit-listing-sort-fields: ${hardFailures.length} violation(s) found.\n`);
  for (const v of hardFailures) console.error(`  ${v}\n`);
  process.exit(1);
}

main();
