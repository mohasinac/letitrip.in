import { test, expect } from "@playwright/test";
import { loginAsSeller, gotoAndWait } from "./_setup";

test.describe("Seller Dashboard Basics — UC-S2, UC-S3, UC-S4", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page);
  });

  test("seller products page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("[role='heading'], h1").first()).toBeVisible({ timeout: 8000 });
  });

  test("seller orders page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/orders");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("seller store settings page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/store/settings");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("seller products page shows only standard listings", async ({ page }) => {
    await gotoAndWait(page, "/store/products");
    // Auction and pre-order tabs should not be visible when FEATURE_AUCTIONS=false
    await expect(page.locator("text=/auction/i")).not.toBeVisible({ timeout: 3000 });
  });
});
