#!/usr/bin/env node
/**
 * audit-listing-type-tab-coverage.mjs — every hand-written "list all the
 * listing types" map must actually list all of them.
 *
 * WHY THIS EXISTS
 *
 * `ListingType` is a 9-value union, but the codebase accumulated at least ten
 * INDEPENDENT hand-maintained enumerations of it — the plugin registry, the
 * capability map, the feature-flag map, the Sieve alias map, the badge-variant
 * map, the admin type chips, the seller type dropdown, the public /products
 * chips, the per-type sort lookup, and the category/brand tab maps. Nothing
 * cross-checked them, so they silently drifted apart:
 *
 *   - `/products` offered 4 of 9 type chips. Auctions, pre-orders, prize
 *     draws, art and stickers were unreachable from the main catalogue —
 *     the report that started this sweep (2026-08-21).
 *   - `art` and `stickers` (added later than the rest) were missing from the
 *     admin chips, the seller dropdown, `useListingTypeFlags`, the badge map
 *     and the sort lookup.
 *   - `bundle` — which stopped being a listingType in SB-UNI-D — was still
 *     listed in several, where selecting it filtered on a value no product
 *     can hold and returned zero rows forever.
 *
 * WHAT IT CHECKS
 *
 *   1. COVERAGE — each registered map/array contains every `ListingType`
 *      member (minus a declared `omit` list, which must carry a reason).
 *   2. NO_DEAD_TYPE — no entry names a type that isn't in the union. `bundle`
 *      is called out by name because it is the recurring offender.
 *   3. STAYS_DERIVED — files that were converted to derive their arrays from
 *      the registry must not reintroduce hand-written per-type literals.
 *
 * Only HAND-WRITTEN maps are registered. Arrays derived at runtime from
 * `ALL_LISTING_TYPES` (the tab constants in `listing-tabs.ts`) are correct by
 * construction and are guarded by check 3 instead.
 *
 * Method: plain Node + regex over raw source, no TS compiler in the loop —
 * matching this project's existing audit convention (see
 * audit-filter-tab-enums.mjs, whose union extractor this mirrors).
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const UNION_FILE = "appkit/src/features/products/types/index.ts";
const UNION_NAME = "ListingType";

/**
 * A hand-written enumeration of listing types that must stay exhaustive.
 *
 * `kind`:
 *   "record"  — `const X: Record<ListingType, …> = { standard: …, auction: … }`
 *               keys are read from the object literal.
 *   "tabs"    — `const X = [ { id: "…" }, … ]`, ids are read from the array.
 *
 * `idSpace`:
 *   "listingType" — ids ARE canonical ListingType values.
 *   "tabSlug"     — ids are URL slugs; resolved through the plugin registry's
 *                   `tabSlug` field before comparing. Tab bars use these
 *                   because the id doubles as a live URL segment.
 *
 * `omit` — types this map legitimately doesn't cover, each with a reason.
 *
 * @type {{file: string, exportName: string, kind: "record"|"tabs", idSpace: "listingType"|"tabSlug", omit?: Record<string,string>, extraIdsAllowed?: string[]}[]}
 */
const REGISTRY = [
  {
    file: "appkit/src/_internal/shared/listing-types/_registry.ts",
    exportName: "LISTING_TYPE_REGISTRY",
    kind: "record",
    idSpace: "listingType",
  },
  {
    file: "appkit/src/_internal/shared/listing-types/capabilities.ts",
    exportName: "LISTING_TYPE_CAPABILITIES",
    kind: "record",
    idSpace: "listingType",
  },
  {
    file: "appkit/src/_internal/shared/listing-types/feature-flags.ts",
    exportName: "ALL_LISTING_TYPES_MAP",
    kind: "record",
    idSpace: "listingType",
  },
  {
    file: "appkit/src/features/products/repository/products.repository.ts",
    exportName: "LISTING_KIND_ALIAS_MAP",
    kind: "record",
    idSpace: "listingType",
    // The alias map deliberately ALSO accepts legacy spellings so old consumer
    // URLs keep working. They are extra keys, not missing ones.
    extraIdsAllowed: ["product", "preorder", "prizedraw"],
  },
  {
    file: "appkit/src/features/products/utils/listing-badge-variant.ts",
    exportName: "LISTING_BADGE_VARIANT",
    kind: "record",
    idSpace: "listingType",
  },
  {
    file: "appkit/src/features/admin/constants/filter-tabs.ts",
    exportName: "ADMIN_PRODUCT_LISTING_TYPE_TABS",
    kind: "tabs",
    idSpace: "listingType",
    extraIdsAllowed: ["All"], // the ALL_TAB sentinel
  },
];

