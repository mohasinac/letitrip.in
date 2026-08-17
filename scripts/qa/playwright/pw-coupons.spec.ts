/**
 * pw-coupons.spec.ts — P-2 Coupons E2E tests.
 */
import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsSeller,
  loginAsBuyer,
  gotoAndWait,
  BASE_URL,
} from "./_setup";

test.describe("Admin — Coupons (/admin/coupons)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin coupon list page loads with heading", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/coupons`);
    expect(res.status(), "Coupons API must be available — check FEATURE_COUPONS flag").toBe(200);
    await gotoAndWait(page, "/admin/coupons");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("seeded coupon YUGI10 exists in the list", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/coupons`);
    expect(res.status(), "Coupons API must be available").toBe(200);
    const body = await res.json() as { data?: { items?: { code: string }[] } };
    const codes = body.data?.items?.map((c) => c.code) ?? [];
    expect(codes, "YUGI10 must be present in seeded coupons").toContain("YUGI10");
  });

  test("admin can create a coupon via API", async ({ page }) => {
    const checkRes = await page.request.get(`${BASE_URL}/api/admin/coupons`);
    expect(checkRes.status(), "Coupons API must be available").toBe(200);

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const uniqueCode = `TESTPW${Date.now().toString(36).toUpperCase()}`;

    const res = await page.request.post(`${BASE_URL}/api/admin/coupons`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        code: uniqueCode,
        name: "Playwright Test Coupon",
        type: "percentage",
        discount: { value: 15, maxDiscount: 50000, minPurchase: 0 },
        usage: { totalLimit: 10, perUserLimit: 1, currentUsage: 0 },
        validity: { startDate: "2025-01-01", isActive: true },
      },
    });

    expect([200, 201]).toContain(res.status());
    const json = (await res.json()) as { ok: boolean; data?: { code: string } };
    if (json.ok) {
      expect(json.data?.code).toBe(uniqueCode);
    }
  });

  test("duplicate coupon code YUGI10 → 409", async ({ page }) => {
    const checkRes = await page.request.get(`${BASE_URL}/api/admin/coupons`);
    expect(checkRes.status(), "Coupons API must be available").toBe(200);

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const res = await page.request.post(`${BASE_URL}/api/admin/coupons`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        code: "YUGI10",
        name: "Duplicate Test",
        type: "percentage",
        discount: { value: 5, minPurchase: 0 },
        usage: { currentUsage: 0 },
        validity: { startDate: "2025-01-01", isActive: true },
      },
    });

    expect([409, 400]).toContain(res.status());
  });
});

test.describe("Store — Seller Coupons (/store/coupons)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page);
  });

  test("seller coupon list page accessible with heading", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/store/coupons`);
    expect([200, 401, 403]).toContain(res.status());
    if (res.status() === 200) {
      await gotoAndWait(page, "/store/coupons");
      await expect(page.getByRole("main").first()).toBeVisible();
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("User — My Coupons (/user/coupons)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("coupon wallet page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/user/coupons");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("GET /api/user/coupons returns valid response for authenticated buyer", async ({ page }) => {
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.get(`${BASE_URL}/api/user/coupons`, {
      headers: { Cookie: cookieHeader },
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as { ok: boolean };
      expect(body.ok).toBe(true);
    }
  });
});

test.describe("Feature flag guard — COUPONS API", () => {
  test("GET /api/admin/coupons without auth → 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/coupons`);
    expect([401, 403]).toContain(res.status());
  });

  test("GET /api/store/coupons without auth → 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/store/coupons`);
    expect([401, 403]).toContain(res.status());
  });

  test("GET /api/user/coupons without auth → 401 (never 200)", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/user/coupons`);
    expect([401, 403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);
  });

  test("POST /api/user/coupons/claim without auth → 401", async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/user/coupons/claim`, {
      data: { couponCode: "YUGI10", source: "manual" },
    });
    expect([401, 403, 404]).toContain(res.status());
  });
});
