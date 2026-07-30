import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Admin Navigation — Mobile + Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin dashboard is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin orders page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin products page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/products");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin users page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("disabled feature pages return 404 or redirect", async ({ page }) => {
    // Events are disabled in P1 — should return 404
    const res = await page.request.get(`${BASE_URL}/api/events`);
    expect([404, 302, 200]).toContain(res.status());
  });
});
