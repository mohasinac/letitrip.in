import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Auctions — P5", () => {
  test("public auctions listing page renders with heading", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/products?listingType=auction&pageSize=1`);
    expect(res.status(), "Auctions API must be available — check seed data").toBe(200);
    await gotoAndWait(page, "/auctions");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("auction detail page renders with heading and price", async ({ page }) => {
    const listRes = await page.request.get(
      `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
    );
    expect(listRes.status(), "Auctions API must be available").toBe(200);
    const body = await listRes.json() as { data: { items: { id: string }[] } };
    const firstId = body.data?.items?.[0]?.id;
    expect(firstId, "At least one published auction must exist in seed data").toBeTruthy();

    await gotoAndWait(page, `/auctions/${firstId}`);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    // Price or current bid must be visible
    await expect(page.locator("text=/₹/").first()).toBeVisible({ timeout: 10000 });
  });

  test("auction detail page returns 404 for non-existent slug", async ({ page }) => {
    await page.goto("/auctions/auction-does-not-exist-xyz-999");
    // Either a Next.js 404 page or the app's not-found UI
    expect(page.url()).not.toMatch(/auction-does-not-exist-xyz-999.*error/);
    await expect(page.locator("text=/404|not found/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin bids page accessible and shows heading", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.get(`${BASE_URL}/api/admin/bids`);
    expect(res.status(), "Admin bids API must be available").toBe(200);
    await gotoAndWait(page, "/admin/bids");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated bid placement returns 401", async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/bids`, {
      data: { productId: "auction-test", amount: 100000 },
    });
    expect([401, 404]).toContain(res.status());
  });

  test("bid on a non-existent auction returns 404 or 422", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(`${BASE_URL}/api/bids`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { productId: "auction-does-not-exist-xyz", amount: 100000 },
    });
    expect([404, 422, 400]).toContain(res.status());
  });

  test("GET /api/bids/[id] returns bids array for a live auction", async ({ page }) => {
    const listRes = await page.request.get(
      `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
    );
    expect(listRes.status(), "Auctions API must be available").toBe(200);
    const body = await listRes.json() as { data: { items: { id: string }[] } };
    const auctionId = body.data?.items?.[0]?.id;
    expect(auctionId, "At least one published auction must exist in seed data").toBeTruthy();

    const bidsRes = await page.request.get(`${BASE_URL}/api/bids/${auctionId}?pageSize=5`);
    expect(bidsRes.status()).toBe(200);
    const bidsBody = await bidsRes.json() as { ok: boolean; data: { items: unknown[] } };
    expect(bidsBody.ok).toBe(true);
    expect(Array.isArray(bidsBody.data.items)).toBe(true);
  });

  test("bid below starting price returns 422", async ({ page }) => {
    await loginAsAdmin(page);
    const listRes = await page.request.get(
      `${BASE_URL}/api/products?listingType=auction&status=published&pageSize=1`,
    );
    expect(listRes.status(), "Auctions API must be available").toBe(200);
    const body = await listRes.json() as { data: { items: { id: string }[] } };
    const auctionId = body.data?.items?.[0]?.id;
    expect(auctionId, "At least one published auction must exist in seed data").toBeTruthy();

    const res = await page.request.post(`${BASE_URL}/api/bids`, {
      data: { productId: auctionId, amount: 1 },
    });
    expect([400, 422]).toContain(res.status());
  });
});
