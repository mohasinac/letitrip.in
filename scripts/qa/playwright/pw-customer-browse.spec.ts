import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_setup";

test.describe("Customer Browse — UC-B1, B2, B3", () => {
  test("guest browses product catalogue", async ({ page }) => {
    await gotoAndWait(page, "/");
    // Homepage main content should be visible (use .first() — nested <main> on prod)
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("guest views products page with at least one product card", async ({ page }) => {
    await gotoAndWait(page, "/products");
    // Product cards render as <a href="…/products/…"> links
    const cards = page.locator("a[href*='/products/product-'], a[href*='/products/auction-']");
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
  });

  test("guest searches by keyword", async ({ page }) => {
    await gotoAndWait(page, "/products?q=pokemon");
    await expect(page.getByRole("main").first()).toBeVisible();
    // Page should not be an error page
    await expect(page.locator("h1, h2, [role='heading']").first()).toBeVisible({ timeout: 10000 });
  });

  test("guest filters by category via URL param", async ({ page }) => {
    await gotoAndWait(page, "/products?category=trading-cards");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("guest views product detail page", async ({ page }) => {
    // Navigate to products and click first product card
    await gotoAndWait(page, "/products");
    const firstCard = page
      .locator("a[href*='/products/product-'], a[href*='/products/auction-']")
      .first();
    const href = await firstCard.getAttribute("href");
    if (href) {
      await gotoAndWait(page, href);
      // Price should be visible on product detail (use .first() — multiple ₹ elements)
      await expect(page.locator("text=/₹/").first()).toBeVisible({ timeout: 10000 });
    }
  });
});
