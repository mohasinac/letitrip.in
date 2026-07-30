import { test, expect } from "@playwright/test";
import { loginAsSeller, gotoAndWait } from "./_setup";

test.describe("Seller Dashboard Basics — UC-S2, UC-S3, UC-S4", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page);
  });

  test("seller products page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("seller orders page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("seller storefront settings page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/storefront");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("seller products page shows only standard listings", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    const main = page.getByRole("main").first();
    await expect(main).toBeVisible();
    // Auction tabs should NOT appear in the page's main content (FEATURE_AUCTIONS=false)
    // Scope to tabs specifically to avoid footer/nav "Auctions" links
    await expect(main.locator("[role='tab']:has-text('Auction')")).toHaveCount(0);
  });
});
