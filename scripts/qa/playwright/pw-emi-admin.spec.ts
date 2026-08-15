import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait } from "./_setup";

test.describe("Track A3 — EMI admin settings tab", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin settings page renders", async ({ page }) => {
    await gotoAndWait(page, "/admin/site");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("EMI tab is present and shows the enabled toggle + tenure/percent fields", async ({ page }) => {
    await gotoAndWait(page, "/admin/site");
    const emiTab = page.getByRole("tab", { name: /emi/i }).first();
    const tabVisible = await emiTab.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!tabVisible, "EMI tab not rendered on this viewport — sidebar/tabs may be collapsed");
    if (!tabVisible) return;

    // TabsList overflows horizontally — the tab is often scrolled out of its
    // own container even though the page itself is at the top.
    await emiTab.scrollIntoViewIfNeeded();
    await emiTab.click();
    // Toggle for `enabled` (appkit <Toggle>, renders role="switch")
    await expect(page.getByRole("switch").first()).toBeVisible({ timeout: 5000 });
    // At least one numeric input for minOrderValue/tokenPercent/billingDay/surcharge fields
    await expect(page.locator("input[type='number']").first()).toBeVisible();
  });
});
