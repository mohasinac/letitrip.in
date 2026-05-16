/**
 * pw-22 — Admin moderation + power actions.
 *
 * Test groups:
 *  A — Admin users page: loads, table visible
 *  B — Admin stores page: loads, table visible, verify action present
 *  C — Admin bundles page: loads, table or empty state visible
 *  D — Admin dashboard: stat cards visible (renderAlerts wired)
 *  E — Admin dashboard: recent orders section visible (renderRecentActivity wired)
 */

import {
  getContext,
  localizedUrl,
  gotoAndWait,
  takeScreenshot,
  getCookieHeader,
} from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

async function countText(page, sel, text) {
  return page
    .locator(sel)
    .filter({ hasText: new RegExp(text, "i") })
    .count()
    .catch(() => 0);
}

export async function run() {
  const ctx = await getContext("admin");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Admin users page ──────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "admin-users";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/users"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      // Table should be visible
      const tableOrRows = await page
        .locator("table, [role='table'], [data-testid*='table']")
        .count()
        .catch(() => 0);
      rec(`${label}: users table visible`, tableOrRows > 0, `count=${tableOrRows}`);

      // Role filter or heading
      const heading = await countText(page, "h1, h2", "users");
      rec(`${label}: users heading`, heading > 0, `count=${heading}`);

      await takeScreenshot(page, "admin-users");
    } catch (e) {
      await takeScreenshot(page, "admin-users-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B — Admin stores page ─────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "admin-stores";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/stores"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      const tableOrRows = await page
        .locator("table, [role='table'], [data-testid*='table']")
        .count()
        .catch(() => 0);
      rec(`${label}: stores table visible`, tableOrRows > 0, `count=${tableOrRows}`);

      // Verify action should appear somewhere (button or badge)
      const verifyEl = await page
        .locator('button, [class*="badge"], span')
        .filter({ hasText: /verify|verified/i })
        .count()
        .catch(() => 0);
      rec(`${label}: verify action/badge visible`, verifyEl > 0, `count=${verifyEl}`);

      await takeScreenshot(page, "admin-stores");
    } catch (e) {
      await takeScreenshot(page, "admin-stores-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── C — Admin bundles page ────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "admin-bundles";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/bundles"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      // Either a table or empty state or "bundles" heading
      const content = await page
        .locator("table, [data-testid='empty-state'], h1, h2")
        .count()
        .catch(() => 0);
      rec(`${label}: content visible`, content > 0, `count=${content}`);

      await takeScreenshot(page, "admin-bundles");
    } catch (e) {
      await takeScreenshot(page, "admin-bundles-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── D — Admin dashboard stat cards ────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "admin-dashboard-stats";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/dashboard"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: dashboard loads`, status < 400 && !redirected, `status=${status}`);

      // Stat cards: Pending Orders / Pending Payouts / Pending Reviews / Active Coupons
      const pendingOrdersCard = await countText(page, "*", "Pending Orders");
      rec(`${label}: Pending Orders card`, pendingOrdersCard > 0, `count=${pendingOrdersCard}`);

      const pendingPayoutsCard = await countText(page, "*", "Pending Payouts");
      rec(`${label}: Pending Payouts card`, pendingPayoutsCard > 0, `count=${pendingPayoutsCard}`);

      const activeCouponsCard = await countText(page, "*", "Active Coupons");
      rec(`${label}: Active Coupons card`, activeCouponsCard > 0, `count=${activeCouponsCard}`);

      await takeScreenshot(page, "admin-dashboard-stats");
    } catch (e) {
      await takeScreenshot(page, "admin-dashboard-stats-fail").catch(() => {});
      rec(`${label}: dashboard loads`, false, e.message);
    }
    await page.close();
  }

  // ── E — Admin dashboard recent activity ───────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "admin-dashboard-activity";
    try {
      await gotoAndWait(page, localizedUrl("/admin/dashboard"));
      // Wait for async fetch to complete
      await page.waitForTimeout(3000);

      const recentOrders = await countText(page, "*", "Recent Orders");
      rec(`${label}: Recent Orders section appears`, recentOrders > 0, `count=${recentOrders}`);

      // Quick actions grid should have 8 links
      const quickLinks = await page
        .locator("a")
        .filter({ hasText: /users|categories|reviews|coupons|faqs|site settings|carousel|sections/i })
        .count()
        .catch(() => 0);
      rec(`${label}: quick action links visible`, quickLinks >= 4, `count=${quickLinks}`);

      await takeScreenshot(page, "admin-dashboard-activity");
    } catch (e) {
      await takeScreenshot(page, "admin-dashboard-activity-fail").catch(() => {});
      rec(`${label}: recent activity`, false, e.message);
    }
    await page.close();
  }

  await ctx.close();
  return results;
}
