#!/usr/bin/env node
/**
 * audit-listing-detail-affordance.mjs — strict-zero.
 *
 * Catches the "dead-end list" bug class: a dashboard listing view whose rows
 * the user can look at but never OPEN. Every row is a real Firestore document
 * with content behind it (a cart's items[], a wishlist's items[], a review's
 * body, a bid's auction), but the view exposes no way to reach any of it —
 * no row click, no row-action menu, no editor drawer, no link, nothing.
 *
 * This is the listing-level sibling of CLAUDE.md Recurrent Root Cause #52:
 * data that's already fetched and sitting in the response, never rendered,
 * because the UI was never wired to it. Found live in 8 of 70 listing views
 * during the 2026-08-21 sweep — e.g. AdminCartsView computes
 * `itemCount = item.items.length` and renders only the count, discarding the
 * items array it already has in hand, with no detail surface to show it.
 *
 * Method: no TypeScript compiler in the loop — matches this project's
 * existing regex/text-extraction audit convention (see
 * audit-filter-tab-enums.mjs, audit-list-serializer-parity.mjs and
 * audit-selectable-card-navigation.mjs for precedent). Any `.tsx` under
 * appkit/src that references `ListingViewConfig` is treated as a dashboard
 * listing view and must contain at least one AFFORDANCE marker.
 *
 * The marker set is deliberately generous — an affordance is legitimate
 * whether it lives directly on the config (`onRowClick`, `rowHrefTemplate`,
 * `renderEditor`, `renderRowActions`), inside a custom `renderCards`
 * renderer (a `<Link>`/`<TextLink href>`/`router.push`/NAVIGATE dispatch), or
 * is delegated to a card component through a callback prop (`onEdit`/
 * `onView`/`onOpen`, as SellerCouponsView does via `<CouponCard onEdit>`).
 * The audit only fires when NONE of them is present anywhere in the file,
 * which is a genuinely unreachable row — not a style preference about which
 * affordance to use.
 *
 * Suppression: `// audit-detail-affordance-ok: <reason>` anywhere in the
 * file, for a list whose rows genuinely have nothing more to show than the
 * row itself already displays. Reserve it for that real case — the fix for
 * everything else is to wire a detail surface, not to silence the counter
 * (CLAUDE.md Root Cause #22).
 *
 * MODE: report-only until the remaining backlog is cleared, matching the
 * `audit-route-schema-registry` precedent — the sweep that introduced this
 * audit fixed 7 of the 16 views it found, and failing the gate on the
 * other 9 would block every turn for work that is queued, not forgotten.
 * Run with `MIGRATE=strict` (or set STRICT=1) to make it blocking; flip the
 * default here once the count reaches 0.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOT = join(ROOT, "appkit", "src");

/** Any file mentioning this type is a dashboard listing view. */
const LISTING_MARKER = "ListingViewConfig";

/** Per-file opt-out for lists whose rows genuinely have no detail. */
const SUPPRESS_RE = /\/\/\s*audit-detail-affordance-ok\s*:/;

/**
 * At least one of these must appear for the row to be reachable.
 *
 * Note `renderRowActions` is deliberately NOT in this list. A row-action menu
 * full of pure mutations ("Accept"/"Counter"/"Reject" on SellerOffersView,
 * "Revoke" on AdminSessionsView, "Unsubscribe" on AdminNewsletterView) lets
 * you act on a record you were never able to READ — the same dead end, one
 * step less obvious. Row actions only count when one of them actually opens
 * the record; that's the separate DETAIL_ACTION_TOKENS check below.
 */
const AFFORDANCES = [
  // -- Directly on the ListingViewConfig object. Inherently row-scoped:
  //    DataListingView only ever invokes these per row.
  "onRowClick",
  "rowHrefTemplate",
  "renderEditor",
  // -- Delegated to a card component via a callback prop
  "onEdit",
  "onView",
  "onOpen",
];

