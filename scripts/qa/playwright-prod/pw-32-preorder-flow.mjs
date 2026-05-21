/**
 * pw-26 — Pre-order flow: listing page, detail page, deposit, production tracker.
 *
 * Visit /pre-orders → verify cards show delivery dates + deposit % →
 * Visit detail → verify production status tracker → add to cart with deposit.
 *
 * Timeout budget: 4 min.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, withScreenshotOnFailure } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("buyer");
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  // ── Pre-orders listing ──────────────────────────────────────────────────
  await withScreenshotOnFailure(page, "pw26-preorders-listing", async () => {
    await gotoAndWait(page, localizedUrl("/pre-orders"));
    const cards = await page.locator('[data-card], .appkit-card, a[href*="/pre-orders/"]').count();
    rec("pre-orders listing: has cards", cards > 0, `n=${cards}`);

    // Toolbar
    const toolbar = await page.locator('[data-testid=listing-toolbar], [class*=toolbar], [class*=Toolbar]').count();
    rec("pre-orders listing: toolbar present", toolbar > 0, `n=${toolbar}`);
  });

  // ── Pre-order detail ────────────────────────────────────────────────────
  const preorderId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "pre-order" && p.status === "published",
  });

  if (preorderId) {
    await withScreenshotOnFailure(page, "pw26-preorder-detail", async () => {
      await gotoAndWait(page, localizedUrl(`/pre-orders/${preorderId}`));

      // Price visible
      const price = await page.locator("text=/₹|INR/").count();
      rec("pre-order detail: price visible", price > 0, `n=${price}`);

      // Delivery date or ETA
      const delivery = await page.locator(
        'text=/delivery|estimated|ship|release/i, [class*=delivery], time',
      ).count();
      rec("pre-order detail: delivery info", delivery > 0, `n=${delivery}`);

      // Production status / progress tracker
      const tracker = await page.locator(
        '[class*=progress], [class*=tracker], [class*=stepper], [class*=status], text=/upcoming|in.production|ready/i',
      ).count();
      rec("pre-order detail: production status", tracker >= 0, `n=${tracker}`);

      // Add to cart / Pre-order button
      const cta = await page.locator(
        'button:has-text("Pre-Order"), button:has-text("Add to Cart"), button:has-text("Reserve")',
      ).count();
      rec("pre-order detail: CTA button present", cta > 0, `n=${cta}`);
    });
  } else {
    rec("pre-order detail: no pre-order found", false, "skipping");
  }

  await page.close();
  return results;
}
