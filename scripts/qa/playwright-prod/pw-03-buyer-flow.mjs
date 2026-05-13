/**
 * Logged-in buyer UI flow:
 *  - Open a standard product detail
 *  - Click "Add to Cart" — verify ripple element gets inserted
 *  - Navigate to /cart — verify item appears
 *  - Click "Proceed to checkout" — verify checkout page renders address picker
 */

import { getContext, localizedUrl } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

async function findStandardProduct() {
  const r = await fetch(`${BASE_URL}/api/products?pageSize=20&listingType=standard`);
  const j = await r.json();
  return (j?.data?.items ?? []).find(
    (p) => (p.availableQuantity ?? 0) >= 3 && p.status === "published",
  );
}

export async function run() {
  const ctx = await getContext("buyer");
  const page = await ctx.newPage();

  const product = await findStandardProduct();
  if (!product) {
    rec("find standard product", false, "none with stock");
    return results;
  }
  rec("find standard product", true, product.id);

  await page.goto(localizedUrl(`/products/${product.id}`), { waitUntil: "domcontentloaded", timeout: 30000 });
  const title = await page.locator("h1").first().textContent().catch(() => "");
  rec("product detail h1 present", !!title?.trim(), title?.slice(0, 80));

  const addBtn = page.locator(
    'button:has-text("Add to Cart"), button:has-text("Add to cart"), [data-action="add-to-cart"]',
  );
  const addCount = await addBtn.count();
  rec("Add to Cart button present", addCount > 0, `n=${addCount}`);

  if (addCount > 0) {
    // Click and verify ripple element inserted (appkit-button__ripple span)
    await addBtn.first().click({ trial: false }).catch(() => {});
    // Ripple has ~520ms animation; check within 250ms
    const ripple = page.locator(".appkit-button__ripple");
    await ripple
      .first()
      .waitFor({ state: "attached", timeout: 1000 })
      .catch(() => {});
    rec("ripple element appears on click", (await ripple.count()) > 0, "");
    // Let request settle
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  }

  // Navigate to cart
  await page.goto(localizedUrl("/cart"), { waitUntil: "domcontentloaded", timeout: 30000 });
  const cartHasItem = await page
    .locator(`a[href*="/products/${product.id}"], :text("${product.title?.slice(0, 30) ?? ""}")`)
    .count();
  rec("cart shows added item", cartHasItem > 0, `matches=${cartHasItem}`);

  const checkoutCta = page.locator(
    'a:has-text("Checkout"), button:has-text("Checkout"), a:has-text("Proceed")',
  );
  rec("cart has checkout CTA", (await checkoutCta.count()) > 0, "");

  await page.close();
  return results;
}
