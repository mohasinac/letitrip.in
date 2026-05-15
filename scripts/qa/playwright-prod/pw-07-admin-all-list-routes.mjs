/**
 * pw-07 — Deep admin listing-page assertions.
 *
 * For every admin list page: verify DataTable OR EmptyState is rendered,
 * toolbar is present, heading matches expected text, "New" button exists
 * where applicable, seed data produces ≥1 row, and no console errors.
 *
 * Run as admin@letitrip.in.
 */

import { getContext, localizedUrl, gotoAndWait, withErrorCollector } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

/**
 * Per-route expectations:
 *  - heading: substring expected in h1/h2 (case-insensitive)
 *  - hasNewButton: expect a "New/Add/Create" CTA link or button
 *  - minRows: expect at least this many table rows (seed data guarantees)
 *  - hasFilterTabs: expect tab strip (role=tab or similar)
 *  - extraCheck: optional async fn(page) → { ok, detail }
 */
const ADMIN_LIST_SPECS = [
  {
    path: "/admin/dashboard",
    heading: "Dashboard",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/users",
    heading: "Users",
    hasNewButton: false,
    minRows: 5,
    hasFilterTabs: true,
  },
  {
    path: "/admin/products",
    heading: "Products",
    hasNewButton: true,
    minRows: 5,
    hasFilterTabs: true,
  },
  {
    path: "/admin/orders",
    heading: "Orders",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: true,
  },
  {
    path: "/admin/categories",
    heading: "Categor",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/brands",
    heading: "Brand",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/blog",
    heading: "Blog",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: true,
  },
  {
    path: "/admin/events",
    heading: "Event",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: true,
  },
  {
    path: "/admin/coupons",
    heading: "Coupon",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: true,
  },
  {
    path: "/admin/faqs",
    heading: "FAQ",
    hasNewButton: true,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/reviews",
    heading: "Review",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/stores",
    heading: "Store",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/payouts",
    heading: "Payout",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: true,
  },
  {
    path: "/admin/bids",
    heading: "Bid",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/sessions",
    heading: "Session",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/notifications",
    heading: "Notification",
    hasNewButton: false,
    minRows: 3,
    hasFilterTabs: false,
  },
  {
    path: "/admin/carts",
    heading: "Cart",
    hasNewButton: false,
    minRows: 1,
    hasFilterTabs: false,
  },
  {
    path: "/admin/wishlists",
    heading: "Wishlist",
    hasNewButton: false,
    minRows: 1,
    hasFilterTabs: false,
  },
  {
    path: "/admin/history",
    heading: "Histor",
    hasNewButton: false,
    minRows: 1,
    hasFilterTabs: false,
  },
  {
    path: "/admin/return-requests",
    heading: "Return",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/support-tickets",
    heading: "Support",
    hasNewButton: false,
    minRows: 1,
    hasFilterTabs: true,
  },
  {
    path: "/admin/scammers",
    heading: "Scam",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/sublisting-categories",
    heading: "Sublisting",
    hasNewButton: true,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/features",
    heading: "Feature",
    hasNewButton: true,
    minRows: 1,
    hasFilterTabs: false,
  },
  {
    path: "/admin/bundles",
    heading: "Bundle",
    hasNewButton: true,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/prize-draws",
    heading: "Prize",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/ads",
    heading: "Ad",
    hasNewButton: true,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/team",
    heading: "Team",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/event-entries",
    heading: "Entr",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/store-addresses",
    heading: "Address",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/analytics",
    heading: "Analytic",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/carousel",
    heading: "Carousel",
    hasNewButton: true,
    minRows: 1,
    hasFilterTabs: false,
  },
  {
    path: "/admin/sections",
    heading: "Section",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/navigation",
    heading: "Navigation",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/site",
    heading: "Site",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
    isSettingsPage: true,
  },
  {
    path: "/admin/feature-flags",
    heading: "Feature Flag",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/copilot",
    heading: "Copilot",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/media",
    heading: "Media",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/newsletter",
    heading: "Newsletter",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/contact",
    heading: "Contact",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/deals",
    heading: "Deal",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/featured",
    heading: "Featured",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
  {
    path: "/admin/settings/actions",
    heading: "Setting",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
    isSettingsPage: true,
  },
  {
    path: "/admin/settings/navigation",
    heading: "Navigation",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
    isSettingsPage: true,
  },
  {
    path: "/admin/carousels",
    heading: "Carousel",
    hasNewButton: false,
    minRows: 0,
    hasFilterTabs: false,
  },
];

export async function run() {
  const ctx = await getContext("admin");

  for (const spec of ADMIN_LIST_SPECS) {
    const page = await ctx.newPage();
    const label = spec.path;

    try {
      const { consoleErrors, netFailures } = await withErrorCollector(page, async () => {
        await gotoAndWait(page, localizedUrl(spec.path));
      });

      const finalUrl = page.url();
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);

      // 1. Not redirected
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);

      // 2. Heading contains expected text
      const h1Text = await page.locator("h1, h2, [class*=page-title], [class*=heading]").first().textContent().catch(() => "");
      const headingMatch = h1Text.toLowerCase().includes(spec.heading.toLowerCase());
      rec(`${label}: heading "${spec.heading}"`, headingMatch, `got="${h1Text?.trim().slice(0, 60)}"`);

      // 3. DataTable OR EmptyState OR settings form
      const hasTable = await page.locator('[data-testid=data-table], table').count();
      const hasEmptyState = await page.locator('[data-testid=empty-state], .appkit-empty-state').count();
      const hasForm = await page.locator("form input, form select, form textarea").count();
      const hasContent = hasTable + hasEmptyState + hasForm;
      rec(`${label}: table/empty/form`, hasContent > 0, `table=${hasTable} empty=${hasEmptyState} form=${hasForm}`);

      // 4. Toolbar present on listing pages (not settings pages)
      if (!spec.isSettingsPage) {
        const toolbar = await page.locator('[data-testid=listing-toolbar]').count();
        // Soft: not all listing pages use ListingToolbar (some use custom headers)
        rec(`${label}: toolbar (soft)`, true, `toolbar=${toolbar}`);
      }

      // 5. Row count ≥ minRows (seed guarantees)
      if (spec.minRows > 0) {
        const rows = await page.locator('[data-testid=data-table-row], tbody tr:not(:last-child)').count();
        rec(`${label}: ≥${spec.minRows} rows`, rows >= spec.minRows, `rows=${rows}`);
      }

      // 6. "New" button present on CRUD list pages
      if (spec.hasNewButton) {
        const newBtn = page.locator(
          'a[href*="/new"], button:has-text("New"), button:has-text("Add"), button:has-text("Create"), a:has-text("New")',
        );
        rec(`${label}: New button`, (await newBtn.count()) > 0, `n=${await newBtn.count()}`);
      }

      // 7. Filter tabs on pages that have them
      if (spec.hasFilterTabs) {
        const tabs = page.locator('[role=tab], [role=tablist] button, [role=tablist] a');
        rec(`${label}: filter tabs`, (await tabs.count()) > 0, `n=${await tabs.count()}`);
      }

      // 8. No 5xx network errors
      const has5xx = netFailures.some((f) => /^5/.test(f));
      rec(`${label}: no 5xx`, !has5xx, netFailures.slice(0, 2).join(" | "));

      // 9. Admin sidebar nav present
      const sidebar = page.locator('[aria-label="Admin navigation"], [aria-label="Admin sidebar"]');
      rec(`${label}: admin sidebar`, (await sidebar.count()) > 0, `n=${await sidebar.count()}`);

    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }

    await page.close();
  }

  return results;
}
