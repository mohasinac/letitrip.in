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
 * MODE: STRICT since W8 — there is no `MIGRATE`/`STRICT` env branch left in
 * this file and the failure path exits 1 unconditionally. This header read
 * "report-only until the remaining backlog is cleared" for a long time after
 * that stopped being true, as did `scripts/run-audits.mjs` and CLAUDE.md;
 * all three were corrected 2026-10-22.
 *
 * 🛑 SCOPE, corrected 2026-10-22. The entry condition used to be the bare
 * string `ListingViewConfig`, which meant the audit could only ever see views
 * that NAME that type. Two whole classes were invisible to it:
 *
 *   1. A view using `<DataListingView config={{…}}/>` with an INLINE config
 *      object, which never names the type. `SellerSupportView` did exactly
 *      that and was a real dead end — a seller could read a ticket's subject
 *      and a 140-character slice of its description and never open the thread,
 *      under a footer telling them replies happen in that thread.
 *   2. Every HAND-ROLLED list — a `.map()` over cards, a raw `<Table>`, or a
 *      bare `<DataTable rows>` with no columns. `AdminSectionsView` rendered
 *      an inert table of homepage sections whose only edit path was a toolbar
 *      button, a "Mode" dropdown and a second dropdown to re-find the row you
 *      had just clicked past. The audit reported "clean ✓ (66 views checked)"
 *      throughout.
 *
 * `LISTING_MARKER` now matches either spelling, which closes (1) for free.
 * (2) cannot be detected generically — there is no syntactic signature for
 * "this `.map()` is a list of records" that does not also match every nav menu
 * and every set of dashboard tiles — so those views are named explicitly in
 * `HAND_ROLLED_VIEWS` below. Adding a file there is a deliberate, reviewable
 * act; the alternative is a heuristic loud enough that people learn to ignore
 * it (CLAUDE.md Root Cause #84, the mirror case).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOT = join(ROOT, "appkit", "src");

/**
 * Any file matching this is a dashboard listing view.
 *
 * Both spellings are required: a config built in a `buildXListingConfig`
 * factory names the TYPE and never renders the component, while a view with an
 * inline config renders the COMPONENT and never names the type.
 */
const LISTING_MARKER = /ListingViewConfig|<DataListingView/;

/**
 * Hand-rolled listing views — a `.map()` over cards, a raw `<Table>`, or a
 * bare `<DataTable rows>` — registered by path because nothing in their text
 * identifies them as listings.
 *
 * Paths are repo-relative and may live outside `appkit/src` (several buyer
 * surfaces are `.tsx` pages under `src/app`). A path that no longer exists is
 * reported rather than skipped: a stale entry silently stops checking the file
 * it names, which is the failure mode this whole audit exists to catch one
 * level down.
 */
const HAND_ROLLED_VIEWS = [
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
  "appkit/src/features/admin/components/AdminNavigationView.tsx",
  "appkit/src/features/admin/components/AdminMediaView.tsx",
  "appkit/src/features/admin/components/AdminFulfillmentView.tsx",
  "appkit/src/features/admin/components/AdminAddressClustersView.tsx",
  "appkit/src/features/admin/components/AdminPaymentClustersView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentLotItemsView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentProjectionsView.tsx",
  "appkit/src/features/tester/components/AdminTesterFeedbackIssuesView.tsx",
  "appkit/src/features/seller/components/FulfillmentView.tsx",
  "appkit/src/features/seller/components/SellerAnalyticsAlertsView.tsx",
  "appkit/src/features/seller/components/SellerFeaturesView.tsx",
  "appkit/src/features/seller/components/SellerAddressesView.tsx",
  "appkit/src/features/catalogue/components/UserCatalogueView.tsx",
  "appkit/src/features/account/components/UserOffersPanel.tsx",
  "appkit/src/features/messages/components/ConversationsInboxView.tsx",
  "src/components/user/ProfileActivityPanel.tsx",
  "src/components/user/UserPointsView.tsx",
  "src/components/user/UserAddressesClient.tsx",
  "src/app/[locale]/user/reviews/page.tsx",
  "src/app/[locale]/user/notifications/page.tsx",
  "src/app/[locale]/user/sessions/page.tsx",
  "src/app/[locale]/user/payment-methods/page.tsx",
];

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
/*
 * A per-row identity field. `.id` is not the only one, and assuming it was
 * produced a FALSE POSITIVE: the admin media library lists Storage objects,
 * which have no record id at all — `GET /api/admin/media` returns `f.name`
 * straight off the bucket — so a link to the file itself, which is as
 * row-scoped as a link can be, did not match and the view kept reporting as a
 * dead end after it had been fixed.
 *
 * Kept to IDENTITY fields rather than widened to any property access: the
 * point of this test is that the link names one row, and `.title` or `.label`
 * on the same line as an href says nothing about where it goes. The nav
 * marker must still appear on the same line.
 */
const ROW_ID_RE = /\.id\b|\{id\}|\.name\b|\.slug\b|\.downloadURL\b|\.storagePath\b/;

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
const missingRegistered = [];
let checked = 0;

/**
 * Files to judge: everything under `appkit/src` that looks like a listing view,
 * plus every explicitly registered hand-rolled one. A registered file inside
 * the scan root is deduped rather than counted twice.
 */
const targets = new Set();
for (const file of walk(SCAN_ROOT)) {
  // Comments stripped BEFORE the listing-view test — a docstring that names
  // ListingViewConfig does not make a file a listing view.
  if (!LISTING_MARKER.test(stripComments(readFileSync(file, "utf8")))) continue;
  targets.add(file);
}
for (const rel of HAND_ROLLED_VIEWS) {
  const full = join(ROOT, rel);
  try {
    statSync(full);
  } catch {
    missingRegistered.push(rel);
    continue;
  }
  targets.add(full);
}

for (const file of targets) {
  const ownText = stripComments(readFileSync(file, "utf8"));
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

if (violations.length === 0 && missingRegistered.length === 0) {
  console.log(
    `audit-listing-detail-affordance: clean ✓ (${checked} listing views checked)`,
  );
  process.exit(0);
}

if (missingRegistered.length > 0) {
  console.error(
    `audit-listing-detail-affordance: ${missingRegistered.length} registered hand-rolled view(s) no longer exist — HAND_ROLLED_VIEWS is stale and has stopped checking them:\n`,
  );
  for (const m of missingRegistered) console.error(`  ${m}`);
  console.error(
    "\nIf the view was renamed, update the path. If it was deleted or migrated\nto DataListingView, remove the entry — it is already covered by the scan.\n",
  );
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

if (violations.length === 0) process.exit(1);

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
