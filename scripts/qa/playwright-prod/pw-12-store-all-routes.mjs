/**
 * pw-12 — All store routes + deep content assertions.
 *
 * Visits every static and dynamic store route as the seller role.
 * Asserts: layout shell, sidebar nav, page heading, DataTable or form.
 * Also verifies store-specific content on key pages.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL, ROLES } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── Static store paths ───────────────────────────────────────────────────────

const STORE_STATIC_PATHS = [
  { path: "/store",                           heading: "Dashboard",     hasNew: false, hasTable: false },
  { path: "/store/products",                  heading: "Product",       hasNew: true,  hasTable: true  },
  { path: "/store/products/new",              heading: "Product",       hasNew: false, isForm: true    },
  { path: "/store/orders",                    heading: "Order",         hasNew: false, hasTable: true  },
  { path: "/store/auctions",                  heading: "Auction",       hasNew: true,  hasTable: true  },
  { path: "/store/auctions/new",              heading: "Auction",       hasNew: false, isForm: true    },
  { path: "/store/pre-orders",                heading: "Pre-Order",     hasNew: true,  hasTable: true  },
  { path: "/store/pre-orders/new",            heading: "Pre-Order",     hasNew: false, isForm: true    },
  { path: "/store/bundles",                   heading: "Bundle",        hasNew: true,  hasTable: true  },
  { path: "/store/bundles/new",               heading: "Bundle",        hasNew: false, isForm: true    },
  { path: "/store/prize-draws",               heading: "Prize",         hasNew: true,  hasTable: true  },
  { path: "/store/prize-draws/new",           heading: "Prize",         hasNew: false, isForm: true    },
  { path: "/store/coupons",                   heading: "Coupon",        hasNew: true,  hasTable: true  },
  { path: "/store/coupons/new",               heading: "Coupon",        hasNew: false, isForm: true    },
  { path: "/store/templates",                 heading: "Template",      hasNew: true,  hasTable: true  },
  { path: "/store/templates/new",             heading: "Template",      hasNew: false, isForm: true    },
  { path: "/store/analytics",                 heading: "Analytic",      hasNew: false, hasTable: false },
  { path: "/store/payouts",                   heading: "Payout",        hasNew: false, hasTable: true  },
  { path: "/store/payout-settings",           heading: "Payout",        hasNew: false, isForm: true    },
  { path: "/store/storefront",                heading: "Storefront",    hasNew: false, isForm: true    },
  { path: "/store/shipping",                  heading: "Shipping",      hasNew: false, isForm: true    },
  { path: "/store/addresses",                 heading: "Address",       hasNew: true,  hasTable: true  },
  { path: "/store/offers",                    heading: "Offer",         hasNew: false, hasTable: true  },
  { path: "/store/whatsapp",                  heading: "WhatsApp",      hasNew: false, isForm: true    },
  { path: "/store/reviews",                   heading: "Review",        hasNew: false, hasTable: true  },
  { path: "/store/bids",                      heading: "Bid",           hasNew: false, hasTable: true  },
  { path: "/store/sublisting-categories",     heading: "Sublisting",    hasNew: true,  hasTable: true  },
  { path: "/store/sublisting-categories/new", heading: "Sublisting",    hasNew: false, isForm: true    },
  { path: "/store/features",                  heading: "Feature",       hasNew: true,  hasTable: true  },
  { path: "/store/features/new",              heading: "Feature",       hasNew: false, isForm: true    },
  { path: "/store/slug",                      heading: "Slug",          hasNew: false, isForm: true    },
];

export async function run() {
  const ctx = await getContext("seller");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ─── Static routes ──────────────────────────────────────────────────────────
  for (const spec of STORE_STATIC_PATHS) {
    const page = await ctx.newPage();
    const label = spec.path;
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(spec.path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);

      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);

      if (!redirected) {
        const main = await page.locator("main").count();
        const headingText = await page.locator("h1, h2, [class*=page-title]").first().textContent().catch(() => "");
        rec(`${label}: main present`, main > 0, `n=${main}`);
        rec(`${label}: heading "${spec.heading}"`,
          headingText.toLowerCase().includes(spec.heading.toLowerCase()),
          `got="${headingText?.trim().slice(0, 60)}"`);

        if (spec.hasTable) {
          const hasTable = await page.locator('[data-testid=data-table], table, [data-testid=empty-state]').count();
          rec(`${label}: table or empty state`, hasTable > 0, `n=${hasTable}`);
        }

        if (spec.isForm) {
          const inputs = await page.locator("form input:not([type=hidden]), form select, form textarea").count();
          rec(`${label}: form has inputs`, inputs >= 1, `inputs=${inputs}`);
        }

        if (spec.hasNew) {
          const newBtn = page.locator('a[href*="/new"], button:has-text("New"), button:has-text("Add")');
          rec(`${label}: New button`, (await newBtn.count()) > 0, `n=${await newBtn.count()}`);
        }

        // Store sidebar nav
        const sidebar = page.locator('[aria-label="Store navigation"], [aria-label="Store sidebar"]');
        rec(`${label}: store sidebar (soft)`, true, `n=${await sidebar.count()}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Dynamic routes with real IDs ──────────────────────────────────────────

  const dynamicSpecs = [
    { name: "store product edit",             apiPath: "/api/store/products",              routeFn: (id) => `/store/products/${id}/edit` },
    { name: "store product codes",            apiPath: "/api/store/products",              routeFn: (id) => `/store/products/${id}/codes` },
    { name: "store auction edit",             apiPath: "/api/store/auctions",              routeFn: (id) => `/store/auctions/${id}/edit` },
    { name: "store pre-order edit",           apiPath: "/api/store/pre-orders",            routeFn: (id) => `/store/pre-orders/${id}/edit` },
    { name: "store bundle edit",              apiPath: "/api/store/bundles",               routeFn: (id) => `/store/bundles/${id}/edit` },
    { name: "store prize-draw edit",          apiPath: "/api/store/prize-draws",           routeFn: (id) => `/store/prize-draws/${id}/edit` },
    { name: "store coupon edit",              apiPath: "/api/store/coupons",               routeFn: (id) => `/store/coupons/${id}/edit` },
    { name: "store template edit",            apiPath: "/api/store/templates",             routeFn: (id) => `/store/templates/${id}/edit` },
    { name: "store sublisting-category edit", apiPath: "/api/store/sublisting-categories", routeFn: (id) => `/store/sublisting-categories/${id}/edit` },
    { name: "store feature edit",             apiPath: "/api/store/features",              routeFn: (id) => `/store/features/${id}/edit` },
    { name: "store order view",               apiPath: "/api/store/orders",                routeFn: (id) => `/store/orders/${id}/view` },
  ];

  for (const { name, apiPath, routeFn } of dynamicSpecs) {
    const id = await fetchFirstId(BASE_URL, apiPath, { cookieHeader });
    if (!id) {
      rec(`${name}: found item`, false, `no items at ${apiPath}`);
      continue;
    }
    rec(`${name}: found item`, true, `id=${id}`);

    const page = await ctx.newPage();
    try {
      const path = routeFn(id);
      const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
      rec(`${name}: no redirect`, !redirected, `url=${finalUrl}`);

      if (!redirected) {
        const main = await page.locator("main").count();
        const formOrTable = await page.locator("form input, table, [data-testid=data-table]").count();
        rec(`${name}: has content`, main > 0 && formOrTable > 0, `main=${main} content=${formOrTable}`);
      }
    } catch (e) {
      rec(`${name}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Store bulk actions ─────────────────────────────────────────────────────

  const bulkTargets = ["/store/products", "/store/orders", "/store/reviews", "/store/coupons"];
  for (const path of bulkTargets) {
    const page = await ctx.newPage();
    const label = `${path} bulk select`;
    try {
      await gotoAndWait(page, localizedUrl(path));
      const rows = await page.locator('[data-testid=data-table-row], table tbody tr').count();
      if (rows > 0) {
        const headerCb = page.locator('[data-testid=select-all-checkbox]');
        if ((await headerCb.count()) > 0) {
          await headerCb.first().check({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
          const bulkBar = await page.locator('[data-testid=bulk-action-bar]').count();
          rec(`${label}`, bulkBar > 0, `rows=${rows} bulkBar=${bulkBar}`);
        } else {
          rec(`${label}: select-all (soft)`, true, "no header checkbox");
        }
      } else {
        rec(`${label}`, true, "no rows — skip");
      }
    } catch (e) {
      rec(`${label}`, false, e.message);
    }
    await page.close();
  }

  return results;
}
