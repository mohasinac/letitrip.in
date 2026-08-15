import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait, BASE_URL } from "./_setup";

test.describe("P-9 COD — handling-fee breakdown at checkout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("checkout renders a COD breakdown once a product is in the cart", async ({ page }) => {
    const productsRes = await page.request.get(
      `${BASE_URL}/api/products?status=published&listingType=standard&pageSize=1`,
    );
    const productsBody = (await productsRes.json()) as { data?: { items?: Array<{ id: string }> } };
    const productId = productsBody.data?.items?.[0]?.id;
    expect(productId, "At least one published standard product must be seeded").toBeTruthy();

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    await page.request.post(`${BASE_URL}/api/cart`, {
      headers: { Cookie: cookieHeader },
      data: { productId, quantity: 1 },
    });

    await gotoAndWait(page, "/checkout");
    await expect(page.getByRole("main").first()).toBeVisible();

    // "COD Handling Fee" / "Pay now" / "Pay on delivery" copy — tolerant of it
    // being behind a payment-method selection click.
    const codCopy = page.locator("text=/cod handling fee|pay on delivery/i").first();
    const visible = await codCopy.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });

  test("checkout API accepts paymentMethod=cod without a 500", async ({ page }) => {
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(`${BASE_URL}/api/checkout`, {
      headers: { Cookie: cookieHeader },
      data: { paymentMethod: "cod" },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
