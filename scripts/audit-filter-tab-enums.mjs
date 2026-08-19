#!/usr/bin/env node
/**
 * audit-filter-tab-enums.mjs — semantic-value guard for admin/seller filter
 * chip arrays.
 *
 * Every `ADMIN_*_TABS` / `SELLER_*_TABS` array in
 * `appkit/src/features/admin/constants/filter-tabs.ts` feeds a
 * `FilterChipGroup`, whose selected `id` gets passed directly into
 * `sieveFilter(field, SIEVE_OP.EQ, id)`. If an `id` doesn't exactly match a
 * value the target Firestore field can actually hold (case included —
 * Firestore `==` is byte-exact), that chip silently returns zero rows
 * forever, with no error anywhere.
 *
 * This bug class was found live in 8+ places in a single sweep (2026-08-19):
 * seller Products/Auctions/Prize Draws/Pre-orders/Orders/Offers and admin
 * Products/Events all had at least one tab `id` that could never match a
 * real document. See CLAUDE.md's Recurrent Root Cause Patterns for the full
 * writeup and the two existing audits that structurally could NOT have
 * caught this (audit-listing-quick-filters.mjs only scans public
 * `*IndexListing.tsx` files and checks toggle *presence*, never value
 * correctness; audit-sieve-constants.mjs only flags raw strings that bypass
 * the sieveFilter() builder, and every one of these bugs used that builder
 * correctly — the value passed to it was simply wrong).
 *
 * Method: this script does NOT import/execute any TypeScript — it's a plain
 * Node script, no compiler in the loop. Both sides (the tab array's `id`s
 * and the real enum) are extracted via regex over the raw source text,
 * matching this project's existing audit convention (see
 * audit-sieve-constants.mjs for precedent).
 *
 * The REGISTRY below maps each tab array to its real backing enum's source
 * file, deliberately pointing at each feature's OWN schema/types file —
 * never at `appkit/src/constants/field-names.ts`, which this same sweep
 * confirmed is stale in at least two places (EVENT_FIELDS.STATUS_VALUES
 * claims a "published" value EventStatus never had; SCAMMER_FIELDS.STATUS_
 * VALUES is missing the real "removed" value). A "canonical source of
 * truth" file that's itself unverified is not a safe audit source.
 *
 * Not every array in filter-tabs.ts is registered — only status/type-style
 * arrays that map onto a real stored enum. Arrays like
 * ADMIN_CART_OWNERSHIP_TABS (not a stored field, computed client-side) or
 * ADMIN_REVIEW_RATING_TABS (numeric field, Sieve auto-coerces numeric-
 * looking strings) are intentionally out of scope — see the exclusion notes
 * inline.
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILTER_TABS_FILE = join(ROOT, "appkit/src/features/admin/constants/filter-tabs.ts");

/**
 * @typedef {{
 *   sourceFile: string,
 *   shape: "const-object" | "union-type",
 *   exportName: string,
 * }} EnumSource
 */

/** @type {Record<string, EnumSource>} */
const REGISTRY = {
  // ProductStatus — draft|published|in_review|archived. Shared by every
  // listing-type view (products/auctions/prize-draws/pre-orders all store
  // status on the same `products` collection field).
  SELLER_PRODUCT_STATUS_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ProductStatus",
  },
  SELLER_AUCTION_STATUS_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ProductStatus",
  },
  SELLER_PRIZE_DRAW_STATUS_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ProductStatus",
  },
  SELLER_PRE_ORDER_STATUS_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ProductStatus",
  },
  ADMIN_PRODUCT_STATUS_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ProductStatus",
  },

  // EventStatus — draft|active|paused|ended|cancelled. Deliberately NOT
  // field-names.ts's EVENT_FIELDS.STATUS_VALUES (confirmed stale — claims a
  // "published" value that was never real).
  ADMIN_EVENT_STATUS_TABS: {
    sourceFile: "appkit/src/features/events/types/index.ts",
    shape: "union-type",
    exportName: "EventStatus",
  },

  // OrderStatusValues — const-object shape, values lowercase.
  ADMIN_ORDER_STATUS_TABS: {
    sourceFile: "appkit/src/features/orders/schemas/firestore.ts",
    shape: "const-object",
    exportName: "OrderStatusValues",
  },
  SELLER_ORDER_STATUS_TABS: {
    sourceFile: "appkit/src/features/orders/schemas/firestore.ts",
    shape: "const-object",
    exportName: "OrderStatusValues",
  },

  // OfferStatus — pending|accepted|declined|countered|expired|withdrawn|paid.
  SELLER_OFFER_STATUS_TABS: {
    sourceFile: "appkit/src/features/seller/schemas/firestore.ts",
    shape: "union-type",
    exportName: "OfferStatus",
  },
};

