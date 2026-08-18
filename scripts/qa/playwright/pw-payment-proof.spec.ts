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

test.describe("Tier PP — 15-min payment window, two-tier review, OTP gate", () => {
  test("payment-proof submission without the fraud agreement checkbox is rejected", async ({ page }) => {
    await loginAsBuyer(page);
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    expect(orderId, "At least one pending order must be seeded for the buyer").toBeTruthy();

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(`${BASE_URL}/api/orders/${orderId}/payment-proof`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { proofUrl: "/media/proof-test.jpg", buyerFraudAgreementAccepted: false },
    });
    expect(res.status()).toBe(400);
    const body = await res.json() as { code?: string };
    expect(body.code).toBe("AGREEMENT_NOT_ACCEPTED");
  });

  test("admin payment-reupload route rejects a request with no reason", async ({ page }) => {
    await loginAsAdmin(page);
    const orderId = await fetchFirstId(page, "/api/admin/orders?pageSize=1");
    expect(orderId, "At least one order must be seeded").toBeTruthy();

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.patch(`${BASE_URL}/api/admin/orders/${orderId}/payment-reupload`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { note: "" },
    });
    expect(res.status()).toBe(400);
  });

  test("admin payment-reject-fraud route requires admin/moderator auth", async ({ page }) => {
    const res = await page.request.patch(`${BASE_URL}/api/admin/orders/nonexistent/payment-reject-fraud`, {
      headers: { "Content-Type": "application/json" },
      data: { note: "test" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("dispute route rejects a missing reason", async ({ page }) => {
    await loginAsBuyer(page);
    const orderId = await fetchFirstId(page, "/api/user/orders?pageSize=1");
    expect(orderId, "At least one order must be seeded").toBeTruthy();

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(`${BASE_URL}/api/orders/${orderId}/dispute`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { reason: "" },
    });
    expect(res.status()).toBe(400);
  });
});
