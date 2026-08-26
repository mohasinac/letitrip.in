#!/usr/bin/env node
/**
 * audit-create-affordance — strict-zero, with a shrinking grandfather list.
 *
 * ## The gap this fills
 *
 * A listing page you can read but from which you can never CREATE anything is
 * half a feature — the same shape as Root Cause #56's dead-end rows, from the
 * other direction. `audit-listing-detail-affordance` checks that a row can be
 * OPENED; nothing checked that a record can be MADE.
 *
 * That absence had a real cost. The rework plan asserted for weeks that
 * `/admin/ads/new` and `/admin/addresses/new` "exist but are unreachable from
 * their lists". Both were reachable the whole time — ads via a `toolbarExtra`
 * link, addresses via `AdminAddressBookView`, which is not a `DataListingView`
 * at all. The claim survived because it came from grepping `primaryAction`
 * and nothing ever measured the real property.
 *
 * ## 🛑 `toolbarExtra` counts. This is the whole subtlety.
 *
 * `DataListingView` passes BOTH `primaryAction` and `toolbarExtra` into
 * `ListingToolbar`'s `extra` slot, so a create button is equally valid in
 * either. Four views use the second form — `AdminAdsView`, `AdminBundlesView`,
 * `AdminTeamView`, `SellerBundlesView`. An audit keyed on `primaryAction`
 * alone re-reports exactly the false positives that produced the bad claim,
 * which is worse than no audit: it launders a wrong belief as a measurement.
 *
 * A `toolbarExtra` counts only when it actually looks like a create control —
 * a link to a `/new` route, or a handler whose name says create/invite/add.
 * An export-CSV button in `toolbarExtra` is not a create affordance, and
 * three views have exactly that (`AdminNewsletterView`, `AdminPayoutsView`,
 * `AdminEventEntriesView`).
 *
 * ## Inbound-only listings are ALLOWED, with a reason
 *
 * Orders, bids, offers, sessions, returns, audit-log entries and the rest are
 * created by the platform or the buyer, never by the admin reading the list. A
 * create button there would be wrong. Those go in INBOUND_ONLY **with a stated
 * reason each** — not a silent skip, because "why is this exempt" is the
 * question a future reader will have.
 *
 * Suppression: `// audit-create-affordance-ok: <reason>` anywhere in the file,
 * for a listing whose creation genuinely lives elsewhere.
 *
 * Exit 0 — clean.  Exit 1 — a listing config with no way to create a record.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);
const EXTS = [".ts", ".tsx"];

/** The file that DEFINES the config type — never a violation. */
const PRIMITIVE = "appkit/src/features/admin/components/DataListingView.tsx";

/** Builds or types a listing config. */
const IS_LISTING_CONFIG = /ListingViewConfig\s*</;

/** The declared create button. */
const HAS_PRIMARY_ACTION = /\bprimaryAction\s*:/;

/**
 * A `toolbarExtra` that is genuinely a create control.
 *
 * Deliberately narrow: a link to a `/new` route, an `openCreatePanel` /
 * `openInvite` style handler, or a label that says so. An export button in
 * the same slot must NOT satisfy the rule.
 */
const HAS_TOOLBAR_CREATE =
  /\btoolbarExtra\s*:[\s\S]{0,600}?(?:\/new\b|newHref|createHref|openCreate|openInvite|openAdd|\bNew\s|\+ New|Invite\b)/;

const SUPPRESS = /audit-create-affordance-ok:/;

/**
 * Listings whose records the platform or a buyer creates — never the person
 * reading the list. Each entry states why, because a silent skip is
 * indistinguishable from an oversight six months later.
 */
