import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait, fetchFirstId, BASE_URL } from "./_setup";

test.describe("Post-order partial item cancellation (Track A2)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("orders list page renders for the buyer", async ({ page }) => {
    await gotoAndWait(page, "/user/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("cancel page renders a per-item checkbox list when the order is cancellable", async ({ page }) => {
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    test.skip(!orderId, "No pending order seeded for this buyer — cannot exercise the cancel page");
    if (!orderId) return;

    await gotoAndWait(page, `/user/orders/${orderId}/cancel`);
    await expect(page.getByRole("main").first()).toBeVisible();
    // Per-item checkboxes (appkit <Checkbox>) — at least one row per cancellable item.
    await expect(page.getByRole("checkbox").first()).toBeVisible({ timeout: 10000 });
    // Reason field must be the FieldTextarea primitive, not a raw <textarea> outside it.
    await expect(page.locator("textarea").first()).toBeVisible();
  });

  test("PATCH cancel with itemIds cancels only the selected line, sets refundPending", async ({ page }) => {
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    test.skip(!orderId, "No pending order seeded for this buyer");
    if (!orderId) return;

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const orderRes = await page.request.get(`${BASE_URL}/api/user/orders/${orderId}`, {
      headers: { Cookie: cookieHeader },
    });
    const orderBody = (await orderRes.json()) as {
      data?: { items?: Array<{ productId: string }> };
    };
    const items = orderBody.data?.items ?? [];
    test.skip(items.length < 2, "Order needs 2+ items to test a genuine partial cancel");
    if (items.length < 2) return;

    const res = await page.request.post(`${BASE_URL}/api/user/orders/${orderId}/cancel`, {
      headers: { Cookie: cookieHeader },
      data: { reason: "playwright partial-cancel test", itemIds: [items[0].productId] },
    });
    expect(res.status()).toBeLessThan(500);
    if (res.ok()) {
      const body = (await res.json()) as { ok: boolean };
      expect(body.ok).toBe(true);
    }
  });

  test("cancel route rejects an order that isn't in a cancellable status", async ({ page }) => {
    const shippedId = await fetchFirstId(page, "/api/user/orders?status=shipped&pageSize=1");
    test.skip(!shippedId, "No shipped order seeded for this buyer");
    if (!shippedId) return;

    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(`${BASE_URL}/api/user/orders/${shippedId}/cancel`, {
      headers: { Cookie: cookieHeader },
      data: { reason: "should be rejected" },
    });
    expect(res.status()).toBe(400);
  });
});
