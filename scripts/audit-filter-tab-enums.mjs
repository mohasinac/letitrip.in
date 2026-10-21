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
 * Files scanned for chip arrays.
 *
 * This used to be ONLY filter-tabs.ts, which is how `TYPE_OPTIONS` — an inline
 * literal inside AdminEventsView.tsx holding three ids that are not `EventType`
 * values (`contest`, `giveaway`, `flash-sale`, each matching zero rows forever)
 * — stayed invisible to this audit for as long as it existed. A chip array
 * declared next to the component that renders it is exactly as dangerous as one
 * declared in a constants file, so both are in scope.
 */
const SCANNED_FILES = [
  "appkit/src/features/admin/constants/filter-tabs.ts",
  "appkit/src/features/events/components/AdminEventsView.tsx",
  /*
   * 🛑 Added 2026-10-21 for the same reason as AdminEventsView above, and it
   * had already gone wrong: `ORDER_LANE_TABS` listed four lanes against an
   * `OrderType` union of FIVE, so pre-order and prize-draw orders had no tab
   * and were reachable only by landing on "All" and scrolling.
   *
   * The COVERAGE half of this audit exists precisely to catch that — a real
   * union value with no chip — and it could not, because this array was not in
   * scope. An audit that is right and not pointed at the array is worth
   * nothing, which is the lesson from Root Cause #84 restated.
   *
   * Note the spelling trap this registration also guards: `OrderType` spells
   * it `"preorder"` while `ListingType` spells the same concept `"pre-order"`.
   */
  "appkit/src/features/account/components/UserOrdersView.tsx",
];

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

  // ListingType — the 9-value canonical discriminator on `products`. This
  // array used LABELS as ids ("Products", "Auctions", …) until 2026-08-21,
  // which is exactly why the drift was invisible: it lived in the audited
  // file but was never registered here, so nothing compared it to the real
  // union. Two whole types (art, stickers) had been missing from it since
  // they were added.
  ADMIN_PRODUCT_LISTING_TYPE_TABS: {
    sourceFile: "appkit/src/features/products/types/index.ts",
    shape: "union-type",
    exportName: "ListingType",
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
  // The admin variant surfaces the FULL union; the seller one deliberately
  // shows only the four states a seller acts on.
  ADMIN_OFFER_STATUS_TABS: {
    sourceFile: "appkit/src/features/seller/schemas/firestore.ts",
    shape: "union-type",
    exportName: "OfferStatus",
  },
  SELLER_OFFER_STATUS_TABS: {
    sourceFile: "appkit/src/features/seller/schemas/firestore.ts",
    shape: "union-type",
    exportName: "OfferStatus",
  },
  /*
   * The buyer's own order lanes. Backed by `OrderType`, which lives on
   * `order-splitter.ts` rather than a schemas file — that IS the union
   * `OrderDocument.orderType` stores, so it is the right source despite the
   * unusual location.
   *
   * 🛑 This array was four entries against a five-value union for as long as
   * pre-orders and prize-draws have existed. Registering it is what makes the
   * COVERAGE rule able to see it; the rule was always correct and simply had
   * nothing pointed at this file.
   */
  ORDER_LANE_TABS: {
    sourceFile: "appkit/src/features/orders/utils/order-splitter.ts",
    shape: "union-type",
    exportName: "OrderType",
  },
};

/** Sentinel ids that never reach a Sieve filter — always allowed. */
const SENTINEL_IDS = new Set(["All", "", "__all__"]);

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/**
 * Extracts every `const ARRAY_NAME = [ { id: "…" }, … ] as const …` block,
 * returning { name, ids[] } per array. Regex-based, matching the repo's
 * consistent formatting rather than a real TS parser (no compiler here).
 *
 * 🛑 WIDENED 2026-10-21, AND THE OLD PATTERN WAS SILENTLY SKIPPING ARRAYS.
 * It required all three of: the `export` keyword, a name ending `_TABS`, and
 * a literal `satisfies readonly AdminFilterTab[]` tail. `ORDER_LANE_TABS` in
 * `UserOrdersView.tsx` has none of the first and third — it is a module-local
 * `as const` — so registering it in REGISTRY did **nothing**, and two
 * deliberate negative controls (deleting a lane, and misspelling `preorder`
 * as `pre-order`) both reported "clean ✓".
 *
 * That is the failure mode this audit exists to prevent, occurring in the
 * audit itself: a rule that is correct and matches nothing reads exactly like
 * a rule that is satisfied. The same shape as Root Cause #87 and #106.
 *
 * `export` and the `satisfies` tail are now optional; the discriminator is a
 * `const` array of `{ id: "…" }` objects with a registry entry. The name no
 * longer has to end `_TABS` either — `TYPE_OPTIONS` in AdminEventsView was
 * the inline literal that motivated scanning that file at all.
 */
function parseTabArrays(src) {
  const arrays = [];
  /*
   * 🛑 The body is TEMPERED — `(?:(?!^\s*(?:export\s+)?const\s)[\s\S])*?`
   * rather than a plain lazy `[\s\S]*?` — and the first draft of this widening
   * shipped without it and was WRONG IN A WAY THAT STILL REPORTED "clean".
   *
   * A lazy body runs from one `const X = [` to the FIRST `] as const;`
   * anywhere after it. In `UserOrdersView.tsx` the preceding `SORT_OPTIONS`
   * array ends with a plain `];`, so the match began at SORT_OPTIONS, ran
   * straight through it, and terminated on `ORDER_LANE_TABS`'s `] as const;`
   * — capturing the WRONG NAME with the RIGHT IDS. The registry lookup for
   * `ORDER_LANE_TABS` then found nothing and the array went unchecked.
   *
   * Tempering stops the body at the next line-initial `const` declaration, so
   * an array can never absorb its neighbour. Verified by deleting a lane and
   * by misspelling `preorder` as `pre-order`: both now fail, and both passed
   * before.
   */
  const arrayRe =
    /(?:export\s+)?const\s+(\w+)\s*=\s*\[((?:(?!^\s*(?:export\s+)?const\s)[\s\S])*?)\]\s*as const(?:\s+satisfies[^;]*)?;/gm;
  let m;
  while ((m = arrayRe.exec(src))) {
    const [, name, body] = m;
    const ids = [];
    const idRe = /\{\s*id:\s*"([^"]*)"/g;
    let im;
    while ((im = idRe.exec(body))) ids.push(im[1]);
    // An `as const` array with no `{ id: … }` members is not a tab array —
    // skip it rather than registering an empty one, which would make a
    // registered name look checked while contributing nothing.
    if (ids.length > 0) arrays.push({ name, ids });
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
  const arrays = [];
  for (const file of SCANNED_FILES) {
    arrays.push(...parseTabArrays(readSource(file)));
  }

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

    // NO_DEAD_VALUE — a chip whose id no document can hold returns zero rows.
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

    // COVERAGE — the mirror check. This audit only ever asserted the direction
    // above, which is why ADMIN_EVENT_STATUS_TABS could sit at 3 of 5 statuses
    // indefinitely: `paused` and `cancelled` rows existed and were simply
    // unreachable, with no chip that would isolate them. A missing member is
    // just as silent a defect as a dead one.
    const chipSet = new Set(ids);
    const omit = new Set(registryEntry.omit ?? []);
    for (const value of realValues) {
      if (chipSet.has(value) || omit.has(value)) continue;
      violations.push({
        array: name,
        id: value,
        reason: `MISSING — "${value}" is a real ${registryEntry.exportName} value with no chip, so rows in that state cannot be filtered for. Add a chip, or add it to this entry's \`omit\` list with a reason.`,
      });
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
