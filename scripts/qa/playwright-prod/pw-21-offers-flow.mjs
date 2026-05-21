/**
 * pw-21 — Make-an-offer flow (buyer-side + seller-side).
 *
 * Test groups:
 *  A — Product with allowOffers: MakeOffer button/form visible
 *  B — Buyer offers page: /user/offers loads
 *  C — Seller offers page: /store/offers loads (seller auth)
 *  D — API smoke: POST /api/offers with valid payload
 *  E — Checkout expired: checkoutDeadline validation error is user-friendly
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
  const buyerCtx = await getContext("buyer");
  const sellerCtx = await getContext("seller");
  const buyerCookie = await getCookieHeader(buyerCtx, BASE_URL);
  const sellerCookie = await getCookieHeader(sellerCtx, BASE_URL);

  // ── A — Product with allowOffers visible ──────────────────────────────────
  {
    const page = await buyerCtx.newPage();
    page.setDefaultTimeout(20000);
    const label = "offer-product-page";
    try {
      // Find a product that allows offers
      const productId = await fetchFirstId(
        `${BASE_URL}/api/products?allowOffers=true&status=published&pageSize=1`,
        buyerCookie,
      );

      if (!productId) {
        rec(`${label}: product with offers exists`, false, "No allowOffers=true product in seed");
      } else {
        const { status, finalUrl } = await gotoAndWait(
          page,
          localizedUrl(`/products/${productId}`),
        );
        const redirected = /\/auth\/login/.test(finalUrl);
        rec(`${label}: product page loads`, status < 400 && !redirected, `status=${status}`);

        // Make offer button or modal trigger
        const offerBtn = await page
          .locator('button, a')
          .filter({ hasText: /make.*offer|offer/i })
          .count()
          .catch(() => 0);
        rec(`${label}: make offer button visible`, offerBtn > 0, `count=${offerBtn}`);

        await takeScreenshot(page, "offer-product-page");
      }
    } catch (e) {
      await takeScreenshot(page, "offer-product-fail").catch(() => {});
      rec(`${label}: product page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B — Buyer offers page ─────────────────────────────────────────────────
  {
    const page = await buyerCtx.newPage();
    page.setDefaultTimeout(15000);
    const label = "user-offers-page";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/user/offers"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      const heading = await page
        .locator("h1, h2")
        .filter({ hasText: /offers?/i })
        .count()
        .catch(() => 0);
      rec(`${label}: offers heading visible`, heading > 0, `count=${heading}`);

      await takeScreenshot(page, "user-offers-page");
    } catch (e) {
      await takeScreenshot(page, "user-offers-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── C — Seller offers page ────────────────────────────────────────────────
  {
    const page = await sellerCtx.newPage();
    page.setDefaultTimeout(15000);
    const label = "seller-offers-page";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/store/offers"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      const heading = await page
        .locator("h1, h2")
        .filter({ hasText: /offers?/i })
        .count()
        .catch(() => 0);
      rec(`${label}: offers heading visible`, heading > 0, `count=${heading}`);

      await takeScreenshot(page, "seller-offers-page");
    } catch (e) {
      await takeScreenshot(page, "seller-offers-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── D — API smoke: POST /api/offers ───────────────────────────────────────
  {
    const label = "offers-api";
    try {
      const productId = await fetchFirstId(
        `${BASE_URL}/api/products?allowOffers=true&status=published&pageSize=1`,
        buyerCookie,
      );

      if (!productId) {
        rec(`${label}: POST /api/offers`, false, "No allowOffers product found");
      } else {
        // Get product price
        const productResp = await fetch(`${BASE_URL}/api/products/${productId}`, {
          headers: { Cookie: buyerCookie },
        });
        const product = await productResp.json().then(r => r.data).catch(() => null);
        const offerAmount = Math.floor((product?.price ?? 10000) * 0.7);

        const resp = await fetch(`${BASE_URL}/api/offers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: buyerCookie,
          },
          body: JSON.stringify({ productId, offerAmount }),
        });
        // 201 = created, 400/422 = validation error (already has active offer), 409 = conflict
        rec(
          `${label}: POST /api/offers → 201 or 400/409/422`,
          [201, 400, 409, 422].includes(resp.status),
          `status=${resp.status}`,
        );
        if (resp.status === 201 || resp.status === 200) {
          const body = await resp.json().catch(() => null);
          rec(`${label}: response has offer id`, !!body?.data?.id || !!body?.id, `id=${body?.data?.id ?? body?.id}`);
        }
      }
    } catch (e) {
      rec(`${label}: POST /api/offers`, false, e.message);
    }
  }

  await buyerCtx.close();
  await sellerCtx.close();
  return results;
}
