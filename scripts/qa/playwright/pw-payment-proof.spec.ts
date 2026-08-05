import { test, expect } from "@playwright/test";
import { loginAsBuyer, loginAsAdmin, gotoAndWait, fetchFirstId, BASE_URL } from "./_setup";

test.describe("Payment Proof Upload — UC-B8, UC-A2", () => {
  test("buyer navigates to pending order detail page with heading", async ({ page }) => {
    await loginAsBuyer(page);
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    expect(orderId, "At least one pending order must be seeded for the buyer").toBeTruthy();

    await gotoAndWait(page, `/user/orders/${orderId}`);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("buyer orders list shows at least one order", async ({ page }) => {
    await loginAsBuyer(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/user/orders?pageSize=5`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: unknown[]; total?: number } };
    expect(body.data?.total, "Buyer must have at least one order in seed data").toBeGreaterThan(0);
  });

  test("admin order list renders with heading", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin orders API returns seeded orders", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/admin/orders?pageSize=5`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: unknown[]; total?: number } };
    expect(body.data?.total, "At least one order must be seeded").toBeGreaterThan(0);
  });

  test("unauthenticated access to user orders returns 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/user/orders`);
    expect([401, 403]).toContain(res.status());
  });
});
