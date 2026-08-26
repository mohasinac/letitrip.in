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
import { stripComments } from "./lib/strip-comments.mjs";

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

/**
 * Config factories a view may build its `ListingViewConfig` from.
 *
 * A view that delegates to one of these has its affordance declared in the
 * FACTORY, not in the view file — so scanning the view alone reports a false
 * dead end. Five per-listing-type admin views were collapsed onto
 * `buildListingTypeListingConfig` on 2026-08-21; without this, consolidating
 * duplication would have looked like five new violations.
 *
 * Keyed by the factory function name so the check stays specific: any file
 * calling it inherits the factory's own affordance tokens.
 */
const CONFIG_FACTORIES = {
  buildListingTypeListingConfig:
    "appkit/src/features/products/config/listing-type-listing-config.ts",
};

/** Affordance tokens contributed by whichever factories a file calls. */
function factoryAffordanceText(text) {
  let extra = "";
  for (const [fn, rel] of Object.entries(CONFIG_FACTORIES)) {
    if (!text.includes(`${fn}(`)) continue;
    try {
      extra += readFileSync(join(ROOT, rel), "utf8");
    } catch {
      // A moved/renamed factory shouldn't crash the audit — the view just
      // falls back to being judged on its own contents.
    }
  }
  return extra;
}

const violations = [];
let checked = 0;

for (const file of walk(SCAN_ROOT)) {
  // Comments stripped BEFORE the listing-view test — a docstring that names
  // ListingViewConfig does not make a file a listing view.
  const ownText = stripComments(readFileSync(file, "utf8"));
  if (!ownText.includes(LISTING_MARKER)) continue;
  checked++;
  // Judge the view together with any config factory it delegates to.
  const text = ownText + factoryAffordanceText(ownText);
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

// STRICT since W8. The count reached zero, which is exactly the condition this
// audit's own message named for flipping the default.
//
// It was report-mode for a reason worth remembering: it started at 9, was still
// 8 when this work measured it, and had silently absorbed TWO new regressions
// in between — a number nobody is obliged to act on is a number that grows.
// Two of the ten it last reported were also false positives (a tab component
// and a hook that merely MENTION ListingViewConfig in a docstring), which is
// the other way a report-mode audit loses its readers.
const log = console.error;

log(
  `audit-listing-detail-affordance: ${violations.length} dead-end listing view(s) of ${checked} checked — rows can be seen but never opened.\n`,
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
process.exit(1);
