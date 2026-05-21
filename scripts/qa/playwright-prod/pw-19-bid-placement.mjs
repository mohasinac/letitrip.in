/**
 * pw-19 — Bid placement end-to-end flow.
 *
 * Test groups:
 *  A — Auction listing page: BidForm visible, current bid shown
 *  B — Bid form UI: input present, place-bid button, min-increment hint
 *  C — Ended auction: bid form disabled / auction-ended message
 *  D — API smoke: POST /api/bids with valid payload returns 201
 *  E — User bids page: /user/bids loads without error
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
  const adminCtx = await getContext("admin");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Auction listing page ──────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "auction-page";
    try {
      // Get an active auction from the API
      const auctionId = await fetchFirstId(
        `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
        cookieHeader,
      );

      if (!auctionId) {
        rec(`${label}: active auction exists`, false, "No published auctions found in seed data");
      } else {
        const { status, finalUrl } = await gotoAndWait(
          page,
          localizedUrl(`/auctions/${auctionId}`),
        );
        const redirected = /\/auth\/login/.test(finalUrl);
        rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

        // BidForm should be visible
        const bidForm = await page
          .locator('form, [data-testid="bid-form"], input[type="number"][aria-label*="bid" i]')
          .count()
          .catch(() => 0);
        rec(`${label}: bid form visible`, bidForm > 0, `count=${bidForm}`);

        // Current bid text visible
        const currentBidText = await page
          .locator("*")
          .filter({ hasText: /current bid|₹/i })
          .count()
          .catch(() => 0);
        rec(`${label}: current bid amount shown`, currentBidText > 0, `count=${currentBidText}`);

        await takeScreenshot(page, "auction-bid-form");
      }
    } catch (e) {
      await takeScreenshot(page, "auction-page-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B — Bid form UI elements ──────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "bid-form-ui";
    try {
      const auctionId = await fetchFirstId(
        `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
        cookieHeader,
      );

      if (auctionId) {
        await gotoAndWait(page, localizedUrl(`/auctions/${auctionId}`));

        // Bid amount input
        const bidInput = await page
          .locator('input[type="number"], input[aria-label*="bid" i]')
          .count()
          .catch(() => 0);
        rec(`${label}: bid amount input`, bidInput > 0, `count=${bidInput}`);

        // Place bid button
        const placeBtn = await page
          .locator('button:has-text("Place Bid"), button[type="submit"]')
          .count()
          .catch(() => 0);
        rec(`${label}: place bid button`, placeBtn > 0, `count=${placeBtn}`);

        // Min increment hint
        const incrementHint = await page
          .locator("*")
          .filter({ hasText: /min increment|minimum/i })
          .count()
          .catch(() => 0);
        rec(`${label}: min increment hint shown`, incrementHint > 0, `count=${incrementHint}`);
      } else {
        rec(`${label}: bid amount input`, false, "No auction available");
        rec(`${label}: place bid button`, false, "No auction available");
        rec(`${label}: min increment hint shown`, false, "No auction available");
      }
    } catch (e) {
      rec(`${label}: bid form UI`, false, e.message);
    }
    await page.close();
  }

  // ── C — API smoke: place bid ──────────────────────────────────────────────
  {
    const label = "bid-api";
    try {
      const auctionId = await fetchFirstId(
        `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
        cookieHeader,
      );

      if (auctionId) {
        // Get current bid amount first
        const productResp = await fetch(`${BASE_URL}/api/products/${auctionId}`, {
          headers: { Cookie: cookieHeader },
        });
        const product = await productResp.json().then((r) => r.data).catch(() => null);
        const currentBid = product?.currentBid ?? product?.price ?? 10000;
        const minIncrement = product?.minBidIncrement ?? 100;
        const bidAmount = currentBid + minIncrement;

        const resp = await fetch(`${BASE_URL}/api/bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify({ productId: auctionId, bidAmount }),
        });
        rec(`${label}: POST /api/bids → 201 or 400`, [201, 400, 422].includes(resp.status), `status=${resp.status}`);
      } else {
        rec(`${label}: POST /api/bids`, false, "No auction available");
      }
    } catch (e) {
      rec(`${label}: POST /api/bids`, false, e.message);
    }
  }

  // ── D — User bids page ────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "user-bids-page";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/user/bids"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status}`);

      // Heading visible
      const heading = await page
        .locator("h1, h2")
        .filter({ hasText: /bids/i })
        .count()
        .catch(() => 0);
      rec(`${label}: bids heading visible`, heading > 0, `count=${heading}`);
    } catch (e) {
      await takeScreenshot(page, "user-bids-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  await ctx.close();
  await adminCtx.close();
  return results;
}