const INBOUND_ONLY = new Map([
  // ── Commerce the buyer initiates ──────────────────────────────────────
  ["appkit/src/features/account/components/UserOrdersView.tsx", "an order is placed at checkout"],
  ["appkit/src/features/account/components/UserBidsView.tsx", "a bid is placed on an auction"],
  ["appkit/src/features/account/components/UserReturnsView.tsx", "a return is requested against an order"],
  ["appkit/src/features/admin/components/AdminOrdersView.tsx", "an order is placed at checkout"],
  ["appkit/src/features/admin/components/AdminBidsView.tsx", "a bid is placed on an auction"],
  ["appkit/src/features/admin/components/AdminOffersView.tsx", "an offer is made by a buyer on a listing"],
  ["appkit/src/features/admin/components/AdminReturnRequestsView.tsx", "a return is requested against an order"],
  ["appkit/src/features/admin/components/AdminCartsView.tsx", "a cart is created by shopping"],
  ["appkit/src/features/admin/components/AdminWishlistsView.tsx", "a wishlist is created by saving an item"],
  ["appkit/src/features/admin/components/AdminHistoryView.tsx", "browsing history is written by viewing"],
  ["appkit/src/features/seller/components/SellerOrdersView.tsx", "an order is placed at checkout"],
  ["appkit/src/features/seller/components/SellerBidsView.tsx", "a bid is placed on an auction"],
  ["appkit/src/features/seller/components/SellerOffersView.tsx", "an offer is made by a buyer"],
  ["appkit/src/features/seller/components/SellerReviewsView.tsx", "a review is written by a buyer"],

  // ── Written by the platform ───────────────────────────────────────────
  ["appkit/src/features/admin/components/AdminAuditLogView.tsx", "an entry is recorded by recordAdminAction"],
  ["appkit/src/features/admin/components/AdminSessionsView.tsx", "a session is created by signing in"],
  ["appkit/src/features/admin/components/AdminNotificationsView.tsx", "a notification is created by sendNotification; admin-authored ones have their own composer"],
  ["appkit/src/features/admin/components/AdminPayoutsView.tsx", "a payout is generated by the weekly eligibility job"],
  ["appkit/src/features/seller/components/SellerPayoutsView.tsx", "a payout is generated by the weekly eligibility job"],
  ["appkit/src/features/admin/components/analytics/AdminPageViewsReportView.tsx", "a report row is an aggregate, not a record"],

  // ── Inbound from the public ───────────────────────────────────────────
  ["appkit/src/features/admin/components/AdminContactView.tsx", "a contact message is submitted from /contact"],
  ["appkit/src/features/admin/components/AdminReviewsView.tsx", "a review is written by a buyer"],
  ["appkit/src/features/admin/components/AdminSupportTicketsView.tsx", "a ticket is opened by a user"],
  ["appkit/src/features/admin/components/AdminAllEventEntriesView.tsx", "an entry is created by participating in an event"],
  ["appkit/src/features/events/components/AdminEventEntriesView.tsx", "an entry is created by participating in an event"],
  ["appkit/src/features/catalogue/components/AdminCatalogueApprovalsView.tsx", "a submission arrives from a user's own catalogue"],
  ["appkit/src/features/tester/components/AdminTesterFeedbackListView.tsx", "feedback is submitted by a tester"],
  ["appkit/src/features/admin/components/AdminScammersView.tsx", "a profile is created via the public /api/scams/reports flow"],
  ["appkit/src/features/admin/components/AdminNewsletterView.tsx", "a subscriber signs up; the admin unsubscribes, never adds"],

  // ── The buyer's own record of things they already did ─────────────────
  // Found by this audit on its first run: the earlier survey only walked
  // appkit/src, so six consumer-side listing configs were never counted.
  ["src/app/[locale]/user/digital-codes/page.tsx", "a code is acquired by buying a digital-code listing"],
  ["src/app/[locale]/user/events/page.tsx", "an entry is created by joining an event"],
  ["src/app/[locale]/user/notifications/page.tsx", "a notification is received, never composed"],
  ["src/app/[locale]/user/pre-orders/page.tsx", "a pre-order is placed at checkout"],
  ["src/app/[locale]/user/prize-draws/page.tsx", "an entry is created by buying into a draw"],
  ["src/app/[locale]/user/reviews/page.tsx", "a review is written from the product or order page, not from this list"],
]);

