import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Events — P4", () => {
  test("admin events page is accessible", async ({ page }) => {
    await loginAsAdmin(page);
    const eventsRes = await page.request.get(`${BASE_URL}/api/admin/events`);
    if (eventsRes.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/admin/events");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin events nav group visible when feature enabled", async ({ page }) => {
    await loginAsAdmin(page);
    const eventsRes = await page.request.get(`${BASE_URL}/api/admin/events`);
    if (eventsRes.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/admin");
    const navLink = page.getByRole("link", { name: /events/i }).first();
    await expect(navLink).toBeVisible();
  });

  test("admin can create a sale event via API", async ({ page }) => {
    await loginAsAdmin(page);
    const createRes = await page.request.post(`${BASE_URL}/api/admin/events`, {
      data: {
        type: "sale",
        title: "E2E Test Sale Event",
        description: "Created by pw-events.spec.ts",
        startsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        saleConfig: { discountPercent: 15, bannerText: "15% off this week!" },
      },
    });
    if (createRes.status() === 404) {
      test.skip();
      return;
    }
    expect(createRes.status()).toBe(201);
    const body = await createRes.json() as { ok: boolean; data: { id: string; type: string; status: string } };
    expect(body.ok).toBe(true);
    expect(body.data.type).toBe("sale");
    expect(body.data.status).toBe("draft");

    // Clean up
    if (body.data.id) {
      await page.request.delete(`${BASE_URL}/api/admin/events/${body.data.id}`);
    }
  });

  test("public events listing page renders", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/events`);
    if (res.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/events");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("active event detail page renders", async ({ page }) => {
    const listRes = await page.request.get(`${BASE_URL}/api/events?status=active&pageSize=1`);
    if (listRes.status() === 404) {
      test.skip();
      return;
    }
    const body = await listRes.json() as { data: { items: { id: string }[] } };
    const firstId = body.data?.items?.[0]?.id;
    if (!firstId) {
      test.skip();
      return;
    }
    await gotoAndWait(page, `/events/${firstId}`);
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("unauthenticated user cannot access admin events API", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/events`);
    expect([401, 404]).toContain(res.status());
  });

  test("user events page accessible when logged in", async ({ page }) => {
    await loginAsAdmin(page);
    const eventsRes = await page.request.get(`${BASE_URL}/api/events`);
    if (eventsRes.status() === 404) {
      test.skip();
      return;
    }
    await gotoAndWait(page, "/user/events");
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
