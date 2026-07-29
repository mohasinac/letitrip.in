import { test, expect } from "@playwright/test";
import { loginAsBuyer, loginAsAdmin, gotoAndWait, fetchFirstId } from "./_setup";
import path from "path";

test.describe("Payment Proof Upload — UC-B8, UC-A2", () => {
  test("buyer navigates to payment page for a pending order", async ({ page }) => {
    await loginAsBuyer(page);
    // Find a pending order
    const orderId = await fetchFirstId(page, "/api/user/orders?status=pending&pageSize=1");
    if (!orderId) {
      test.skip(true, "No pending orders in seed data");
      return;
    }
    await gotoAndWait(page, `/orders/${orderId}/payment`);
    // Page should show UPI instructions or payment form
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("text=/step 1|payment|upi/i").first()).toBeVisible({ timeout: 8000 });
  });

  test("payment page redirects if order is already paid", async ({ page }) => {
    await loginAsBuyer(page);
    const orderId = await fetchFirstId(page, "/api/user/orders?paymentStatus=paid&pageSize=1");
    if (!orderId) {
      test.skip(true, "No paid orders in seed data");
      return;
    }
    await gotoAndWait(page, `/orders/${orderId}/payment`);
    // Should show "already verified" message
    await expect(page.locator("text=/verified|already paid/i")).toBeVisible({ timeout: 8000 });
  });

  test("admin order list is accessible", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin/orders");
    await expect(page.getByRole("main")).toBeVisible();
    // At least the heading should be there
    await expect(page.locator("[role='heading'], h1, h2").first()).toBeVisible({ timeout: 8000 });
  });
});
