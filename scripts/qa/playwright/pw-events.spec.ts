import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

test.describe("Events — P4", () => {
  test("admin events page renders with heading", async ({ page }) => {
    await loginAsAdmin(page);
    const eventsRes = await page.request.get(`${BASE_URL}/api/admin/events`);
    expect(eventsRes.status(), "Events API must be available — check FEATURE_EVENTS flag").toBe(200);
    await gotoAndWait(page, "/admin/events");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin events nav link is attached in DOM", async ({ page }) => {
    await loginAsAdmin(page);
    const eventsRes = await page.request.get(`${BASE_URL}/api/admin/events`);
    expect(eventsRes.status(), "Events API must be available").toBe(200);
    await gotoAndWait(page, "/admin");
    await expect(page.locator('a[href*="/admin/events"]').first()).toBeAttached();
  });

  test("admin can create and delete a sale event via API", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const createRes = await page.request.post(`${BASE_URL}/api/admin/events`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        type: "sale",
        title: "E2E Test Sale Event",
        description: "Created by pw-events.spec.ts",
        startsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        saleConfig: { discountPercent: 15, bannerText: "15% off this week!" },
      },
    });

    expect(createRes.status(), "Events API must be available").toBe(201);
    const body = await createRes.json() as { ok: boolean; data: { id: string; type: string; status: string } };
    expect(body.ok).toBe(true);
    expect(body.data.type).toBe("sale");
    expect(body.data.status).toBe("draft");

    if (body.data.id) {
      await page.request.delete(`${BASE_URL}/api/admin/events/${body.data.id}`, {
        headers: { Cookie: cookieHeader },
      });
    }
  });

  test("public events listing page renders with heading", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/events`);
    expect(res.status(), "Events public API must be available").toBe(200);
    await gotoAndWait(page, "/events");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("active event detail page shows heading and does not show error", async ({ page }) => {
    const listRes = await page.request.get(`${BASE_URL}/api/events?status=active&pageSize=1`);
    expect(listRes.status(), "Events public API must be available").toBe(200);
    const body = await listRes.json() as { data: { items: { id: string; title: string }[] } };
    const first = body.data?.items?.[0];
    expect(first?.id, "At least one active event must be seeded").toBeTruthy();

    await gotoAndWait(page, `/events/${first!.id}`);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=/something went wrong|error 500/i").first()).toHaveCount(0);
  });

  test("non-existent event slug shows 404", async ({ page }) => {
    await page.goto("/events/event-does-not-exist-xyz-999");
    await expect(page.locator("text=/404|not found/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated user cannot access admin events API", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/events`);
    expect([401, 403]).toContain(res.status());
  });
});
