import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Admin Navigation — Mobile + Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin dashboard is accessible and shows dashboard heading", async ({ page }) => {
    await gotoAndWait(page, "/admin");
    await expect(page.getByRole("main").first()).toBeVisible();
    // Dashboard must show a heading — not an error page
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin orders page renders orders table or empty state", async ({ page }) => {
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
    // Either a table or an "empty" message — never a crash
    await expect(
      page.locator("table, [data-testid='empty-state'], h1, h2").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("admin products page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/admin/products");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin users page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin sidebar has expected nav links", async ({ page }) => {
    await gotoAndWait(page, "/admin");
    // Core nav links must be attached in DOM (sidebar may be collapsed on narrow viewports)
    await expect(page.locator('a[href*="/admin/orders"]').first()).toBeAttached();
    await expect(page.locator('a[href*="/admin/products"]').first()).toBeAttached();
    await expect(page.locator('a[href*="/admin/users"]').first()).toBeAttached();
  });

  test("unauthenticated access to admin API returns 401", async ({ page }) => {
    // New page without admin session
    const res = await page.request.get(`${BASE_URL}/api/admin/users`);
    expect([401, 403]).toContain(res.status());
  });
});
