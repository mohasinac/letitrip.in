#!/usr/bin/env node
/**
 * audit-listing-filter-parity.mjs — SSR/client default-filter divergence on
 * public listing pages (Root Cause #30).
 *
 * Every public listing hook built on React Query (useProducts, useEvents, ...)
 * sets `staleTime: Infinity` whenever SSR-fetched `initialData` is supplied —
 * see appkit/src/features/products/hooks/useProducts.ts. React Query then
 * treats that page as permanently fresh for its exact query key and never
 * refetches. Two ways this goes wrong, both caught here:
 *
 *   (a) A public listing API route (e.g. /api/products) applies a safety
 *       default (status==published, status==active, ...) ONLY when the
 *       caller explicitly asks for one, instead of defaulting it when absent.
 *       Since the client hook never sends that param, every client-driven
 *       refetch (search/sort/page/other-filter change, or a background
 *       refetch) silently drops the guard. Found 2026-08-19: /api/products
 *       had no default at all, unlike /api/events/reviews/stores.
 *
 *   (b) A client `*IndexListing.tsx` component computes a "Show X" toggle
 *       default (e.g. `inStock: showSold ? undefined : true`,
 *       `dateFrom: showEnded ? ... : new Date().toISOString()`) that its
 *       paired SSR `*ListView.tsx`/`*PageView.tsx` filter-builder doesn't
 *       mirror. The SSR-fetched initialData is then wrong (or right only by
 *       luck) and frozen forever on first paint. Found + fixed 2026-08-19 in
 *       auctions (dateFrom/showEnded), products + art-stickers + pre-orders
 *       (stockQuantity/showSold, stockQuantity/showClosed).
 *
 * This audit doesn't verify semantic equivalence (no AST parsing exists in
 * this audit system) — it asserts the known-required literal tokens are
 * still present in each registered file, so a future refactor can't silently
 * drop either half of a pair without failing CI.
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── (a) Public listing API routes that must default their status/visibility
//     guard when the caller sends none. `pattern` is the literal token that
//     proves the default (or, for reviews/stores, the always-forced filter)
//     is still wired in.
const API_ROUTE_STATUS_DEFAULTS = [
  {
    // The published-by-default guard moved into the shared query module on
    // 2026-08-21 so SSR and this route enforce it from one place; the route's
    // obligation is now to delegate rather than to re-implement it.
    file: "src/app/api/products/route.ts",
    pattern: "listPublicProducts",
    note: "delegates to the shared query, which defaults status to published",
  },
  {
    file: "appkit/src/_internal/server/features/products/list-public.ts",
    pattern: "STATUS_VALUES.PUBLISHED",
    note: "defaults status to published when the caller sends none",
  },
  {
    file: "src/app/api/events/route.ts",
    pattern: "hasStatusFilter",
    note: "defaults status to active when the caller sends none",
  },
  {
    file: "src/app/api/reviews/route.ts",
    pattern: "status==approved",
    note: "always forces status==approved server-side",
  },
  {
    file: "src/app/api/stores/route.ts",
    pattern: "status==active",
    note: "always forces status==active,isPublic==true server-side",
  },
];

// ─── (b) SSR listing views must route every query through the ONE shared
//     implementation, `listPublicProducts` (appkit/src/_internal/server/
//     features/products/list-public.ts).
//
//     Until 2026-08-21 each of these files hand-rolled its own filter builder,
//     and they drifted from `/api/products` — which had already learned (via
//     6fe4e0dd8 / efb7d1b6a) that an `inStock` / mismatched date-range
//     inequality must never be pushed into the Firestore query. The SSR copies
//     still pushed `stockQuantity>0` alongside an unrelated `orderBy`, which
//     Firestore rejects with FAILED_PRECONDITION; a `.catch(() => null)` then
//     turned that into a bare empty page. Net effect on /art, /pre-orders and
//     (before its own fix) /auctions: nothing rendered until the user clicked
//     the "Show sold" / "Show closed" / "Show ended" toggle, which happened to
//     drop the offending clause.
//
//     Token-presence checks can't catch that class — they only prove a literal
//     still exists. These structural checks prove the divergence is impossible.
//     Extended 2026-08-21 with the eight store/prize-draw SSR views. Every one
//     of them had the exact `productRepository.list()` + `.catch(() => null)`
//     shape described above and was simply never registered here, so the audit
//     that exists to prevent this bug class had no visibility into the largest
//     group of files exhibiting it.
const SSR_LISTING_VIEWS = [
  "appkit/src/features/auctions/components/AuctionsListView.tsx",
  "appkit/src/features/products/components/ProductsIndexPageView.tsx",
  "appkit/src/features/products/components/ArtStickersListView.tsx",
  "appkit/src/features/pre-orders/components/PreOrdersListView.tsx",
  "appkit/src/features/products/components/PrizeDrawsListingView.tsx",
  "appkit/src/features/stores/components/StoreProductsPageView.tsx",
  "appkit/src/features/stores/components/StoreAuctionsPageView.tsx",
  "appkit/src/features/stores/components/StorePreOrdersPageView.tsx",
  "appkit/src/features/stores/components/StorePrizeDrawsPageView.tsx",
  "appkit/src/features/stores/components/StoreClassifiedsPageView.tsx",
  "appkit/src/features/stores/components/StoreDigitalCodesPageView.tsx",
  "appkit/src/features/stores/components/StoreLiveItemsPageView.tsx",
];

/**
 * (d) The "Show sold" / "Show ended" defaults depend on WHICH listing types a
 * page spans, and /products now spans all nine. Both halves of the pair must
 * derive them from the one shared helper — two mirrored literals is precisely
 * how Root Cause #30 is written, and `staleTime: Infinity` makes the resulting
 * disagreement permanent rather than transient.
 */
