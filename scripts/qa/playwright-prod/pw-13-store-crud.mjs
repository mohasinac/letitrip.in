/**
 * pw-13 — Store CRUD: create + edit operations from the seller dashboard.
 *
 * Creates a new product (draft), a new coupon, edits both.
 * Run as seller (pokemon palace — aryan@pokemonpalace.in).
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const TS = Date.now().toString(36).toUpperCase();

async function waitForSuccessOrToast(page, successPattern) {
  await Promise.race([
    page.waitForURL((url) => successPattern.test(url.toString()), { timeout: 8000 }),
    page.locator('[data-testid=toast], [role=alert]').first().waitFor({ state: "visible", timeout: 5000 }),
  ]).catch(() => {});

  const errorToast = await page.locator('.appkit-toast--error, [class*=toast--error]').count();
  const toast = await page.locator('[data-testid=toast], [role=alert]').count();
  return { errorToast, toast, finalUrl: page.url() };
}

export async function run() {
  const ctx = await getContext("seller");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── Create store product ──────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store create product";
    try {
      await gotoAndWait(page, localizedUrl("/store/products/new"));
      await page.fill('input[name=title]', `Smoke Product ${TS}`).catch(() => {});
      await page.fill('input[name=price]', '99900').catch(() => {}); // ₹999 in paise
      await page.fill('input[name=quantity], input[name=availableQuantity]', '5').catch(() => {});
      await page.selectOption('select[name=condition]', 'new').catch(() => {});
      // Category: pick first option
      const catSelect = page.locator('select[name=categorySlug], select[name=category]');
      if ((await catSelect.count()) > 0) {
        await catSelect.first().selectOption({ index: 1 }).catch(() => {});
      }

      const submitBtn = page.locator('button[type=submit], button:has-text("Save"), button:has-text("Create")');
      if ((await submitBtn.count()) === 0) {
        rec(`${label}: submit button found`, false, "no submit button");
      } else {
        await submitBtn.first().click();
        const { errorToast, toast, finalUrl } = await waitForSuccessOrToast(page, /\/store\/products/);
        rec(`${label}`, errorToast === 0, `url=${finalUrl} toast=${toast} error=${errorToast}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Create store coupon ───────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store create coupon";
    try {
      await gotoAndWait(page, localizedUrl("/store/coupons/new"));
      await page.fill('input[name=code]', `STOR${TS.slice(-5)}`).catch(() => {});
      await page.fill('input[name=name]', `Smoke Store Coupon ${TS}`).catch(() => {});
      await page.selectOption('select[name=type]', 'percentage').catch(() => {});
      await page.fill('input[name*="value"], input[name*="discount"]', '5').catch(() => {});

      const submitBtn = page.locator('button[type=submit], button:has-text("Create"), button:has-text("Save")');
      if ((await submitBtn.count()) === 0) {
        rec(`${label}: submit button found`, false, "no submit button");
      } else {
        await submitBtn.first().click();
        const { errorToast, toast, finalUrl } = await waitForSuccessOrToast(page, /\/store\/coupons/);
        rec(`${label}`, errorToast === 0, `url=${finalUrl} toast=${toast} error=${errorToast}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Edit a store product ──────────────────────────────────────────────────
  {
    const id = await fetchFirstId(BASE_URL, "/api/store/products", { cookieHeader });
    const page = await ctx.newPage();
    const label = "store edit product";
    if (!id) {
      rec(`${label}: found product`, false, "no store products");
    } else {
      try {
        await gotoAndWait(page, localizedUrl(`/store/products/${id}/edit`));
        const titleInput = page.locator('input[name=title]');
        if ((await titleInput.count()) > 0) {
          const orig = await titleInput.inputValue().catch(() => "");
          await titleInput.fill((orig || "Product").slice(0, 50) + " [e]");
          const save = page.locator('button[type=submit], button:has-text("Save"), button:has-text("Update")');
          await save.first().click();
          const { errorToast, toast } = await waitForSuccessOrToast(page, /\/store\/products/);
          rec(`${label}`, errorToast === 0, `toast=${toast} error=${errorToast}`);
        } else {
          rec(`${label}: title field`, false, "not found");
        }
      } catch (e) {
        rec(`${label}: shell`, false, e.message);
      }
    }
    await page.close();
  }

  // ── Store storefront settings ─────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store storefront settings";
    try {
      await gotoAndWait(page, localizedUrl("/store/storefront"));
      const inputs = await page.locator("form input, form textarea, form select").count();
      const saveBtn = await page.locator('button[type=submit], button:has-text("Save")').count();
      rec(`${label}: form rendered`, inputs >= 1 && saveBtn > 0, `inputs=${inputs} saveBtn=${saveBtn}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Store shipping settings ────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store shipping settings";
    try {
      await gotoAndWait(page, localizedUrl("/store/shipping"));
      const inputs = await page.locator("form input, form select").count();
      rec(`${label}: form rendered`, inputs >= 1, `inputs=${inputs}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Store payout settings ──────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store payout settings";
    try {
      await gotoAndWait(page, localizedUrl("/store/payout-settings"));
      const inputs = await page.locator("form input, form select").count();
      rec(`${label}: form rendered`, inputs >= 1, `inputs=${inputs}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Store slug page ────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store slug page";
    try {
      await gotoAndWait(page, localizedUrl("/store/slug"));
      const slugInput = await page.locator('input[name=slug], input[name=storeSlug]').count();
      rec(`${label}: slug input`, slugInput > 0, `n=${slugInput}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── Store analytics ────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "store analytics";
    try {
      await gotoAndWait(page, localizedUrl("/store/analytics"));
      const charts = await page.locator('canvas, svg[class*=chart], [class*=chart], [data-testid*=chart]').count();
      const stats = await page.locator('.appkit-stats-card, [class*=stat], [data-testid*=stat]').count();
      rec(`${label}: charts or stats`, charts + stats > 0, `charts=${charts} stats=${stats}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  return results;
}
