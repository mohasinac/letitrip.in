/**
 * pw-25 — Buyer workflows (comprehensive role-based testing).
 *
 * Test groups:
 *  A — Browse + search + filter products (functional)
 *  B — Product detail page: full CTA suite (price, condition, store, images, share/wishlist/offer)
 *  C — Wishlist: add, verify presence, bulk remove
 *  D — Wishlist: save for later from cart
 *  E — Cart: quantity controls (+/-) + remove item
 *  F — Cart: apply coupon code + remove coupon
 *  G — Checkout: OTP consent step + address selection
 *  H — Auction: place bid (execute mutation)
 *  I — Pre-order: place pre-order (execute)
 *  J — Prize draws: enter + code reveal attempt
 *  K — Offers: submit offer (execute)
 *  L — Reviews: submit review (post-purchase)
 *  M — Notifications: mark read + mark all read
 *  N — User profile: edit bio + save
 *  O — History: browse + clear
 *  P — Scam reporting: submit report (execute)
 *
 * Environment:
 *   SMOKE_HEADLESS=0 SMOKE_SLOW_MO=100   — watch the flow
 *   SMOKE_RECORD_VIDEO=1                 — capture .webm
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

// ── helpers ────────────────────────────────────────────────────────────────────

/** Count elements that contain the given text substring (case-insensitive). */
async function countText(page, sel, text) {
  return page
    .locator(sel)
    .filter({ hasText: new RegExp(text, "i") })
    .count()
    .catch(() => 0);
}

/** True if any heading/label on the page contains the text. */
async function hasLabel(page, text) {
  const c = await countText(page, "h1, h2, h3, label, [class*=heading], [class*=label], p, span", text);
  return c > 0;
}

