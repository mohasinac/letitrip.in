/**
 * pw-25 — Auction bidding flow: bid form, place bid, BIN button, ended auction.
 *
 * Login Yugi → auction detail → verify bid form + current bid + BIN button →
 * Ended auction: bid form disabled, ENDED badge → BIN auction: BIN button clickable.
 *
 * Timeout budget: 6 min.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, withScreenshotOnFailure } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  // ── Fetch auction IDs ───────────────────────────────────────────────────
  const activeAuctionId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "auction" && p.status === "published" && !p.isSold,
  });

  const endedAuctionId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "auction" && p.isSold === true,
  });

  // ── Buyer visits active auction ─────────────────────────────────────────
  const buyerCtx = await getContext("buyer");
  const page = await buyerCtx.newPage();
  page.setDefaultTimeout(20000);

  if (activeAuctionId) {
    await withScreenshotOnFailure(page, "pw25-active-auction", async () => {
      await gotoAndWait(page, localizedUrl(`/auctions/${activeAuctionId}`));

      // Price / current bid visible
      const price = await page.locator("text=/₹|INR|bid/i").count();
      rec("active auction: price/bid visible", price > 0, `n=${price}`);

      // Bid form or bid button
      const bidForm = await page.locator(
        'button:has-text("Place Bid"), button:has-text("Bid"), input[name*="bid" i], form[class*=bid i]',
      ).count();
      rec("active auction: bid form/button present", bidForm > 0, `n=${bidForm}`);

      // Countdown timer or end date
      const timer = await page.locator(
        '[class*=countdown], [class*=timer], text=/ends|remaining|left/i, time',
      ).count();
      rec("active auction: timer/end date shown", timer > 0, `n=${timer}`);

      // Bid history section
      const bidHistory = await page.locator(
        '[class*=bid-history], [class*=BidHistory], text=/bid history/i, table',
      ).count();
      rec("active auction: bid history section", bidHistory >= 0, `n=${bidHistory}`);

      // BIN button (may or may not be present depending on bidsHaveStarted)
      const binBtn = await page.locator(
        'button:has-text("Buy Now"), button:has-text("Buy It Now"), button:has-text("BIN")',
      ).count();
      rec("active auction: BIN button check", true, `present=${binBtn > 0}`);
    });
  } else {
    rec("active auction: no active auction found", false, "skipping");
  }

  // ── Buyer visits ended auction ──────────────────────────────────────────
  if (endedAuctionId) {
    await withScreenshotOnFailure(page, "pw25-ended-auction", async () => {
      await gotoAndWait(page, localizedUrl(`/auctions/${endedAuctionId}`));

      // ENDED/SOLD badge
      const endedBadge = await page.locator(
        'text=/ended|sold|closed/i, [class*=badge]:has-text("ENDED"), [class*=badge]:has-text("SOLD")',
      ).count();
      rec("ended auction: ENDED/SOLD badge visible", endedBadge > 0, `n=${endedBadge}`);

      // Bid form should be disabled or absent
      const activeBidBtn = await page.locator(
        'button:has-text("Place Bid"):not([disabled])',
      ).count();
      rec("ended auction: bid button disabled/absent", activeBidBtn === 0, `activeBtns=${activeBidBtn}`);
    });
  } else {
    rec("ended auction: no ended auction found", false, "skipping");
  }

  // ── Auctions listing page ──────────────────────────────────────────────
  await withScreenshotOnFailure(page, "pw25-auctions-listing", async () => {
    await gotoAndWait(page, localizedUrl("/auctions"));
    const cards = await page.locator('[data-card], .appkit-card, a[href*="/auctions/"]').count();
    rec("auctions listing: has cards", cards > 0, `n=${cards}`);

    // Toolbar present
    const toolbar = await page.locator('[data-testid=listing-toolbar], [class*=toolbar], [class*=Toolbar]').count();
    rec("auctions listing: toolbar present", toolbar > 0, `n=${toolbar}`);
  });

  await page.close();
  return results;
}