/**
 * Navigation inside a custom `renderCards`/`columns` renderer only counts
 * when it is ROW-SCOPED. A bare `<TextLink href>` anywhere in the file is not
 * enough: UserBidsView's only link is a "Browse auctions" call-to-action
 * inside `emptyLabel`, which navigates to a listing page and says nothing
 * about reaching an individual bid. Requiring an id reference on the same
 * line separates a real per-row link (`ORDER_DETAIL(order.id)`,
 * `` `/admin/ads/${row.id}/edit` ``) from page-level chrome.
 */
const ROW_NAV_MARKERS = ["<Link", "<TextLink", "href=", "router.push", "NAVIGATE"];
const ROW_ID_RE = /\.id\b|\{id\}/;

/**
 * A row action counts as a detail affordance only if it opens/edits the
 * record. Tokens are deliberately quote- or registry-anchored: a bare "View"
 * substring would match every `Admin*View` component name in the file and
 * silently pass every dead end.
 */
const DETAIL_ACTION_TOKENS = [
  'ROW_ACTION_ID.VIEW',
  'ROW_ACTION_ID.EDIT',
  '"View',
  '"Edit',
  '"Open',
  '"Manage',
  '"Preview',
  '"Reassign',
  "edit-",
  "view-",
  "manage-",
  "review-",
];

const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.name.endsWith(".tsx") && !e.name.endsWith(".d.ts")) yield full;
  }
}

let scanRootExists = false;
try {
  scanRootExists = statSync(SCAN_ROOT).isDirectory();
} catch {
  scanRootExists = false;
}
if (!scanRootExists) {
  console.log("audit-listing-detail-affordance: appkit/src not found, skipping");
  process.exit(0);
}

const violations = [];
let checked = 0;

for (const file of walk(SCAN_ROOT)) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(LISTING_MARKER)) continue;
  checked++;
  if (SUPPRESS_RE.test(text)) continue;
  if (AFFORDANCES.some((m) => text.includes(m))) continue;
  if (DETAIL_ACTION_TOKENS.some((t) => text.includes(t))) continue;
  // Row-scoped navigation: a nav marker AND an id reference on the same line.
  const hasRowNav = text
    .split("\n")
    .some((line) => ROW_NAV_MARKERS.some((m) => line.includes(m)) && ROW_ID_RE.test(line));
  if (hasRowNav) continue;
  violations.push(relative(ROOT, file).replace(/\\/g, "/"));
}

if (violations.length === 0) {
  console.log(
    `audit-listing-detail-affordance: clean ✓ (${checked} listing views checked)`,
  );
  process.exit(0);
}

const strict = process.env.MIGRATE === "strict" || process.env.STRICT === "1";
const log = strict ? console.error : console.log;

log(
  strict
    ? `audit-listing-detail-affordance: ${violations.length} dead-end listing view(s) of ${checked} checked — rows can be seen but never opened.\n`
    : `audit-listing-detail-affordance: REPORT MODE — ${violations.length}/${checked} listing views await a detail surface.\n  Run with MIGRATE=strict to fail. Flip the default once the count reaches 0.\n`,
);
for (const v of violations) log(`  ${v}`);
log(
  [
    "",
    "Every dashboard listing row is a real document with content behind it.",
    "Wire ONE of the following so the user can actually reach it:",
    "  • config.onRowClick        — open a drawer/modal, or router.push a detail page",
    "  • config.rowHrefTemplate   — render rows as links (e.g. \"/admin/x/{id}/view\")",
    "  • config.renderRowActions  — a RowActionMenu with a \"View details\" entry",
    "  • config.renderEditor      — a SideDrawer editor",
    "  • a <Link>/<TextLink href> (or onEdit/onView callback) inside renderCards",
    "  • or reuse <RecordDetailModal> (appkit/src/ui/components/RecordDetailModal.tsx)",
    "",
    "If the row genuinely has nothing more to show than it already displays,",
    "annotate the file with: // audit-detail-affordance-ok: <reason>",
  ].join("\n"),
);
process.exit(strict ? 1 : 0);