/**
 * Known gaps, measured 2026-08-26. Remove an entry the moment its listing
 * grows a create button — never add one.
 */
const GRANDFATHERED = new Set([
  "appkit/src/features/admin/components/AdminAddressesView.tsx",
  "appkit/src/features/admin/components/AdminStoreAddressesView.tsx",
  "appkit/src/features/admin/components/AdminPaymentMethodsView.tsx",
  "appkit/src/features/admin/components/AdminPrizeDrawsView.tsx",
  "appkit/src/features/admin/components/AdminStoresView.tsx",
  "appkit/src/features/admin/components/AdminSublistingCategoriesView.tsx",
  "appkit/src/features/admin/components/AdminGroupedListingsView.tsx",
  "appkit/src/features/admin/components/AdminUsersView.tsx",
  "appkit/src/features/seller/components/SellerAuctionsView.tsx",
  "appkit/src/features/seller/components/SellerPreOrdersView.tsx",
  "appkit/src/features/seller/components/SellerPrizeDrawsView.tsx",
  // One shared config backs five admin listing-type pages (art, classified,
  // digital-codes, live, stickers), so this single entry is five screens.
  "appkit/src/features/products/config/listing-type-listing-config.ts",
]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

function main() {
  const violations = [];
  const staleGrandfather = new Set(GRANDFATHERED);
  const staleInbound = new Set(INBOUND_ONLY.keys());
  let checked = 0;

  for (const root of SCAN) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      const relPath = rel(file);
      if (relPath === PRIMITIVE) continue;

      const raw = readFileSync(file, "utf8");
      // Comment-stripped so a docstring mentioning `primaryAction:` cannot
      // satisfy the rule — the fourth audit in this repo to need this.
      const src = stripComments(raw);
      if (!IS_LISTING_CONFIG.test(src)) continue;

      checked++;
      staleInbound.delete(relPath);

      if (HAS_PRIMARY_ACTION.test(src) || HAS_TOOLBAR_CREATE.test(src)) {
        staleGrandfather.delete(relPath);
        continue;
      }
      if (SUPPRESS.test(raw)) { staleGrandfather.delete(relPath); continue; }
      if (INBOUND_ONLY.has(relPath)) continue;
      if (GRANDFATHERED.has(relPath)) { staleGrandfather.delete(relPath); continue; }

      violations.push(
        `${relPath} :: builds a ListingViewConfig with no way to create a record — ` +
          `no \`primaryAction\`, and no create control in \`toolbarExtra\``,
      );
    }
  }

  if (staleGrandfather.size > 0) {
    console.log("[audit-create-affordance] now has a create button — remove from GRANDFATHERED:");
    for (const f of staleGrandfather) console.log(`  ✓ ${f}`);
    console.log("");
  }
  if (staleInbound.size > 0) {
    console.log("[audit-create-affordance] no longer a listing config — remove from INBOUND_ONLY:");
    for (const f of staleInbound) console.log(`  ✓ ${f}`);
    console.log("");
  }

  if (violations.length === 0) {
    const left = GRANDFATHERED.size - staleGrandfather.size;
    console.log(
      `audit-create-affordance: clean ✓ (${checked} listing config(s); ` +
        `${INBOUND_ONLY.size} inbound-only; ${left} awaiting a create button)`,
    );
    process.exit(0);
  }

  console.error("\n[audit-create-affordance] STRICT-ZERO violation(s):\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nA list you can read but never add to is half a feature.\n\n" +
      "  · add `primaryAction: { label, onClick: ({ openCreatePanel }) => … }`\n" +
      "  · or a create link in `toolbarExtra` (both land in the same toolbar slot)\n" +
      "  · or, if the platform/buyer creates these records and an admin never\n" +
      "    should, add it to INBOUND_ONLY in this file WITH a stated reason\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
