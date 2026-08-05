import { test, expect } from "@playwright/test";
import { gotoAndWait, BASE_URL } from "./_setup";

test.describe("Customer Browse — UC-B1, B2, B3", () => {
  test("homepage loads with main heading", async ({ page }) => {
    await gotoAndWait(page, "/");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("products listing page shows seeded product cards", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/products?status=published&pageSize=5`);
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: { id: string }[] } };
    expect(body.data?.items?.length, "At least one published product must be seeded").toBeGreaterThan(0);

    await gotoAndWait(page, "/products");
    const cards = page.locator("a[href*='/products/product-'], a[href*='/products/auction-']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("search by keyword 'pokemon' returns results or empty state", async ({ page }) => {
    await gotoAndWait(page, "/products?q=pokemon");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
    // Must not show a crash/error page
    await expect(page.locator("text=/something went wrong|error 500/i").first()).toHaveCount(0);
  });

  test("filter by category=trading-cards renders without error", async ({ page }) => {
    await gotoAndWait(page, "/products?category=trading-cards");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("product detail page shows title and price", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/products?status=published&pageSize=1`);
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: { id: string; title: string }[] } };
    const first = body.data?.items?.[0];
    expect(first?.id, "At least one published product must be seeded").toBeTruthy();

    await gotoAndWait(page, `/products/${first!.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=/₹/").first()).toBeVisible({ timeout: 10000 });
  });

  test("non-existent product slug shows 404", async ({ page }) => {
    await page.goto("/products/product-does-not-exist-xyz-999");
    await expect(page.locator("text=/404|not found/i").first()).toBeVisible({ timeout: 10000 });
  });
});
