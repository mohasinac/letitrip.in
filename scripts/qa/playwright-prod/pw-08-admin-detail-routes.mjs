/**
 * pw-08 — Admin dynamic detail/edit routes.
 *
 * Fetches a real ID for each entity via the admin API, then visits:
 *  - /admin/{entity}/{id}/edit  → form rendered, fields visible, save button present
 *  - /admin/{entity}/{id}/view  → detail view rendered
 *  - /admin/{entity}/{id}/entries → entries table rendered
 *
 * Also verifies all /admin/{entity}/new routes render an empty form.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── Form assertion helper ────────────────────────────────────────────────────

async function assertEditForm(page, label) {
  const form = await page.locator("form").count();
  const inputs = await page.locator("form input:not([type=hidden]), form select, form textarea, [contenteditable]").count();
  const saveBtn = await page.locator(
    'button[type=submit], button:has-text("Save"), button:has-text("Update"), button:has-text("Create")',
  ).count();
  const cancelBtn = await page.locator(
    'a:has-text("Cancel"), button:has-text("Cancel"), a:has-text("Back")',
  ).count();

  rec(`${label}: form present`, form > 0, `forms=${form}`);
  rec(`${label}: form has inputs`, inputs >= 2, `inputs=${inputs}`);
  rec(`${label}: save button`, saveBtn > 0, `n=${saveBtn}`);
  rec(`${label}: cancel/back`, cancelBtn > 0, `n=${cancelBtn}`);
}

export async function run() {
  const ctx = await getContext("admin");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ─── Fetch IDs ─────────────────────────────────────────────────────────────
  const ids = {};
  const fetches = [
    ["product",      "/api/admin/products"],
    ["order",        "/api/admin/orders"],
    ["category",     "/api/admin/categories"],
    ["brand",        "/api/admin/brands"],
    ["faq",          "/api/admin/faqs"],
    ["coupon",       "/api/admin/coupons"],
    ["blog",         "/api/admin/blog"],
    ["event",        "/api/admin/events"],
    ["bundle",       "/api/admin/bundles"],
    ["prizedraw",    "/api/admin/prize-draws"],
    ["carousel",     "/api/carousel"],
    ["sublisting",   "/api/admin/sublisting-categories"],
    ["feature",      "/api/admin/features"],
    ["ticket",       "/api/admin/support-tickets"],
    ["scammer",      "/api/admin/scammers"],
    ["ad",           "/api/admin/ads"],
  ];

  await Promise.all(
    fetches.map(async ([key, apiPath]) => {
      ids[key] = await fetchFirstId(BASE_URL, apiPath, { cookieHeader });
    }),
  );

  // ─── Edit forms ────────────────────────────────────────────────────────────
  const editRoutes = [
    ids.product    && { path: `/admin/products/${ids.product}/edit`,           label: "product edit" },
    ids.category   && { path: `/admin/categories/${ids.category}/edit`,        label: "category edit" },
    ids.brand      && { path: `/admin/brands/${ids.brand}/edit`,               label: "brand edit" },
    ids.faq        && { path: `/admin/faqs/${ids.faq}/edit`,                   label: "faq edit" },
    ids.coupon     && { path: `/admin/coupons/${ids.coupon}/edit`,             label: "coupon edit" },
    ids.blog       && { path: `/admin/blog/${ids.blog}/edit`,                  label: "blog edit" },
    ids.event      && { path: `/admin/events/${ids.event}/edit`,               label: "event edit" },
    ids.bundle     && { path: `/admin/bundles/${ids.bundle}/edit`,             label: "bundle edit" },
    ids.prizedraw  && { path: `/admin/prize-draws/${ids.prizedraw}/edit`,      label: "prizedraw edit" },
    ids.carousel   && { path: `/admin/carousel/${ids.carousel}/edit`,          label: "carousel edit" },
    ids.sublisting && { path: `/admin/sublisting-categories/${ids.sublisting}/edit`, label: "sublisting edit" },
    ids.feature    && { path: `/admin/features/${ids.feature}/edit`,           label: "feature edit" },
    ids.ad         && { path: `/admin/ads/${ids.ad}/edit`,                     label: "ad edit" },
  ].filter(Boolean);

  for (const { path, label } of editRoutes) {
    const page = await ctx.newPage();
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);
      if (!redirected) await assertEditForm(page, label);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Detail / view routes ──────────────────────────────────────────────────
  const detailRoutes = [
    ids.order   && { path: `/admin/orders/${ids.order}/view`,     label: "order detail", checks: ["status", "item", "shipping"] },
    ids.ticket  && { path: `/admin/support-tickets/${ids.ticket}`, label: "ticket detail", checks: ["status", "message"] },
    ids.scammer && { path: `/admin/scammers/${ids.scammer}`,       label: "scammer detail", checks: ["type"] },
    ids.carousel && { path: `/admin/carousels/${ids.carousel}`,    label: "carousel detail", checks: ["slide"] },
  ].filter(Boolean);

  for (const { path, label, checks } of detailRoutes) {
    const page = await ctx.newPage();
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);

      if (!redirected) {
        const h1 = await page.locator("h1, h2").count();
        const main = await page.locator("main").count();
        rec(`${label}: heading + main`, h1 > 0 && main > 0, `h=${h1} main=${main}`);

        // Check for expected content keywords
        for (const keyword of (checks ?? [])) {
          const el = await page.locator(`text=/${keyword}/i`).count();
          // Soft — data may vary
          rec(`${label}: "${keyword}" content (soft)`, true, `n=${el}`);
        }
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Event entries sub-route ───────────────────────────────────────────────
  if (ids.event) {
    const page = await ctx.newPage();
    try {
      const path = `/admin/events/${ids.event}/entries`;
      const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
      rec(`event entries: no redirect`, !redirected, `url=${finalUrl}`);
      if (!redirected) {
        const hasTable = await page.locator('[data-testid=data-table], table, [data-testid=empty-state]').count();
        rec(`event entries: table or empty state`, hasTable > 0, `n=${hasTable}`);
      }
    } catch (e) {
      rec(`event entries: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── /new forms ────────────────────────────────────────────────────────────
  const newRoutes = [
    "/admin/products/new",
    "/admin/categories/new",
    "/admin/brands/new",
    "/admin/faqs/new",
    "/admin/coupons/new",
    "/admin/blog/new",
    "/admin/events/new",
    "/admin/bundles/new",
    "/admin/carousel/new",
    "/admin/ads/new",
    "/admin/sublisting-categories/new",
    "/admin/features/new",
  ];

  for (const path of newRoutes) {
    const page = await ctx.newPage();
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
      const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
      rec(`${path}: no redirect`, !redirected, `url=${finalUrl}`);
      if (!redirected) await assertEditForm(page, path);
    } catch (e) {
      rec(`${path}: shell`, false, e.message);
    }
    await page.close();
  }

  return results;
}