/** Sentinel ids that never reach a Sieve filter — always allowed. */
const SENTINEL_IDS = new Set(["All", "", "__all__"]);

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/**
 * Extracts every `export const ARRAY_NAME = [ ... ] as const satisfies
 * readonly AdminFilterTab[];` block from filter-tabs.ts, returning
 * { name, ids[] } per array. Regex-based, matching the file's consistent
 * formatting rather than a real TS parser (no compiler in this script).
 */
function parseTabArrays(src) {
  const arrays = [];
  const arrayRe = /export const (\w+_TABS) = \[([\s\S]*?)\] as const satisfies readonly AdminFilterTab\[\];/g;
  let m;
  while ((m = arrayRe.exec(src))) {
    const [, name, body] = m;
    const ids = [];
    const idRe = /\{\s*id:\s*"([^"]*)"/g;
    let im;
    while ((im = idRe.exec(body))) ids.push(im[1]);
    arrays.push({ name, ids });
  }
  return arrays;
}

/** Extracts the quoted string values of a `union-type` or `const-object` export. */
function extractEnumValues(src, source) {
  if (source.shape === "union-type") {
    const re = new RegExp(`export type ${source.exportName}\\s*=([^;]+);`, "s");
    const m = re.exec(src);
    if (!m) return null;
    return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  // const-object: export const X = { A: "a", B: "b" } as const ...
  const re = new RegExp(`export const ${source.exportName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`, "");
  const m = re.exec(src);
  if (!m) return null;
  return [...m[1].matchAll(/:\s*"([^"]+)"/g)].map((x) => x[1]);
}

function main() {
  const tabsSrc = readSource("appkit/src/features/admin/constants/filter-tabs.ts");
  const arrays = parseTabArrays(tabsSrc);

  /** @type {{ array: string, id: string, reason: string }[]} */
  const violations = [];
  const enumCache = new Map();

  for (const { name, ids } of arrays) {
    const registryEntry = REGISTRY[name];
    if (!registryEntry) continue; // not a registered status/type array — out of scope

    let realValues = enumCache.get(name + "::src");
    if (!realValues) {
      const source = readSource(registryEntry.sourceFile);
      realValues = extractEnumValues(source, registryEntry);
      if (!realValues) {
        violations.push({
          array: name,
          id: "(n/a)",
          reason: `could not locate export "${registryEntry.exportName}" in ${registryEntry.sourceFile} — audit registry entry is stale, fix REGISTRY in this script`,
        });
        continue;
      }
      enumCache.set(name + "::src", realValues);
    }
    const realSet = new Set(realValues);

    for (const id of ids) {
      if (SENTINEL_IDS.has(id)) continue;
      if (!realSet.has(id)) {
        violations.push({
          array: name,
          id,
          reason: `not a member of ${registryEntry.exportName} (${realValues.join("|")})`,
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log(`audit-filter-tab-enums: clean ✓ (${arrays.filter((a) => REGISTRY[a.name]).length} array(s) checked)`);
    process.exit(0);
  }

  console.error(`audit-filter-tab-enums: ${violations.length} violation(s) found.\n`);
  console.error("A filter chip's id doesn't match any value its target field can hold —");
  console.error("clicking it will always return zero rows. Fix the id in filter-tabs.ts.\n");
  for (const v of violations) {
    console.error(`  [${v.array}] id: "${v.id}" — ${v.reason}`);
  }
  process.exit(1);
}

main();
