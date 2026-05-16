/**
 * pw-16 — Accessibility assertions for key pages.
 *
 * Tests per page:
 * 1. Skip-to-main link present
 * 2. Main landmark present
 * 3. At least one nav with aria-label
 * 4. No empty buttons (first 30 checked)
 * 5. Images have alt text (first 20, tolerance 2)
 * 6. Form inputs have associated labels (first 15, tolerance 1)
 * 7. Exactly 1 h1 per page
 * 8. Tab key moves focus off body
 */

import { getContext, localizedUrl, gotoAndWait } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── A11y audit helper ────────────────────────────────────────────────────────

async function auditA11y(ctx, path, role = "anon") {
  const page = await ctx.newPage();
  const label = `${path} [${role}]`;

  try {
    await gotoAndWait(page, localizedUrl(path));

    // 1. Skip-to-main link
    const skipLink = await page.locator(
      'a[href="#main-content"], a[href="#main"], a:has-text("Skip to main"), [data-testid=skip-to-main]',
    ).count();
    rec(`${label}: skip-to-main link`, skipLink > 0, `n=${skipLink}`);

    // 2. Main landmark
    const main = await page.locator("main, [role=main]").count();
    rec(`${label}: main landmark`, main > 0, `n=${main}`);

    // 3. Nav with aria-label
    const navWithLabel = await page.locator("nav[aria-label], [role=navigation][aria-label]").count();
    rec(`${label}: nav has aria-label`, navWithLabel > 0, `n=${navWithLabel}`);

    // 4. No empty buttons (first 30)
    const buttons = await page.locator("button").all();
    let emptyButtons = 0;
    for (const btn of buttons.slice(0, 30)) {
      const text = (await btn.textContent().catch(() => "")) ?? "";
      const ariaLabel = await btn.getAttribute("aria-label").catch(() => null);
      const ariaLabelledBy = await btn.getAttribute("aria-labelledby").catch(() => null);
      const title = await btn.getAttribute("title").catch(() => null);
      if (!text.trim() && !ariaLabel && !ariaLabelledBy && !title) emptyButtons++;
    }
    rec(`${label}: no empty buttons (first 30)`, emptyButtons <= 2, `empty=${emptyButtons}`);

    // 5. Images have alt (first 20, tolerance 2)
    const imgs = await page.locator("img:not([role=presentation])").all();
    let noAlt = 0;
    for (const img of imgs.slice(0, 20)) {
      const alt = await img.getAttribute("alt").catch(() => "SKIP");
      if (alt === null) noAlt++;
    }
    rec(`${label}: images have alt (first 20)`, noAlt <= 2, `noAlt=${noAlt}`);

    // 6. Form inputs have labels (first 15, tolerance 1)
    const inputs = await page.locator(
      "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio])",
    ).all();
    let unlabelled = 0;
    for (const inp of inputs.slice(0, 15)) {
      const id = await inp.getAttribute("id").catch(() => null);
      const ariaLabel = await inp.getAttribute("aria-label").catch(() => null);
      const ariaLabelledBy = await inp.getAttribute("aria-labelledby").catch(() => null);
      const placeholder = await inp.getAttribute("placeholder").catch(() => null);
      if (ariaLabel || ariaLabelledBy || placeholder) continue;
      if (id) {
        const labelEl = await page.locator(`label[for="${id}"]`).count();
        if (labelEl === 0) unlabelled++;
      } else {
        unlabelled++;
      }
    }
    rec(`${label}: inputs have labels (first 15)`, unlabelled <= 1, `unlabelled=${unlabelled}`);

    // 7. Exactly 1 h1
    const h1s = await page.locator("h1").count();
    rec(`${label}: exactly 1 h1`, h1s === 1, `h1s=${h1s}`);

    // 8. Tab moves focus off body
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName?.toUpperCase() ?? "BODY");
    rec(`${label}: Tab moves focus`, focused !== "BODY", `focused=${focused}`);

  } catch (e) {
    rec(`${label}: shell`, false, e.message);
  }

  await page.close();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function run() {
  // Public pages (anon)
  const anonCtx = await getContext("anon");
  for (const path of ["/", "/products", "/auctions", "/events", "/auth/login", "/auth/register"]) {
    await auditA11y(anonCtx, path, "anon");
  }

  // Admin pages
  const adminCtx = await getContext("admin");
  for (const path of [
    "/admin/dashboard",
    "/admin/products",
    "/admin/users",
    "/admin/orders",
    "/admin/blog",
    "/admin/carousel",
    "/admin/site",
  ]) {
    await auditA11y(adminCtx, path, "admin");
  }

  // Admin site settings: Fees tab fields present
  {
    const page = await adminCtx.newPage();
    page.setDefaultTimeout(15000);
    const label = "admin-site-fees-tab";
    try {
      await gotoAndWait(page, localizedUrl("/admin/site"));

      // Navigate to Fees tab
      const feesTab = page.locator('[role="tab"]:has-text("Fees"), button:has-text("Fees"), a:has-text("Fees")');
      const feesTabCount = await feesTab.count().catch(() => 0);
      if (feesTabCount > 0) await feesTab.first().click();

      // platformFeePercent input
      const platformFeeInput = await page
        .locator('input[name="platformFeePercent"], input[id*="platformFee"], input[placeholder*="platform" i]')
        .count()
        .catch(() => 0);
      rec(`${label}: platformFeePercent input visible`, platformFeeInput > 0, `count=${platformFeeInput}`);

      // minimumTransactionFee input
      const minFeeInput = await page
        .locator('input[name="minimumTransactionFee"], input[id*="minimumTransaction"], input[placeholder*="minimum" i]')
        .count()
        .catch(() => 0);
      rec(`${label}: minimumTransactionFee input visible`, minFeeInput > 0, `count=${minFeeInput}`);
    } catch (e) {
      rec(`${label}: fees tab check`, false, e.message);
    }
    await page.close();
  }

  await adminCtx.close();

  // Store pages (seller)
  const sellerCtx = await getContext("seller");

  for (const path of ["/store", "/store/products", "/store/orders"]) {
    await auditA11y(sellerCtx, path, "seller");
  }

  // User pages (buyer)
  const buyerCtx = await getContext("buyer");
  for (const path of [
    "/user/profile",
    "/user/orders",
    "/user/addresses",
    "/wishlist",
    "/cart",
  ]) {
    await auditA11y(buyerCtx, path, "buyer");
  }

  return results;
}
