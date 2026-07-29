import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait } from "./_setup";

test.describe("Wishlist — UC-B10", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("buyer views wishlist page", async ({ page }) => {
    await gotoAndWait(page, "/wishlist");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.locator("text=/wishlist|saved/i").first()
    ).toBeVisible({ timeout: 8000 });
  });

  test("wishlist page has filter controls", async ({ page }) => {
    await gotoAndWait(page, "/wishlist");
    // Filter drawer trigger should be present
    const filterBtn = page
      .getByRole("button", { name: /filter/i })
      .or(page.locator("[data-testid='filter-btn']"))
      .first();
    await expect(filterBtn).toBeVisible({ timeout: 8000 });
  });

  test("bulk actions appear when items are selected", async ({ page }) => {
    await gotoAndWait(page, "/wishlist");
    // Select a wishlist item card via checkbox if any items exist
    const checkbox = page.locator("[data-testid='card-checkbox'], input[type='checkbox']").first();
    const itemCount = await checkbox.count();
    if (itemCount === 0) {
      test.skip(true, "No wishlist items in seed data for this user");
      return;
    }
    await checkbox.check();
    // Bulk action buttons should appear
    await expect(
      page.getByRole("button", { name: /remove selected|add to cart/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
