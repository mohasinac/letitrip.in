import { test, expect } from "@playwright/test";
import { loginAsSeller, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Seller Dashboard Basics — UC-S2, UC-S3, UC-S4", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page);
  });

  test("seller products page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("seller products API returns seeded products for the store", async ({ page }) => {
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/store/products?pageSize=5`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: unknown[]; total?: number } };
    expect(body.data?.total, "Seller must have at least one product in seed data").toBeGreaterThan(0);
  });

  test("seller orders page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/store/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("seller storefront settings page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/store/storefront");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("auction tab is NOT shown in seller products (FEATURE_AUCTIONS=false)", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    const main = page.getByRole("main").first();
    await expect(main).toBeVisible();
    await expect(main.locator("[role='tab']:has-text('Auction')")).toHaveCount(0);
  });

  test("unauthenticated access to store products API returns 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/store/products`);
    expect([401, 403]).toContain(res.status());
  });
});
