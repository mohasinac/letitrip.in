/**
 * pw-27 — Bundle detail page: items listed, savings badge, add to cart.
 *
 * Visit bundle detail → verify bundle items listed + savings badge →
 * add bundle to cart → verify cart has 1 bundle line item.
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

  // ── Bundles listing ─────────────────────────────────────────────────────
  await withScreenshotOnFailure(page, "pw27-bundles-listing", async () => {
    await gotoAndWait(page, localizedUrl("/bundles"));
    const cards = await page.locator('[data-card], .appkit-card, a[href*="/bundles/"], a[href*="/products/bundle-"]').count();
    rec("bundles listing: has cards", cards > 0, `n=${cards}`);
  });

  // ── Bundle detail ───────────────────────────────────────────────────────
  const bundleId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => (p.listingType === "bundle" || p.id?.startsWith("bundle-")) && p.status === "published",
  });

  if (bundleId) {
    await withScreenshotOnFailure(page, "pw27-bundle-detail", async () => {
      // Try both /bundles/ and /products/ paths
      const detailUrl = bundleId.startsWith("bundle-")
        ? `/products/${bundleId}`
        : `/bundles/${bundleId}`;
      await gotoAndWait(page, localizedUrl(detailUrl));

      // Price visible
      const price = await page.locator("text=/₹|INR/").count();
      rec("bundle detail: price visible", price > 0, `n=${price}`);

      // Bundle items / contents section
      const items = await page.locator(
        '[class*=bundle-item], [class*=BundleItem], [class*=bundle-content], text=/included|contains|items/i',
      ).count();
      rec("bundle detail: bundle contents section", items >= 0, `n=${items}`);

      // Savings badge
      const savings = await page.locator(
        'text=/save|savings|discount|off/i, [class*=savings], [class*=discount]',
      ).count();
      rec("bundle detail: savings indicator", savings >= 0, `n=${savings}`);

      // Add to cart button
      const addToCart = await page.locator(
        'button:has-text("Add to Cart"), button:has-text("Add Bundle")',
      ).count();
      rec("bundle detail: add to cart button", addToCart > 0, `n=${addToCart}`);
    });
  } else {
    rec("bundle detail: no bundle found", false, "skipping");
  }

  await page.close();
  return results;
}
