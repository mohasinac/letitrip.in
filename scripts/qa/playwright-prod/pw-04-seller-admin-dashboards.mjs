/**
 * pw-04 — Seller + Admin dashboard route coverage.
 *
 * Visits every static store/admin route as the appropriate role.
 * Asserts: layout shell (main + content), no redirect to /auth/login, no 5xx.
 * Expanded to cover all 31 store + 46 admin paths.
 */

import { getContext, localizedUrl, gotoAndWait } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── All static store paths ───────────────────────────────────────────────────

const SELLER_PATHS = [
  "/store",
  "/store/products",
  "/store/products/new",
  "/store/orders",
  "/store/auctions",
  "/store/auctions/new",
  "/store/pre-orders",
  "/store/pre-orders/new",
  "/store/bundles",
  "/store/bundles/new",
  "/store/prize-draws",
  "/store/prize-draws/new",
  "/store/coupons",
  "/store/coupons/new",
  "/store/templates",
  "/store/templates/new",
  "/store/analytics",
  "/store/payouts",
  "/store/payout-settings",
  "/store/storefront",
  "/store/shipping",
  "/store/addresses",
  "/store/offers",
  "/store/whatsapp",
  "/store/reviews",
  "/store/bids",
  "/store/sublisting-categories",
  "/store/sublisting-categories/new",
  "/store/features",
  "/store/features/new",
  "/store/slug",
];

// ─── All static admin paths ───────────────────────────────────────────────────

const ADMIN_PATHS = [
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/site",
  "/admin/carousel",
  "/admin/carousels",
  "/admin/sections",
  "/admin/navigation",
  "/admin/categories",
  "/admin/categories/new",
  "/admin/brands",
  "/admin/brands/new",
  "/admin/faqs",
  "/admin/faqs/new",
  "/admin/reviews",
  "/admin/coupons",
  "/admin/coupons/new",
  "/admin/media",
  "/admin/products",
  "/admin/products/new",
  "/admin/deals",
  "/admin/featured",
  "/admin/orders",
  "/admin/bids",
  "/admin/blog",
  "/admin/blog/new",
  "/admin/analytics",
  "/admin/payouts",
  "/admin/events",
  "/admin/events/new",
  "/admin/stores",
  "/admin/feature-flags",
  "/admin/copilot",
  "/admin/ads",
  "/admin/ads/new",
  "/admin/newsletter",
  "/admin/contact",
  "/admin/sessions",
  "/admin/event-entries",
  "/admin/notifications",
  "/admin/carts",
  "/admin/wishlists",
  "/admin/history",
  "/admin/return-requests",
  "/admin/store-addresses",
  "/admin/sublisting-categories",
  "/admin/sublisting-categories/new",
  "/admin/features",
  "/admin/features/new",
  "/admin/bundles",
  "/admin/bundles/new",
  "/admin/prize-draws",
  "/admin/team",
  "/admin/support-tickets",
  "/admin/scammers",
  "/admin/settings/actions",
  "/admin/settings/navigation",
  "/admin/carousel/new",
];

async function visitAs(role, paths) {
  const ctx = await getContext(role);

  for (const path of paths) {
    const page = await ctx.newPage();
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl(path));

      const redirectedToLogin = /\/auth\/login/.test(finalUrl);
      const redirectedToUnauth = /\/unauthorized/.test(finalUrl);
      const main = await page.locator("main").count();
      const content = await page
        .locator("h1, h2, h3, [data-section], [data-testid], .appkit-card, table, form")
        .count();

      // DataTable or EmptyState or form (list pages have table or empty-state; new pages have form)
      const hasTable = await page.locator('[data-testid=data-table], table').count();
      const hasForm = await page.locator("form").count();
      const hasEmptyState = await page.locator('[data-testid=empty-state], .appkit-empty-state').count();
      const hasToolbar = await page.locator('[data-testid=listing-toolbar]').count();

      const ok =
        status < 400 &&
        main > 0 &&
        content > 0 &&
        !redirectedToLogin &&
        (role !== "admin" || !redirectedToUnauth); // admin should never see /unauthorized

      rec(`${role} ${path}: shell`, ok,
        `status=${status} main=${main} content=${content} url=${finalUrl}`);

      // Check for "New" button on list pages (not /new routes)
      if (!path.endsWith("/new") && !path.endsWith("/edit")) {
        const newBtn = page.locator(
          'a[href*="/new"], button:has-text("New"), button:has-text("Add"), button:has-text("Create")',
        );
        const newBtnCount = await newBtn.count();
        // soft — some pages are read-only (orders, bids, sessions, etc.)
        rec(`${role} ${path}: has table/form/content`, (hasTable + hasForm + hasEmptyState + hasToolbar) > 0,
          `table=${hasTable} form=${hasForm} empty=${hasEmptyState} toolbar=${hasToolbar} newBtn=${newBtnCount}`);
      }
    } catch (e) {
      rec(`${role} ${path}: shell`, false, e.message);
    }
    await page.close();
  }
}

export async function run() {
  await visitAs("seller", SELLER_PATHS);
  await visitAs("admin", ADMIN_PATHS);
  return results;
}
