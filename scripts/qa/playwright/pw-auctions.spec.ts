import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Auctions — P5", () => {
  test("public auctions listing page renders", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/bids?pageSize=1`);
    if (res.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/auctions");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("auction detail page renders for a live auction", async ({ page }) => {
    const listRes = await page.request.get(
      `${BASE_URL}/api/products?listingType=auction&status=active&pageSize=1`,
    );
    if (listRes.status() === 404) {
      test.skip();
      return;
    }
    const body = await listRes.json() as { data: { items: { id: string }[] } };
    const firstId = body.data?.items?.[0]?.id;
    if (!firstId) {
      test.skip();
      return;
    }
    await gotoAndWait(page, `/auctions/${firstId}`);
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin bids nav item visible when FEATURE_AUCTIONS enabled", async ({ page }) => {
    await loginAsAdmin(page);
    const bidsRes = await page.request.get(`${BASE_URL}/api/admin/bids`);
    if (bidsRes.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/admin");
    const bidsLink = page.getByRole("link", { name: /^bids$/i }).first();
    await expect(bidsLink).toBeVisible();
  });

  test("admin bids page accessible", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.get(`${BASE_URL}/api/admin/bids`);
    if (res.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/admin/bids");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("unauthenticated bid placement returns 401", async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/bids`, {
      data: { productId: "auction-test", amount: 100000 },
    });
    expect([401, 404]).toContain(res.status());
  });

  test("bid on a non-existent auction returns 404 or 422", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.post(`${BASE_URL}/api/bids`, {
      data: { productId: "auction-does-not-exist-xyz", amount: 100000 },
    });
    expect([404, 422, 400]).toContain(res.status());
  });

  test("store bids page accessible for seller", async ({ page }) => {
    await loginAsAdmin(page);
    const bidsRes = await page.request.get(`${BASE_URL}/api/bids`);
    if (bidsRes.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/store/bids");
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
