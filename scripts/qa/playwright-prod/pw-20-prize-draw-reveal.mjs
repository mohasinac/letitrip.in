/**
 * pw-20 — Prize draw listing + reveal flow.
 *
 * Test groups:
 *  A — Prize draw listing page: /prize-draws loads, shows listings
 *  B — Prize draw detail page: product page for a prize-draw listing loads
 *  C — User orders page: /user/orders loads without crash
 *  D — API smoke: GET /api/products?listingType=prize-draw returns results
 */

import {
  getContext,
  localizedUrl,
  gotoAndWait,
  takeScreenshot,
  getCookieHeader,
  fetchFirstId,
} from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("buyer");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Prize draw listing page ───────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "prize-draws-listing";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/prize-draws"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      const heading = await page
        .locator("h1, h2")
        .filter({ hasText: /prize draw|draws/i })
        .count()
        .catch(() => 0);
      rec(`${label}: heading visible`, heading > 0, `count=${heading}`);

      await takeScreenshot(page, "prize-draws-listing");
    } catch (e) {
      await takeScreenshot(page, "prize-draws-listing-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B — Prize draw detail page ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "prize-draw-detail";
    try {
      const drawId = await fetchFirstId(
        `${BASE_URL}/api/products?listingType=prize-draw&status=published&pageSize=1`,
        cookieHeader,
      );

      if (!drawId) {
        rec(`${label}: draw product exists`, false, "No published prize-draw in seed data");
      } else {
        const { status, finalUrl } = await gotoAndWait(
          page,
          localizedUrl(`/prize-draws/${drawId}`),
        );
        const redirected = /\/auth\/login/.test(finalUrl);
        rec(`${label}: detail page loads`, status < 400 && !redirected, `status=${status}`);

        // Should show product title
        const titleEl = await page
          .locator("h1")
          .count()
          .catch(() => 0);
        rec(`${label}: product title visible`, titleEl > 0, `count=${titleEl}`);

        // Should show price or "Enter draw" CTA
        const cta = await page
          .locator('button, a')
          .filter({ hasText: /enter|buy|add to cart|₹/i })
          .count()
          .catch(() => 0);
        rec(`${label}: enter/buy CTA present`, cta > 0, `count=${cta}`);

        await takeScreenshot(page, "prize-draw-detail");
      }
    } catch (e) {
      await takeScreenshot(page, "prize-draw-detail-fail").catch(() => {});
      rec(`${label}: detail page loads`, false, e.message);
    }
    await page.close();
  }

  // ── C — User orders page ──────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "user-orders";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/user/orders"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      const heading = await page
        .locator("h1, h2")
        .filter({ hasText: /orders?/i })
        .count()
        .catch(() => 0);
      rec(`${label}: orders heading visible`, heading > 0, `count=${heading}`);
    } catch (e) {
      await takeScreenshot(page, "user-orders-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── D — API: prize-draw products ──────────────────────────────────────────
  {
    const label = "prize-draw-api";
    try {
      const resp = await fetch(
        `${BASE_URL}/api/products?listingType=prize-draw&pageSize=5`,
        { headers: { Cookie: cookieHeader } },
      );
      rec(`${label}: GET /api/products?listingType=prize-draw → 200`, resp.status === 200, `status=${resp.status}`);

      const data = await resp.json().catch(() => null);
      const hasItems = Array.isArray(data?.data?.items);
      rec(`${label}: response has items array`, hasItems, `keys=${Object.keys(data?.data ?? {}).join(",")}`);
    } catch (e) {
      rec(`${label}: GET prize-draw products`, false, e.message);
    }
  }

  await ctx.close();
  return results;
}
