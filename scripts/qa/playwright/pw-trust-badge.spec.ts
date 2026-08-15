import { test, expect } from "@playwright/test";
import { gotoAndWait, BASE_URL } from "./_setup";

test.describe("P-12 Trust Badge — storefront, flag-gated", () => {
  test("store page renders without the badge while FEATURE_SCAM_REGISTRY is false", async ({ page }) => {
    const storeRes = await page.request.get(`${BASE_URL}/api/stores?pageSize=1`);
    const storeBody = (await storeRes.json()) as { data?: { items?: Array<{ storeSlug: string }> } };
    const storeSlug = storeBody.data?.items?.[0]?.storeSlug;
    test.skip(!storeSlug, "No seeded store");
    if (!storeSlug) return;

    await gotoAndWait(page, `/stores/${storeSlug}/products`);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    // Flag is off in prod pending legal sign-off — badge must render nowhere.
    await expect(page.locator("text=/verified safe|flagged in scam registry/i")).toHaveCount(0);
  });

  test("every store tab layout still renders (scamRegistryEnabled prop threaded safely)", async ({ page }) => {
    const storeRes = await page.request.get(`${BASE_URL}/api/stores?pageSize=1`);
    const storeBody = (await storeRes.json()) as { data?: { items?: Array<{ storeSlug: string }> } };
    const storeSlug = storeBody.data?.items?.[0]?.storeSlug;
    test.skip(!storeSlug, "No seeded store");
    if (!storeSlug) return;

    for (const tab of ["products", "auctions", "pre-orders", "about", "reviews"]) {
      await gotoAndWait(page, `/stores/${storeSlug}/${tab}`);
      await expect(page.getByRole("main").first()).toBeVisible({ timeout: 10000 });
    }
  });
});
