import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Wishlist — UC-B10", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("wishlist page renders with heading and wishlist label", async ({ page }) => {
    await gotoAndWait(page, "/wishlist");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("text=/wishlist|saved/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("GET /api/user/wishlist returns 200 for authenticated buyer", async ({ page }) => {
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/user/wishlist`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { ok: boolean; data?: { items?: unknown[] } };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data?.items)).toBe(true);
  });

  test("GET /api/user/wishlist without auth returns 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/user/wishlist`);
    expect([401, 403]).toContain(res.status());
    expect(res.status()).not.toBe(200);
  });

  test("wishlist filter button is present", async ({ page }) => {
    await gotoAndWait(page, "/wishlist");
    await expect(page.getByRole("main").first()).toBeVisible();
    const filterBtn = page
      .getByRole("button", { name: /filter/i })
      .or(page.locator("[data-testid='filter-btn']"))
      .first();
    await expect(filterBtn).toBeVisible({ timeout: 10000 });
  });

  test("bulk actions appear after selecting a wishlist item", async ({ page }) => {
    // First confirm there are wishlist items via API
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/user/wishlist`, {
      headers: { Cookie: cookieHeader },
    });
    const body = await res.json() as { data?: { items?: unknown[] } };
    expect(body.data?.items?.length, "Buyer must have at least one wishlist item in seed data").toBeGreaterThan(0);

    await gotoAndWait(page, "/wishlist");
    const checkbox = page.locator("[data-testid='card-checkbox'], input[type='checkbox']").first();
    await expect(checkbox).toBeVisible({ timeout: 10000 });
    await checkbox.check();
    await expect(
      page.getByRole("button", { name: /remove selected|add to cart/i }).first()
    ).toBeVisible({ timeout: 8000 });
  });
});
