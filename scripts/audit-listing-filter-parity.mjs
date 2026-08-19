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
    file: "src/app/api/products/route.ts",
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

// ─── (b) SSR filter-builder file ↔ the "Show X" toggle param + the filter
//     field it must gate. Both substrings must appear in the SSR file for
//     the pairing to be considered intact.
const SSR_CLIENT_TOGGLE_PAIRS = [
  {
    file: "appkit/src/features/auctions/components/AuctionsListView.tsx",
    togglePattern: "showEnded",
    fieldPattern: "dateFrom",
    note: "mirrors AuctionsIndexListing's showEnded → dateFrom=now default",
  },
  {
    file: "appkit/src/features/products/components/ProductsIndexPageView.tsx",
    togglePattern: "showSold",
    fieldPattern: "STOCK_QUANTITY",
    note: "mirrors ProductsIndexListing's showSold → inStock default",
  },
  {
    file: "appkit/src/features/products/components/ArtStickersListView.tsx",
    togglePattern: "showSold",
    fieldPattern: "STOCK_QUANTITY",
    note: "mirrors ProductsIndexListing's showSold → inStock default",
  },
  {
    file: "appkit/src/features/pre-orders/components/PreOrdersListView.tsx",
    togglePattern: "showClosed",
    fieldPattern: "stockQuantity",
    note: "mirrors PreOrdersIndexListing's showClosed → inStock default",
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

for (const entry of SSR_CLIENT_TOGGLE_PAIRS) {
  const content = readSource(entry.file);
  if (content === null) {
    violations.push({
      kind: "MISSING_FILE",
      file: entry.file,
      detail: `registered SSR file not found — update the registry in ${relative(ROOT, __filename)}`,
    });
    continue;
  }
  const missing = [];
  if (!content.includes(entry.togglePattern)) missing.push(entry.togglePattern);
  if (!content.includes(entry.fieldPattern)) missing.push(entry.fieldPattern);
  if (missing.length > 0) {
    violations.push({
      kind: "SSR_TOGGLE_PARITY_DROPPED",
      file: entry.file,
      detail: `expected both "${entry.togglePattern}" and "${entry.fieldPattern}" (${entry.note}) — missing: ${missing.join(", ")}`,
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
