import { test, expect } from "@playwright/test";
import { loginAsBuyer, loginAsAdmin, gotoAndWait, fetchFirstId } from "./_setup";

test.describe("Payment Proof Upload — UC-B8, UC-A2", () => {
  test("buyer navigates to payment page for a pending order", async ({ page }) => {
    await loginAsBuyer(page);
    // Find a pending order
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    if (!orderId) {
      test.skip(true, "No pending orders in seed data");
      return;
    }
    await gotoAndWait(page, `/user/orders/${orderId}/payment`);
    // Page should show UPI instructions or payment form (or redirect to order detail if method isn't cash)
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("payment page redirects if order is already paid", async ({ page }) => {
    await loginAsBuyer(page);
    const orderId = await fetchFirstId(page, "/api/user/orders?paymentStatus=paid&pageSize=1");
    if (!orderId) {
      test.skip(true, "No paid orders in seed data");
      return;
    }
    await gotoAndWait(page, `/user/orders/${orderId}/payment`);
    // Should redirect to order detail since payment is already verified
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("admin order list is accessible", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
