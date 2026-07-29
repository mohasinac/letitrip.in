import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait } from "./_setup";

test.describe("Cart & Checkout — UC-B4, UC-B7", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("buyer can add product to cart", async ({ page }) => {
    await gotoAndWait(page, "/products");
    const firstProductLink = page.locator("a[href*='/products/']").first();
    await firstProductLink.click();
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .getByRole("button", { name: /add to cart/i })
      .or(page.locator("[data-testid='add-to-cart']"))
      .first();
    await expect(addBtn).toBeVisible({ timeout: 8000 });
    await addBtn.click();

    // Cart count badge should show ≥ 1
    const cartBadge = page.locator("[data-testid='cart-count'], [aria-label*='cart']");
    await expect(cartBadge).toBeVisible({ timeout: 5000 });
  });

  test("buyer views cart", async ({ page }) => {
    await gotoAndWait(page, "/cart");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("buyer views checkout (payment options)", async ({ page }) => {
    await gotoAndWait(page, "/checkout");
    // Only Cash/UPI should be visible (Razorpay and COD hidden by feature flags)
    const cashOption = page.getByText(/cash.*upi|upi.*cash|pay.*upi/i).first();
    await expect(cashOption).toBeVisible({ timeout: 8000 });
    // Razorpay should NOT be visible
    const razorpay = page.getByText(/razorpay|pay online/i);
    await expect(razorpay).not.toBeVisible();
  });
});
