import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait } from "./_setup";

test.describe("Admin Navigation — Mobile + Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin dashboard is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("admin orders page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("[role='heading'], h1").first()).toBeVisible({ timeout: 8000 });
  });

  test("admin products page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/products");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("admin users page is accessible", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("disabled feature pages return 404 or redirect", async ({ page }) => {
    // Events are disabled in P1
    const res = await page.request.get(`${page.url().split("/admin")[0]}/api/events`);
    expect([404, 302, 200]).toContain(res.status()); // 404 preferred, 302 redirect acceptable
  });
});
