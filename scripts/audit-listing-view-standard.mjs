#!/usr/bin/env node
/**
 * audit-listing-view-standard.mjs — every admin/seller/user dashboard
 * "listing" surface (a table/grid of many records with search, filter, sort,
 * pagination) must go through the standard `DataListingView` config-driven
 * scaffold (`appkit/src/features/admin/components/DataListingView.tsx`), not
 * a hand-rolled composition of `ListingToolbar`/`Pagination`/`BulkActionBar`/
 * `DataTable`/`ListingFilterDrawer`.
 *
 * Root-caused 2026-08-21: a whole-codebase sweep found 22 admin/seller/user
 * dashboard listings that bypassed `DataListingView` — some hand-assembled
 * the exact same primitive stack by hand (no real difference in capability,
 * just duplicated wiring every future page has to copy correctly again),
 * others were legacy pre-`DataListingView` scaffolds (`SlottedListingView`)
 * or ad-hoc client-side-filtered pages with no shared pattern at all. All 22
 * were migrated in the same session this audit was added. See CLAUDE.md's
 * Recurrent Root Cause Patterns / Duplication Decision Framework for why a
 * single shared scaffold beats N hand-wired copies (Rule of Three, bug-fix
 * multiplier, test-burden multiplier — this pattern hit all three).
 *
 * Detection: a file is "listing-shaped" if it imports `ListingToolbar`
 * directly (the toolbar is only ever reached for real search/filter/sort
 * UI — no non-listing page has a reason to import it) or renders a bare
 * `<DataTable` JSX tag. A listing-shaped file that does NOT also import
 * `DataListingView` is a violation, unless explicitly allowlisted below.
 *
 * Strict zero — every violation blocks `npm run check`. The allowlist below
 * is reserved for genuine architectural exceptions (documented per entry,
 * per Root Cause #22 — no blanket suppression). Do not add a new entry to
 * bypass a violation without a specific, defensible reason; the correct fix
 * for a new hand-rolled listing is almost always to convert it, matching the
 * 22 conversions already done.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Files that ARE part of the DataListingView composition itself (or a
// deliberately separate, non-dashboard listing shell) — scanning these for
// "imports ListingToolbar but not DataListingView" would always false-positive.
const BUILDING_BLOCKS = new Set([
  "appkit/src/features/admin/components/DataListingView.tsx",
  "appkit/src/features/admin/components/DataTable.tsx",
  "appkit/src/features/admin/components/AdminViewCards.tsx",
  "appkit/src/ui/components/SlottedListingView.tsx",
  "appkit/src/ui/components/ListingLayout.tsx",
  "appkit/src/ui/components/StackedViewShell.tsx",
]);

/**
 * @typedef {{ file: string, reason: string }} AllowlistEntry
 */

/** @type {AllowlistEntry[]} */
const ALLOWLIST = [
  {
    file: "appkit/src/features/admin/components/AdminCarouselView.tsx",
    reason: "Drag-to-reorder carousel slides requires client-side row reordering that DataListingView's internal row-ownership has no seam for — converting would either drop drag-reorder or require a new DataListingView extension, out of scope for the UI-standardization pass. Otherwise composes the exact same primitive stack DataListingView wraps.",
  },
  {
    file: "appkit/src/features/admin/components/AdminSectionsView.tsx",
    reason: "Overwhelmingly a large multi-type homepage-CMS section builder (25+ typed builder forms + drag-reorder), not a filterable/sortable listing — the small bounded section list at the bottom shares the carousel view's drag-reorder constraint.",
  },
  {
    file: "appkit/src/features/products/components/PrizeDrawWinnerMappingView.tsx",
    reason: "Read-only item-to-order mapping, capped at ~16 rows per draw — deliberately bounded, no pagination/search/filter need. Documented in-code as intentional.",
  },
];

const ALLOWLIST_FILES = new Set(ALLOWLIST.map((e) => e.file));

const SCAN_DIRS = [
  join(ROOT, "appkit", "src", "features"),
  join(ROOT, "src", "app"),
];

const SKIP_DIRS = new Set(["node_modules", ".next", "__tests__", "seed"]);

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (extname(entry.name) === ".tsx") {
      files.push(full);
    }
  }
  return files;
}

/** Component-naming convention (Admin/Seller/User dashboard views) OR a
 * dashboard page.tsx under admin/store/user. Everything else (public pages,
 * non-dashboard components) is out of scope for this audit. */
function isInScope(relPath) {
  const isDashboardComponent =
    /appkit\/src\/features\/[^/]+\/components\/(Admin|Seller|User)[A-Za-z0-9]*View\.tsx$/.test(relPath);
  const isDashboardPage =
    /^src\/app\/\[locale\]\/(admin|store|user)\//.test(relPath) && relPath.endsWith("page.tsx");
  return isDashboardComponent || isDashboardPage;
}

function main() {
  const violations = [];

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const relPath = relative(ROOT, file).replace(/\\/g, "/");
      if (BUILDING_BLOCKS.has(relPath)) continue;
      if (!isInScope(relPath)) continue;

      const src = readFileSync(file, "utf8");
      const isListingShaped = src.includes("ListingToolbar") || /<DataTable[\s>]/.test(src);
      if (!isListingShaped) continue;

      const usesDataListingView = src.includes("DataListingView");
      if (usesDataListingView) continue;

      if (ALLOWLIST_FILES.has(relPath)) continue;

      violations.push(relPath);
    }
  }

  if (violations.length === 0) {
    console.log(`audit-listing-view-standard: clean ✓ (${ALLOWLIST.length} documented exception(s))`);
    process.exit(0);
  }

  console.error(`audit-listing-view-standard: ${violations.length} violation(s) found.\n`);
  console.error("Every admin/seller/user dashboard listing (search+filter+sort+paginate over");
  console.error("many records) must use the DataListingView config-driven scaffold instead of");
  console.error("hand-assembling ListingToolbar/Pagination/BulkActionBar/DataTable directly.");
  console.error("See appkit/src/features/admin/components/AdminSessionsView.tsx for the");
  console.error("reference pattern, or scripts/audit-listing-view-standard.mjs's own header");
  console.error("comment for the full writeup.\n");
  for (const v of violations) {
    console.error(`  ${v}`);
  }
  console.error("\nIf this file is a genuine architectural exception (not just inconvenient to");
  console.error("convert), add it to the ALLOWLIST in this script with a specific reason.");
  process.exit(1);
}

main();