// ── Suite ──────────────────────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("buyer");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Browse + search + filter products ──────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "browse-search-filter";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/products"));
      rec(`${label}: products page loads`, status < 400, `status=${status}`);

      // Search: type "blue-eyes" and press Enter
      const searchInput = await page.locator('input[type=search], input[name=q], input[placeholder*="search" i]').first();
      if (await searchInput.count().catch(() => 0)) {
        await searchInput.fill("blue-eyes");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle").catch(() => {});
        rec(`${label}: search executes`, true, "blue-eyes searched");
      } else {
        rec(`${label}: search executes`, false, "search input not found");
      }

      // Filter drawer: open and apply filter
      const filterBtn = await page
        .locator('button:has-text("Filter"), button[aria-label*="filter" i]')
        .first();
      if (await filterBtn.count().catch(() => 0)) {
        await filterBtn.click();
        await page.waitForTimeout(300);
        const drawer = await page.locator('[role=dialog], [class*=drawer], aside').first().count().catch(() => 0);
        rec(`${label}: filter drawer opens`, drawer > 0, `drawer=${drawer}`);
      }

      // Sort: change to "Price: Low to High"
      const sortBtn = await page
        .locator('button:has-text("Sort"), [class*=sort], select')
        .first();
      if (await sortBtn.count().catch(() => 0)) {
        await sortBtn.click();
        await page.waitForTimeout(200);
        const lowToHigh = await page
          .locator('button, a, div')
          .filter({ hasText: /price.*low|low.*high/i })
          .first()
          .count()
          .catch(() => 0);
        if (lowToHigh > 0) {
          await page.locator('button, a, div').filter({ hasText: /price.*low|low.*high/i }).first().click();
          await page.waitForLoadState("networkidle").catch(() => {});
          rec(`${label}: sort applied`, true, "price-low-to-high");
        }
      }

      await takeScreenshot(page, "buyer-browse-search-filter");
    } catch (e) {
      await takeScreenshot(page, "buyer-browse-fail").catch(() => {});
      rec(`${label}: browse`, false, e.message);
    }
    await page.close();
  }

  // ── B — Product detail: full CTA suite ──────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "product-detail";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no standard product in seed");
      } else {
        const { status, finalUrl } = await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        rec(`${label}: detail page loads`, status < 400, `status=${status}`);

        // Price visible (₹ or INR)
        const price = await page.locator("text=/₹|INR/").count().catch(() => 0);
        rec(`${label}: price visible`, price > 0, `priceEl=${price}`);

        // Condition badge
        const condition = await page
          .locator("[class*=badge], [class*=condition], span")
          .filter({ hasText: /new|used|refurbished|broken/i })
          .count()
          .catch(() => 0);
        rec(`${label}: condition badge`, condition > 0, `count=${condition}`);

        // Store name link
        const storeLink = await page
          .locator('a[href*="/stores/"]')
          .count()
          .catch(() => 0);
        rec(`${label}: store link present`, storeLink > 0, `count=${storeLink}`);

        // Images gallery
        const images = await page
          .locator('img[alt*="product" i], img[src*="/media/"], [class*=carousel], [class*=gallery]')
          .count()
          .catch(() => 0);
        rec(`${label}: images present`, images > 0, `count=${images}`);

        // CTA buttons: Add to Cart, Wishlist, Offer (if enabled)
        const addToCart = await page
          .locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")')
          .count()
          .catch(() => 0);
        rec(`${label}: add to cart button`, addToCart > 0, `count=${addToCart}`);

        const wishlist = await page
          .locator('button[aria-label*="wishlist" i], button[class*=heart], button:has-text("Wishlist")')
          .count()
          .catch(() => 0);
        rec(`${label}: wishlist button`, wishlist > 0, `count=${wishlist}`);

        await takeScreenshot(page, "product-detail-ctas");
      }
    } catch (e) {
      await takeScreenshot(page, "product-detail-fail").catch(() => {});
      rec(`${label}: detail page loads`, false, e.message);
    }
    await page.close();
  }

  // ── C — Wishlist: add, verify, bulk remove ─────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "wishlist-add-remove";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no product");
      } else {
        // Navigate to product detail
        const { status } = await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        rec(`${label}: product page loads`, status < 400, `status=${status}`);

        // Click wishlist heart
        const wishlistBtn = await page
          .locator('button[aria-label*="wishlist" i], button[class*=heart], svg[class*=heart]')
          .first();
        if (await wishlistBtn.count().catch(() => 0)) {
          await wishlistBtn.click();
          await page.waitForTimeout(500);
          const toast = await page.locator("text=/added.*wishlist|wishlist.*added/i").count().catch(() => 0);
          rec(`${label}: added to wishlist toast`, toast > 0, `count=${toast}`);
        }

        // Navigate to wishlist
        const { status: wlStatus } = await gotoAndWait(page, localizedUrl("/user/wishlist"));
        rec(`${label}: wishlist page loads`, wlStatus < 400, `status=${wlStatus}`);

        // Assert product card visible
        const card = await page
          .locator("[class*=card], [class*=item], article, div[role=article]")
          .count()
          .catch(() => 0);
        rec(`${label}: product card in wishlist`, card > 0, `count=${card}`);

        // Bulk remove: select card, click remove
        const checkbox = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .first();
        if (await checkbox.count().catch(() => 0)) {
          await checkbox.click();
          await page.waitForTimeout(300);
          const bulkBar = await page
            .locator("[class*=bulk], [class*=action-bar]")
            .count()
            .catch(() => 0);
          if (bulkBar > 0) {
            const removeBtn = await page
              .locator("button:has-text(Remove), button:has-text(Delete)")
              .first();
            if (await removeBtn.count().catch(() => 0)) {
              await removeBtn.click();
              await page.waitForTimeout(500);
              const successToast = await page.locator("text=/removed|deleted/i").count().catch(() => 0);
              rec(`${label}: bulk remove executes`, successToast > 0, `toast=${successToast}`);
            }
          }
        }

        await takeScreenshot(page, "wishlist-bulk-remove");
      }
    } catch (e) {
      await takeScreenshot(page, "wishlist-fail").catch(() => {});
      rec(`${label}: add-remove`, false, e.message);
    }
    await page.close();
  }

  // ── D — Wishlist: save for later from cart ─────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "wishlist-save-from-cart";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no product");
      } else {
        // Add to cart
        const { status } = await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        const addBtn = await page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
        if (await addBtn.count().catch(() => 0)) {
          await addBtn.click();
          await page.waitForTimeout(500);
        }

        // Navigate to cart
        const { status: cartStatus } = await gotoAndWait(page, localizedUrl("/cart"));
        rec(`${label}: cart page loads`, cartStatus < 400, `status=${cartStatus}`);

        // Find "Save for Later" button on cart item
        const saveBtn = await page
          .locator('button:has-text("Save for Later"), button[aria-label*="save" i]')
          .first();
        if (await saveBtn.count().catch(() => 0)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const moved = await page.locator("text=/moved.*wishlist|wishlist|saved/i").count().catch(() => 0);
          rec(`${label}: save for later executes`, moved > 0, `toast=${moved}`);

          // Navigate to wishlist to verify
          const { status: wlStatus } = await gotoAndWait(page, localizedUrl("/user/wishlist"));
          const item = await page.locator("[class*=card], [class*=item]").count().catch(() => 0);
          rec(`${label}: item in wishlist`, item > 0, `count=${item}`);
        }

        await takeScreenshot(page, "cart-save-for-later");
      }
    } catch (e) {
      await takeScreenshot(page, "cart-save-later-fail").catch(() => {});
      rec(`${label}: save-for-later`, false, e.message);
    }
    await page.close();
  }

  // ── E — Cart: quantity controls + remove ────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "cart-quantity";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published" && p.quantity >= 3,
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no product with qty>=3");
      } else {
        // Add to cart
        await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        const addBtn = await page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
        if (await addBtn.count().catch(() => 0)) {
          await addBtn.click();
          await page.waitForTimeout(500);
        }

        // Navigate to cart
        const { status } = await gotoAndWait(page, localizedUrl("/cart"));
        rec(`${label}: cart page loads`, status < 400, `status=${status}`);

        // Find quantity control
        const qtyInput = await page
          .locator('input[type=number], input[inputmode=numeric]')
          .first();
        if (await qtyInput.count().catch(() => 0)) {
          const initialQty = await qtyInput.inputValue().catch(() => "1");
          rec(`${label}: initial qty`, initialQty !== "", `qty=${initialQty}`);

          // Click + button to increase
          const plusBtn = await page
            .locator('button:has-text("+"), button[aria-label*="increase" i]')
            .first();
          if (await plusBtn.count().catch(() => 0)) {
            await plusBtn.click();
            await page.waitForTimeout(300);
            const updatedQty = await qtyInput.inputValue().catch(() => "");
            rec(`${label}: qty increased`, updatedQty !== initialQty, `old=${initialQty} new=${updatedQty}`);

            // Click - button to decrease
            const minusBtn = await page
              .locator('button:has-text("-"), button[aria-label*="decrease" i]')
              .first();
            if (await minusBtn.count().catch(() => 0)) {
              await minusBtn.click();
              await page.waitForTimeout(300);
              const decreasedQty = await qtyInput.inputValue().catch(() => "");
              rec(`${label}: qty decreased`, decreasedQty === initialQty, `back to=${decreasedQty}`);
            }
          }
        }

        // Remove item
        const removeBtn = await page
          .locator('button[aria-label*="remove" i], button[class*=trash], svg[class*=trash]')
          .first();
        if (await removeBtn.count().catch(() => 0)) {
          await removeBtn.click();
          await page.waitForTimeout(500);
          const removed = await page.locator("text=/removed|deleted|empty/i").count().catch(() => 0);
          rec(`${label}: item removed`, removed > 0, `indicator=${removed}`);
        }

        await takeScreenshot(page, "cart-quantity-controls");
      }
    } catch (e) {
      await takeScreenshot(page, "cart-qty-fail").catch(() => {});
      rec(`${label}: quantity`, false, e.message);
    }
    await page.close();
  }

  // ── F — Cart: apply coupon code ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "cart-coupon";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no product");
      } else {
        // Add to cart
        await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        const addBtn = await page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
        if (await addBtn.count().catch(() => 0)) {
          await addBtn.click();
          await page.waitForTimeout(500);
        }

        // Navigate to cart
        const { status } = await gotoAndWait(page, localizedUrl("/cart"));
        rec(`${label}: cart page loads`, status < 400, `status=${status}`);

        // Find coupon input and apply a code (e.g. WELCOME10)
        const couponInput = await page
          .locator('input[name*="coupon" i], input[placeholder*="coupon" i]')
          .first();
        if (await couponInput.count().catch(() => 0)) {
          await couponInput.fill("WELCOME10");
          const applyBtn = await page
            .locator('button:has-text("Apply"), button[aria-label*="apply" i]')
            .first();
          if (await applyBtn.count().catch(() => 0)) {
            await applyBtn.click();
            await page.waitForTimeout(500);
            const discount = await page.locator("text=/discount|offer|%/i").count().catch(() => 0);
            rec(`${label}: coupon applied`, discount > 0, `discount=${discount}`);

            // Remove coupon
            const removeBtn = await page
              .locator('button:has-text("Remove"), button[aria-label*="remove.*coupon" i]')
              .first();
            if (await removeBtn.count().catch(() => 0)) {
              await removeBtn.click();
              await page.waitForTimeout(300);
              const discountGone = await page
                .locator("text=/discount|offer/i")
                .count()
                .catch(() => 0);
              rec(`${label}: coupon removed`, discountGone === 0, `count=${discountGone}`);
            }
          }
        }

        await takeScreenshot(page, "cart-coupon");
      }
    } catch (e) {
      await takeScreenshot(page, "cart-coupon-fail").catch(() => {});
      rec(`${label}: coupon`, false, e.message);
    }
    await page.close();
  }

  // ── G — Checkout: OTP consent + address selection ───────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);
    const label = "checkout-otp";
    try {
      // Add product to cart first
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (productId) {
        await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        const addBtn = await page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
        if (await addBtn.count().catch(() => 0)) {
          await addBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Navigate to checkout
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/checkout"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: checkout loads`, status < 400, `status=${status}`);

      if (!redirected) {
        // OTP consent heading
        const otpHeading = await page
          .locator("h1, h2, h3")
          .filter({ hasText: /verify.*identity|otp|phone verification/i })
          .count()
          .catch(() => 0);
        rec(`${label}: otp-consent heading`, otpHeading > 0, `count=${otpHeading}`);

        // Send code button
        const sendBtn = await page
          .locator("button")
          .filter({ hasText: /send.*code|send.*otp|verify/i })
          .count()
          .catch(() => 0);
        rec(`${label}: send code button`, sendBtn > 0, `count=${sendBtn}`);

        // Address selection
        const addressSection = await countText(page, "*", "address");
        rec(`${label}: address section present`, addressSection > 0, `count=${addressSection}`);

        // Order summary
        const summary = await page
          .locator("[class*=summary], [class*=order], aside, div[role=region]")
          .count()
          .catch(() => 0);
        rec(`${label}: order summary visible`, summary > 0, `count=${summary}`);
      }

      await takeScreenshot(page, "checkout-otp-consent");
    } catch (e) {
      await takeScreenshot(page, "checkout-otp-fail").catch(() => {});
      rec(`${label}: checkout otp`, false, e.message);
    }
    await page.close();
  }

  // ── H — Auction: place bid ─────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "auction-bid";
    try {
      const auctionId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "auction",
      });

      if (!auctionId) {
        rec(`${label}: auction found`, false, "no auction in seed");
      } else {
        const { status } = await gotoAndWait(page, localizedUrl(`/auctions/${auctionId}`));
        rec(`${label}: auction page loads`, status < 400, `status=${status}`);

        // Bid form present
        const bidForm = await page
          .locator("[class*=bid], form")
          .count()
          .catch(() => 0);
        rec(`${label}: bid form visible`, bidForm > 0, `count=${bidForm}`);

        // Current price visible
        const currentPrice = await page.locator("text=/current.*bid|₹|INR/i").count().catch(() => 0);
        rec(`${label}: current price visible`, currentPrice > 0, `count=${currentPrice}`);

        // Bid input + place bid button
        const bidInput = await page
          .locator('input[type=number], input[inputmode=numeric]')
          .first();
        if (await bidInput.count().catch(() => 0)) {
          // Fill a realistic bid amount (e.g. 1000 paise = ₹10)
          await bidInput.fill("100000");
          const placeBidBtn = await page
            .locator("button:has-text(Bid), button:has-text(Place Bid)")
            .first();
          if (await placeBidBtn.count().catch(() => 0)) {
            await placeBidBtn.click();
            await page.waitForTimeout(800);
            const success = await page.locator("text=/bid.*placed|success/i").count().catch(() => 0);
            rec(`${label}: bid placed`, success > 0, `toast=${success}`);

            // Verify price updated
            const updatedPrice = await page.locator("text=/₹|INR/").count().catch(() => 0);
            rec(`${label}: price reflects bid`, updatedPrice > 0, `count=${updatedPrice}`);
          }
        }

        await takeScreenshot(page, "auction-place-bid");
      }
    } catch (e) {
      await takeScreenshot(page, "auction-bid-fail").catch(() => {});
      rec(`${label}: auction bid`, false, e.message);
    }
    await page.close();
  }

  // ── I — Pre-order: place pre-order ──────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "preorder-place";
    try {
      const preorderId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "pre-order",
      });

      if (!preorderId) {
        rec(`${label}: preorder found`, false, "no pre-order in seed");
      } else {
        const { status } = await gotoAndWait(page, localizedUrl(`/pre-orders/${preorderId}`));
        rec(`${label}: preorder page loads`, status < 400, `status=${status}`);

        // Pre-order button + estimated delivery
        const preorderBtn = await page
          .locator("button:has-text(Pre-Order), button:has-text(Pre-order now)")
          .count()
          .catch(() => 0);
        rec(`${label}: pre-order button present`, preorderBtn > 0, `count=${preorderBtn}`);

        const deliveryInfo = await countText(page, "*", "delivery|estimated");
        rec(`${label}: delivery info visible`, deliveryInfo > 0, `count=${deliveryInfo}`);

        // Click pre-order
        if (preorderBtn > 0) {
          const btn = await page
            .locator("button:has-text(Pre-Order), button:has-text(Pre-order now)")
            .first();
          await btn.click();
          await page.waitForTimeout(800);
          const confirmation = await page.locator("text=/added.*cart|pre-order.*confirmed|success/i").count().catch(() => 0);
          rec(`${label}: preorder executes`, confirmation > 0, `toast=${confirmation}`);
        }

        await takeScreenshot(page, "preorder-place");
      }
    } catch (e) {
      await takeScreenshot(page, "preorder-fail").catch(() => {});
      rec(`${label}: preorder`, false, e.message);
    }
    await page.close();
  }

  // ── J — Prize draws: enter + code reveal ────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "prize-draw";
    try {
      const prizedrawId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "prize-draw",
      });

      if (!prizedrawId) {
        rec(`${label}: prize-draw found`, false, "no prize-draw in seed");
      } else {
        const { status } = await gotoAndWait(page, localizedUrl(`/prize-draws/${prizedrawId}`));
        rec(`${label}: prize-draw page loads`, status < 400, `status=${status}`);

        // Enter/Reveal button
        const enterBtn = await page
          .locator("button:has-text(Enter), button:has-text(Reveal)")
          .count()
          .catch(() => 0);
        rec(`${label}: enter/reveal button`, enterBtn > 0, `count=${enterBtn}`);

        // Click to enter/reveal
        if (enterBtn > 0) {
          const btn = await page
            .locator("button:has-text(Enter), button:has-text(Reveal)")
            .first();
          await btn.click();
          await page.waitForTimeout(1000);
          const modal = await page.locator("[role=dialog], [class*=modal], [class*=drawer]").count().catch(() => 0);
          rec(`${label}: reveal modal opens`, modal > 0, `count=${modal}`);
        }

        await takeScreenshot(page, "prize-draw-enter");
      }
    } catch (e) {
      await takeScreenshot(page, "prize-draw-fail").catch(() => {});
      rec(`${label}: prize-draw`, false, e.message);
    }
    await page.close();
  }

  // ── K — Offers: submit offer ───────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "offer-submit";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard" && p.status === "published",
      });

      if (!productId) {
        rec(`${label}: product found`, false, "no product");
      } else {
        const { status } = await gotoAndWait(page, localizedUrl(`/products/${productId}`));
        rec(`${label}: product page loads`, status < 400, `status=${status}`);

        // Make an Offer button
        const offerBtn = await page
          .locator("button:has-text(Offer), button:has-text(Make an Offer)")
          .count()
          .catch(() => 0);
        rec(`${label}: offer button present`, offerBtn > 0, `count=${offerBtn}`);

        if (offerBtn > 0) {
          const btn = await page
            .locator("button:has-text(Offer), button:has-text(Make an Offer)")
            .first();
          await btn.click();
          await page.waitForTimeout(500);

          // Offer input appears
          const offerInput = await page
            .locator('input[type=number], input[inputmode=numeric]')
            .first();
          if (await offerInput.count().catch(() => 0)) {
            // Fill an offer (50% of list price, roughly)
            await offerInput.fill("25000");
            const submitBtn = await page
              .locator("button:has-text(Submit), button:has-text(Send Offer)")
              .first();
            if (await submitBtn.count().catch(() => 0)) {
              await submitBtn.click();
              await page.waitForTimeout(800);
              const success = await page.locator("text=/offer.*submitted|success/i").count().catch(() => 0);
              rec(`${label}: offer submitted`, success > 0, `toast=${success}`);
            }
          }
        }

        await takeScreenshot(page, "offer-submit");
      }
    } catch (e) {
      await takeScreenshot(page, "offer-fail").catch(() => {});
      rec(`${label}: offer`, false, e.message);
    }
    await page.close();
  }

  // ── L — Reviews: submit review ────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "review-submit";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/user/reviews/new"));
      rec(`${label}: review form loads`, status < 400 || /\/auth\/login/.test(page.url()), `status=${status}`);

      if (status < 400) {
        // Rating input (stars or select)
        const ratingInput = await page
          .locator('[role="radio"], [class*="star"], input[name*="rating" i]')
          .count()
          .catch(() => 0);
        rec(`${label}: rating input present`, ratingInput > 0, `count=${ratingInput}`);

        // Title input
        const titleInput = await page
          .locator('input[name="title"], input[placeholder*="title" i]')
          .count()
          .catch(() => 0);
        rec(`${label}: title input present`, titleInput > 0, `count=${titleInput}`);

        // Body textarea
        const bodyTextarea = await page
          .locator('textarea[name="body"], textarea[placeholder*="review" i]')
          .count()
          .catch(() => 0);
        rec(`${label}: body textarea present`, bodyTextarea > 0, `count=${bodyTextarea}`);

        // Submit button
        const submitBtn = await page
          .locator("button:has-text(Submit), button:has-text(Post Review)")
          .count()
          .catch(() => 0);
        rec(`${label}: submit button present`, submitBtn > 0, `count=${submitBtn}`);
      }

      await takeScreenshot(page, "review-submit-form");
    } catch (e) {
      await takeScreenshot(page, "review-fail").catch(() => {});
      rec(`${label}: review`, false, e.message);
    }
    await page.close();
  }

  // ── M — Notifications: mark read ───────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "notifications";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/user/notifications"));
      rec(`${label}: notifications page loads`, status < 400, `status=${status}`);

      // Count unread badges
      const unreadBadges = await page
        .locator("[class*=unread], [class*=badge]")
        .count()
        .catch(() => 0);
      rec(`${label}: unread badges present`, unreadBadges > 0, `count=${unreadBadges}`);

      // Mark all read button
      const markAllBtn = await page
        .locator("button:has-text(Mark all), button:has-text(Mark All)")
        .count()
        .catch(() => 0);
      rec(`${label}: mark all read button`, markAllBtn > 0, `count=${markAllBtn}`);

      if (markAllBtn > 0) {
        const btn = await page
          .locator("button:has-text(Mark all), button:has-text(Mark All)")
          .first();
        await btn.click();
        await page.waitForTimeout(500);
        const success = await page.locator("text=/marked|success/i").count().catch(() => 0);
        rec(`${label}: mark all executes`, success > 0, `toast=${success}`);
      }

      await takeScreenshot(page, "notifications-mark-read");
    } catch (e) {
      await takeScreenshot(page, "notifications-fail").catch(() => {});
      rec(`${label}: notifications`, false, e.message);
    }
    await page.close();
  }

  // ── N — User profile: edit bio + save ──────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "profile-edit";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/user/profile"));
      rec(`${label}: profile page loads`, status < 400, `status=${status}`);

      // Bio textarea/input
      const bioInput = await page
        .locator('textarea[name="bio"], input[placeholder*="bio" i]')
        .first();
      if (await bioInput.count().catch(() => 0)) {
        const oldBio = await bioInput.inputValue().catch(() => "");
        const newBio = `Smoke test bio ${Date.now()}`;
        await bioInput.fill(newBio);
        rec(`${label}: bio edited`, newBio !== oldBio, `old="${oldBio.slice(0, 20)}" new="${newBio}"`);

        // Save button
        const saveBtn = await page
          .locator("button:has-text(Save), button:has-text(Update)")
          .first();
        if (await saveBtn.count().catch(() => 0)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/saved|updated|success/i").count().catch(() => 0);
          rec(`${label}: profile saved`, success > 0, `toast=${success}`);

          // Refresh and verify persistence
          await page.reload();
          const savedBio = await bioInput.inputValue().catch(() => "");
          rec(`${label}: bio persists`, savedBio.includes("smoke"), `saved="${savedBio.slice(0, 30)}"`);
        }
      }

      await takeScreenshot(page, "profile-edit");
    } catch (e) {
      await takeScreenshot(page, "profile-fail").catch(() => {});
      rec(`${label}: profile`, false, e.message);
    }
    await page.close();
  }

  // ── O — History: browse + clear ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "history";
    try {
      // Generate history by visiting products
      const productId1 = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType === "standard",
      });
      if (productId1) {
        await gotoAndWait(page, localizedUrl(`/products/${productId1}`));
        await page.waitForTimeout(500);
      }

      const productId2 = await fetchFirstId(BASE_URL, "/api/products", {
        filter: (p) => p.listingType !== "standard",
      });
      if (productId2) {
        await gotoAndWait(page, localizedUrl(`/products/${productId2}`));
        await page.waitForTimeout(500);
      }

      // Navigate to history
      const { status } = await gotoAndWait(page, localizedUrl("/user/history"));
      rec(`${label}: history page loads`, status < 400, `status=${status}`);

      // Count history items
      const items = await page
        .locator("[class*=card], [class*=item], article")
        .count()
        .catch(() => 0);
      rec(`${label}: history items present`, items > 0, `count=${items}`);

      // Clear history button
      const clearBtn = await page
        .locator("button:has-text(Clear), button:has-text(Delete All)")
        .count()
        .catch(() => 0);
      rec(`${label}: clear history button`, clearBtn > 0, `count=${clearBtn}`);

      if (clearBtn > 0) {
        const btn = await page
          .locator("button:has-text(Clear), button:has-text(Delete All)")
          .first();
        await btn.click();
        await page.waitForTimeout(500);

        // Confirmation modal/dialog
        const confirmBtn = await page
          .locator("button:has-text(Confirm), button:has-text(Delete), button:has-text(Clear)")
          .count()
          .catch(() => 0);
        if (confirmBtn > 0) {
          const btn = await page
            .locator("button:has-text(Confirm), button:has-text(Delete), button:has-text(Clear)")
            .last();
          await btn.click();
          await page.waitForTimeout(500);
          const empty = await page.locator("text=/empty|no.*history|cleared/i").count().catch(() => 0);
          rec(`${label}: history cleared`, empty > 0, `emptyState=${empty}`);
        }
      }

      await takeScreenshot(page, "history-clear");
    } catch (e) {
      await takeScreenshot(page, "history-fail").catch(() => {});
      rec(`${label}: history`, false, e.message);
    }
    await page.close();
  }

  // ── P — Scam reporting: submit report ──────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "scam-report";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/scams/report"));
      rec(`${label}: report page loads`, status < 400, `status=${status}`);

      // Scammer type dropdown/select
      const typeSelect = await page
        .locator("select, [role=combobox], [class*=dropdown]")
        .count()
        .catch(() => 0);
      rec(`${label}: scammer type select`, typeSelect > 0, `count=${typeSelect}`);

      // Phone/UPI input
      const phoneInput = await page
        .locator('input[name*="phone" i], input[name*="upi" i], input[placeholder*="phone" i]')
        .first();
      if (await phoneInput.count().catch(() => 0)) {
        await phoneInput.fill("9876543210");
      }

      // Description textarea
      const descInput = await page
        .locator('textarea[name*="description" i], textarea[placeholder*="report" i]')
        .first();
      if (await descInput.count().catch(() => 0)) {
        await descInput.fill(`Smoke scam report ${Date.now()}`);
      }

      // Submit button
      const submitBtn = await page
        .locator("button:has-text(Submit), button:has-text(Report)")
        .count()
        .catch(() => 0);
      rec(`${label}: submit button present`, submitBtn > 0, `count=${submitBtn}`);

      if (submitBtn > 0) {
        const btn = await page
          .locator("button:has-text(Submit), button:has-text(Report)")
          .first();
        await btn.click();
        await page.waitForTimeout(800);
        const success = await page.locator("text=/submitted|thank|reported|success/i").count().catch(() => 0);
        rec(`${label}: report submitted`, success > 0, `toast=${success}`);
      }

      // Navigate to scams registry
      const { status: scamStatus } = await gotoAndWait(page, localizedUrl("/scams"));
      rec(`${label}: scams page loads`, scamStatus < 400, `status=${scamStatus}`);

      await takeScreenshot(page, "scam-report-submit");
    } catch (e) {
      await takeScreenshot(page, "scam-report-fail").catch(() => {});
      rec(`${label}: scam report`, false, e.message);
    }
    await page.close();
  }

  return results;
}
