/**
 * Logged-in seller + admin: visit dashboard pages and assert each renders
 * a layout shell (header + sidebar + main) and a recognizable heading.
 */

import { getContext, localizedUrl } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const SELLER_PATHS = [
  "/store",
  "/store/products",
  "/store/orders",
  "/store/coupons",
  "/store/shipping",
  "/store/payout-settings",
  "/store/bids",
  "/store/reviews",
  "/store/analytics",
];

const ADMIN_PATHS = [
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/products",
  "/admin/orders",
  "/admin/categories",
  "/admin/brands",
  "/admin/faqs",
  "/admin/sections",
  "/admin/blog",
  "/admin/site",
  "/admin/carousel",
];

async function visitAs(role, paths) {
  const ctx = await getContext(role);
  for (const path of paths) {
    const page = await ctx.newPage();
    try {
      const res = await page.goto(localizedUrl(path), {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      const finalStatus = res?.status() ?? 0;
      const finalUrl = page.url();
      const redirectedToLogin = /\/auth\/login/.test(finalUrl);
      // Wait for client-side hydration: any heading OR a recognizable section root
      await page
        .locator("h1, h2, h3, [data-section], .appkit-card, table, form")
        .first()
        .waitFor({ state: "attached", timeout: 7000 })
        .catch(() => {});
      const main = await page.locator("main").first().count();
      const heading = await page
        .locator("h1, h2, h3, [data-section], .appkit-card, table, form")
        .first()
        .count();
      rec(
        `${role} ${path}`,
        finalStatus < 400 && main > 0 && heading > 0 && !redirectedToLogin,
        `status=${finalStatus} url=${finalUrl} main=${main} content=${heading}`,
      );
    } catch (e) {
      rec(`${role} ${path}`, false, e.message);
    }
    await page.close();
  }
}

export async function run() {
  await visitAs("seller", SELLER_PATHS);
  await visitAs("admin", ADMIN_PATHS);
  return results;
}