const SHARED_TOGGLE_HELPER = "defaultTogglesForListingTypes";
const SHARED_TOGGLE_CONSUMERS = [
  "appkit/src/features/products/components/ProductsIndexPageView.tsx",
  "appkit/src/features/products/components/ArtStickersListView.tsx",
];

/** The only file allowed to decide how a public product query is shaped. */
const SHARED_QUERY_MODULE =
  "appkit/src/_internal/server/features/products/list-public.ts";

/**
 * (c) `art`/`stickers` were added to the `ListingType` union and to the plugin
 * registry, but never to the repository's `LISTING_KIND_ALIAS_MAP`. The alias
 * resolver returns "" for an unknown token and `expandFilterAliases` then drops
 * the empty clause — so `listingType==art|stickers` was DELETED before reaching
 * Firestore, on the SSR path, on /api/products, and inside listingProcessor.
 * Every union member must be mappable, or the filter silently does nothing.
 */
const LISTING_TYPE_UNION_FILE = "appkit/src/features/products/types/index.ts";
const LISTING_TYPE_COVERAGE_TARGETS = [
  {
    file: "appkit/src/features/products/repository/products.repository.ts",
    mapName: "LISTING_KIND_ALIAS_MAP",
    note: "unmapped types are silently dropped from the Firestore query",
  },
  {
    file: "appkit/src/_internal/shared/listing-types/feature-flags.ts",
    mapName: "ALL_LISTING_TYPES_MAP",
    note: "missing types are stripped by the enabled-types post-filter",
  },
  {
    file: "appkit/src/_internal/shared/listing-types/_registry.ts",
    mapName: "LISTING_TYPE_REGISTRY",
    note: "missing types have no detailRoute/badge and fall back to standard",
  },
];

// ─── Collect violations ───────────────────────────────────────────────────

const violations = [];

function readSource(relPath) {
  const full = join(ROOT, relPath);
  try {
    return readFileSync(full, "utf8");
  } catch {
    return null;
  }
}

/**
 * Comment-stripped source, for the structural checks below.
 *
 * Those checks look for `productRepository.list(` and `.catch(() => null)` as
 * evidence of a hand-rolled query. A file that DESCRIBES the old pattern in a
 * comment ("this used to call productRepository.list() and swallow via
 * .catch(() => null)") would otherwise be flagged for documenting the very fix
 * it received.
 */
