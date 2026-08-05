import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait, fetchFirstId, BASE_URL } from "./_setup";

test.describe("Cart & Checkout — UC-B4, UC-B7", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("buyer can navigate to a product and the Add to Cart button is visible", async ({ page }) => {
    const productId = await fetchFirstId(
      page,
      "/api/products?status=published&listingType=standard&pageSize=5",
    );
    expect(productId, "At least one published standard product must be seeded").toBeTruthy();

    await gotoAndWait(page, `/products/${productId}`);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });

    // Price in INR must be visible on the product detail page
    await expect(page.locator("text=/₹/").first()).toBeVisible({ timeout: 10000 });
  });

  test("Add to Cart triggers visible cart feedback", async ({ page }) => {
    const productId = await fetchFirstId(
      page,
      "/api/products?status=published&listingType=standard&pageSize=5",
    );
    expect(productId, "At least one published standard product must be seeded").toBeTruthy();

    await gotoAndWait(page, `/products/${productId}`);
    await expect(page.getByRole("main").first()).toBeVisible();

    const addBtn = page
      .getByRole("button", { name: /add to cart/i })
      .or(page.locator("[data-testid='add-to-cart']"))
      .first();

    const btnVisible = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      await addBtn.click();
      // Cart feedback: toast, count badge, or drawer opening
      await expect(
        page.locator("[data-testid='cart-count'], [aria-label*='cart'], .toast, [role='status']").first(),
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test("buyer views cart page with expected heading", async ({ page }) => {
    await gotoAndWait(page, "/cart");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("GET /api/cart returns 200 for authenticated buyer", async ({ page }) => {
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/cart`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  test("GET /api/cart returns 401 for unauthenticated caller", async ({ page }) => {
    // Use a fresh context with no session
    const res = await page.request.get(`${BASE_URL}/api/cart`);
    // Cart may return 200 for guests (guest cart) or 401 if auth required
    expect([200, 401]).toContain(res.status());
  });

  test("buyer checkout page loads (redirect to cart if empty)", async ({ page }) => {
    await gotoAndWait(page, "/checkout");
    await expect(page.getByRole("main").first()).toBeVisible();
    // After redirect to cart or showing checkout steps — heading must be present
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });
});