/**
 * Files whose listing-type maps were converted from hand-written literals into
 * derivations over `ALL_LISTING_TYPES`. A derived map is exhaustive by
 * construction, so it needs the opposite check from the REGISTRY above: prove
 * it is STILL derived, and that nobody has quietly re-added a literal beside
 * the derivation (which would look correct while covering only the types
 * someone remembered).
 *
 * `requiredPattern` — must be present (the derivation itself).
 * `bannedPattern`   — must be absent (a hand-written per-type entry).
 *
 * @type {{file: string, requiredPattern: RegExp, bannedPattern?: RegExp, hint: string}[]}
 */
const STAYS_DERIVED = [
  {
    file: "appkit/src/features/products/constants/listing-tabs.ts",
    requiredPattern: /ALL_LISTING_TYPES/,
    // The derivations use `listingType: type` or a computed join — never a
    // quoted literal.
    bannedPattern: /listingType:\s*"/g,
    hint:
      "Tab arrays here are derived from ALL_LISTING_TYPES + pluginFor(). Add the " +
      "metadata to the type's config.ts instead of hardcoding a tab entry.",
  },
  {
    file: "appkit/src/features/categories/components/CategoryDetailTabs.tsx",
    requiredPattern: /ALL_LISTING_TYPES\.map\(/,
    // A hand-written `products: { kind: "listing", … }` row beside the spread.
    bannedPattern: /\bkind:\s*"listing"\s*,\s*type:\s*"/g,
    hint:
      "TAB_TYPE_MAP is derived from ALL_LISTING_TYPES + pluginFor(t).tabSlug. It " +
      "previously covered 6 of 10 tabs by hand, leaving four tabs that rendered " +
      "a blank panel.",
  },
  {
    file: "appkit/src/features/categories/components/BrandDetailTabs.tsx",
    requiredPattern: /ALL_LISTING_TYPES\.map\(/,
    bannedPattern: /\bkind:\s*"listing"\s*,\s*type:\s*"/g,
    hint:
      "TAB_TYPE_MAP is derived from ALL_LISTING_TYPES + pluginFor(t).tabSlug. The " +
      "hand-written version silently DROPPED four listing types from every brand " +
      "page via its `if (!mapping) return false` filter.",
  },
];

/** A type name that is NOT a listingType but keeps being written as one. */
const KNOWN_DEAD_TYPES = {
  bundle:
    "`bundle` stopped being a listingType in SB-UNI-D — bundles are a " +
    "`categoryType` on the `categories` collection. Filtering products by it " +
    "matches zero documents.",
};

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/** Extract the quoted members of `export type ListingType = "a" | "b";`. */
function extractUnion(src, name) {
  const re = new RegExp(`export type ${name}\\s*=([^;]+);`, "s");
  const m = re.exec(src);
  if (!m) return null;
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** Balanced-brace / bracket slice starting at the first `open` after `from`. */
function sliceBalanced(src, from, open, close) {
  const start = src.indexOf(open, from);
  if (start === -1) return null;
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

/**
 * Index of the initialiser `{`/`[` for a `const NAME ... = <literal>`.
 *
 * Anchoring on the declaration alone is wrong: an inline type annotation can
 * contain its own braces (`Record<string, { kind: string }> = { … }`), and the
 * first `{` after the name then belongs to the ANNOTATION, not the literal —
 * which made this audit read `kind`/`type` as if they were the map's keys.
 */
function initializerIndex(src, exportName) {
  const declRe = new RegExp(`(?:export\\s+)?const\\s+${exportName}\\b`);
  const m = declRe.exec(src);
  if (!m) return -1;
  const eq = /=\s*[{[]/.exec(src.slice(m.index));
  return eq ? m.index + eq.index : -1;
}

/** Keys of an object literal — `standard:`, `"pre-order":`, `"digital-code":`. */
function extractRecordKeys(src, exportName) {
  const at = initializerIndex(src, exportName);
  if (at === -1) return null;
  const body = sliceBalanced(src, at, "{", "}");
  if (body === null) return null;
  // Only top-level keys — skip anything nested inside a child object.
  const keys = [];
  let depth = 0;
  for (const line of body.split("\n")) {
    if (depth === 0) {
      const km = /^\s*(?:"([^"]+)"|([A-Za-z_][\w-]*))\s*:/.exec(line);
      if (km) keys.push(km[1] ?? km[2]);
    }
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
    }
  }
  return keys;
}

/** `id: "…"` values inside an array literal. */
function extractTabIds(src, exportName) {
  const at = initializerIndex(src, exportName);
  if (at === -1) return null;
  const body = sliceBalanced(src, at, "[", "]");
  if (body === null) return null;
  return [...body.matchAll(/\bid:\s*"([^"]*)"/g)].map((x) => x[1]);
}

/** Map `listingType -> tabSlug` by reading each per-type config.ts. */
function buildTabSlugMap(types) {
  /** @type {Record<string,string>} */
  const bySlug = {};
  for (const type of types) {
    const file = `appkit/src/_internal/shared/listing-types/${type}/config.ts`;
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    const m = /tabSlug:\s*"([^"]+)"/.exec(readFileSync(path, "utf8"));
    if (m) bySlug[type] = m[1];
  }
  return bySlug;
}

function main() {
  const unionSrc = read(UNION_FILE);
  const types = extractUnion(unionSrc, UNION_NAME);
  if (!types) {
    console.error(
      `audit-listing-type-tab-coverage: could not read the ${UNION_NAME} union from ` +
        `${UNION_FILE} — this audit's extractor is stale, fix it before proceeding.`,
    );
    process.exit(1);
  }
  const tabSlugByType = buildTabSlugMap(types);

  /** @type {string[]} */
  const violations = [];
  let checked = 0;

  for (const entry of REGISTRY) {
    const path = join(ROOT, entry.file);
    if (!existsSync(path)) {
      violations.push(
        `MISSING_FILE — ${entry.file} (registered for ${entry.exportName}) does not ` +
          `exist. Update this audit's REGISTRY if the map moved or was deleted.`,
      );
      continue;
    }
    const src = stripComments(readFileSync(path, "utf8"));
    const ids =
      entry.kind === "record"
        ? extractRecordKeys(src, entry.exportName)
        : extractTabIds(src, entry.exportName);

    if (!ids) {
      violations.push(
        `UNPARSEABLE — could not locate \`${entry.exportName}\` in ${entry.file}. ` +
          `The audit registry is stale, or the declaration shape changed.`,
      );
      continue;
    }
    checked++;

    const idSet = new Set(ids);
    const allowed = new Set(entry.extraIdsAllowed ?? []);
    const omit = entry.omit ?? {};

    // 1. COVERAGE
    for (const type of types) {
      if (omit[type]) continue;
      const expected = entry.idSpace === "tabSlug" ? (tabSlugByType[type] ?? type) : type;
      if (!idSet.has(expected)) {
        violations.push(
          `COVERAGE — ${entry.file} → ${entry.exportName} is missing "${expected}"` +
            (entry.idSpace === "tabSlug" ? ` (tabSlug for listing type "${type}")` : "") +
            `.\n    Every ListingType must be represented, or declared in this ` +
            `audit's \`omit\` with a written reason.`,
        );
      }
    }

    // 2. NO_DEAD_TYPE
    const validIds = new Set([
      ...types.map((t) => (entry.idSpace === "tabSlug" ? (tabSlugByType[t] ?? t) : t)),
      ...allowed,
    ]);
    for (const id of idSet) {
      if (validIds.has(id)) continue;
      const dead = KNOWN_DEAD_TYPES[id];
      violations.push(
        `NO_DEAD_TYPE — ${entry.file} → ${entry.exportName} lists "${id}", which is ` +
          `not a ${UNION_NAME}${entry.idSpace === "tabSlug" ? " tabSlug" : ""}.\n    ` +
          (dead ??
            `Remove it, or add it to \`extraIdsAllowed\` in this audit if it is a ` +
              `legitimate non-listing-type entry.`),
      );
    }
  }

  // 3. STAYS_DERIVED
  for (const { file, requiredPattern, bannedPattern, hint } of STAYS_DERIVED) {
    const path = join(ROOT, file);
    if (!existsSync(path)) {
      violations.push(
        `MISSING_FILE — ${file} is registered as a derived map but does not exist.`,
      );
      continue;
    }
    const src = stripComments(readFileSync(path, "utf8"));
    checked++;

    if (!requiredPattern.test(src)) {
      violations.push(
        `NOT_DERIVED — ${file} no longer derives its listing types (expected ` +
          `${requiredPattern}).\n    ${hint}`,
      );
    }
    if (bannedPattern) {
      const hits = [...src.matchAll(bannedPattern)];
      if (hits.length > 0) {
        violations.push(
          `STAYS_DERIVED — ${file} has ${hits.length} hand-written per-type ` +
            `literal(s) matching ${bannedPattern}.\n    ${hint}`,
        );
      }
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-listing-type-tab-coverage: clean ✓ (${checked} map(s) cover all ` +
        `${types.length} listing types)`,
    );
    process.exit(0);
  }

  console.error(
    `audit-listing-type-tab-coverage: ${violations.length} violation(s) found.\n`,
  );
  console.error(
    "A listing type missing from one of these maps is invisible on that surface,",
  );
  console.error("with no error anywhere. See this script's header for the writeup.\n");
  for (const v of violations) console.error(`  ${v}\n`);
  process.exit(1);
}

main();