function readCode(relPath) {
  const raw = readSource(relPath);
  if (raw === null) return null;
  return raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

/**
 * Delegation targets that satisfy "routes through the shared query".
 * `listStoreProducts` is a thin wrapper around `listPublicProducts` that pins
 * the store id — store tab views call it rather than the base function.
 */
const SHARED_QUERY_ENTRYPOINTS = ["listPublicProducts", "listStoreProducts"];

for (const entry of API_ROUTE_STATUS_DEFAULTS) {
  const content = readSource(entry.file);
  if (content === null) {
    violations.push({
      kind: "MISSING_FILE",
      file: entry.file,
      detail: `registered route file not found — update the registry in ${relative(ROOT, __filename)}`,
    });
    continue;
  }
  if (!content.includes(entry.pattern)) {
    violations.push({
      kind: "API_STATUS_DEFAULT_DROPPED",
      file: entry.file,
      detail: `expected "${entry.pattern}" (${entry.note}) — not found`,
    });
  }
}

// (b) Structural: SSR listing views delegate, never hand-roll.
for (const file of SSR_LISTING_VIEWS) {
  const content = readCode(file);
  if (content === null) {
    violations.push({
      kind: "MISSING_FILE",
      file,
      detail: `registered SSR file not found — update the registry in ${relative(ROOT, __filename)}`,
    });
    continue;
  }

  if (!SHARED_QUERY_ENTRYPOINTS.some((fn) => content.includes(fn))) {
    violations.push({
      kind: "SSR_BYPASSES_SHARED_QUERY",
      file,
      detail:
        `calls none of ${SHARED_QUERY_ENTRYPOINTS.join("/")} — every public listing ` +
        `view must go through ${SHARED_QUERY_MODULE} so its filter semantics match ` +
        `/api/products exactly`,
    });
  }

  if (/productRepository\s*\.\s*list\s*\(/.test(content)) {
    violations.push({
      kind: "SSR_DIRECT_REPOSITORY_QUERY",
      file,
      detail:
        "calls productRepository.list() directly — this is how the SSR path drifted " +
        "from /api/products. Build the query with listPublicProducts instead",
    });
  }

  // The swallow that made the bug invisible: a failed query became "no results".
  const silentCatch = /\.catch\s*\(\s*\(\s*\)\s*=>\s*(null|undefined|\[\])\s*\)/.exec(content);
  if (silentCatch) {
    violations.push({
      kind: "SILENT_QUERY_CATCH",
      file,
      detail:
        `\`${silentCatch[0]}\` turns a FAILED_PRECONDITION (missing/mis-ordered index) ` +
        "into an indistinguishable empty page. listPublicProducts already logs and " +
        "returns null — don't add another swallow on top",
    });
  }

  // An inequality on stockQuantity can only be pushed into Firestore when the
  // query also sorts by stockQuantity, which no listing page does.
  if (/(STOCK_QUANTITY|["']stockQuantity["'])\s*,\s*SIEVE_OP\.(GT|GTE|LT|LTE)/.test(content)) {
    violations.push({
      kind: "UNSAFE_INEQUALITY_PUSHDOWN",
      file,
      detail:
        "pushes a stockQuantity range into the Firestore query. Firestore appends the " +
        "inequality field to the orderBy implicitly, so pairing it with a createdAt/price " +
        "sort demands an index nobody declares. Pass `inStock` to listPublicProducts, " +
        "which applies it in memory over a bounded fetch",
    });
  }
}

// (d) Both halves of an SSR/client pair derive their toggle defaults from the
//     one shared helper.
for (const file of SHARED_TOGGLE_CONSUMERS) {
  const content = readSource(file);
  if (content === null) {
    violations.push({
      kind: "MISSING_FILE",
      file,
      detail: `registered toggle-helper consumer not found — update the registry in ${relative(ROOT, __filename)}`,
    });
    continue;
  }
  if (!content.includes(SHARED_TOGGLE_HELPER)) {
    violations.push({
      kind: "TOGGLE_DEFAULTS_NOT_SHARED",
      file,
      detail:
        `does not call ${SHARED_TOGGLE_HELPER}() — the "Show sold"/"Show ended" ` +
        `defaults must come from the shared helper, not a hardcoded literal, or SSR ` +
        `and the client refetch can disagree permanently (staleTime: Infinity)`,
    });
  }
}

// (c) Every ListingType union member must be present in each registry that
//     would otherwise silently drop it.
const unionSource = readSource(LISTING_TYPE_UNION_FILE);
if (unionSource === null) {
  violations.push({
    kind: "MISSING_FILE",
    file: LISTING_TYPE_UNION_FILE,
    detail: `ListingType union source not found — update the registry in ${relative(ROOT, __filename)}`,
  });
} else {
  const unionMatch = /export type ListingType\s*=([\s\S]*?);/.exec(unionSource);
  const listingTypes = unionMatch
    ? [...unionMatch[1].matchAll(/["']([a-z-]+)["']/g)].map((m) => m[1])
    : [];

  if (listingTypes.length === 0) {
    violations.push({
      kind: "UNION_PARSE_FAILED",
      file: LISTING_TYPE_UNION_FILE,
      detail: "could not extract the ListingType union — this audit cannot verify coverage",
    });
  }

  for (const target of LISTING_TYPE_COVERAGE_TARGETS) {
    const content = readSource(target.file);
    if (content === null) {
      violations.push({
        kind: "MISSING_FILE",
        file: target.file,
        detail: `registered coverage target not found — update the registry in ${relative(ROOT, __filename)}`,
      });
      continue;
    }
    // Brace-walk the map literal so a match elsewhere in the file can't mask a
    // genuinely missing entry.
    const start = content.indexOf(target.mapName);
    const open = start === -1 ? -1 : content.indexOf("{", start);
    if (open === -1) {
      violations.push({
        kind: "MAP_NOT_FOUND",
        file: target.file,
        detail: `${target.mapName} not found — ${target.note}`,
      });
      continue;
    }
    let depth = 0;
    let end = open;
    for (let i = open; i < content.length; i++) {
      if (content[i] === "{") depth++;
      else if (content[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const body = content.slice(open, end + 1);
    const missing = listingTypes.filter(
      (t) => !new RegExp(`(^|[\\s{,])["']?${t}["']?\\s*:`, "m").test(body),
    );
    if (missing.length > 0) {
      violations.push({
        kind: "LISTING_TYPE_NOT_MAPPED",
        file: target.file,
        detail: `${target.mapName} is missing ListingType member(s): ${missing.join(", ")} — ${target.note}`,
      });
    }
  }
}

// (d) Nothing outside the shared module may push a stockQuantity inequality.
{
  const shared = readSource(SHARED_QUERY_MODULE);
  if (shared === null) {
    violations.push({
      kind: "MISSING_FILE",
      file: SHARED_QUERY_MODULE,
      detail: "the shared public-listing query module is gone — SSR views have nothing to delegate to",
    });
  } else if (!shared.includes("hasUnsafeFilter")) {
    violations.push({
      kind: "SHARED_QUERY_LOST_INMEMORY_PATH",
      file: SHARED_QUERY_MODULE,
      detail:
        "no `hasUnsafeFilter` branch — the in-memory inStock/date-range handling that " +
        "6fe4e0dd8 introduced has been removed, which reintroduces the FAILED_PRECONDITION bug",
    });
  }
}

// ─── Report ───────────────────────────────────────────────────────────────

if (violations.length === 0) {
  console.log("audit-listing-filter-parity: clean ✓");
  process.exit(0);
}

const out = [
  `audit-listing-filter-parity: ${violations.length} violation(s) found.\n`,
  "[LISTING_FILTER_PARITY] SSR/client default-filter divergence risk (Root Cause #30)",
  "  Fix: restore the missing default/token — see the file header of this script",
  "  for the full mechanism (staleTime:Infinity freezes SSR initialData forever).",
  "",
  ...violations.map((v) => `  [${v.kind}] ${v.file}\n    → ${v.detail}`),
];

process.stderr.write(out.join("\n") + "\n");
process.exit(1);
