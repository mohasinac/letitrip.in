import { test, expect } from "@playwright/test";
import { loginAsBuyer, gotoAndWait } from "./_setup";

test.describe("P-16 Tour System — driver.js wiring", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page);
  });

  test("nav elements carry data-tour anchors for the tour steps", async ({ page }) => {
    await gotoAndWait(page, "/");
    await expect(page.getByRole("main").first()).toBeVisible();
    // At least one of the 4 anchored nav targets must be attached in the DOM.
    const anchors = page.locator(
      "[data-tour='nav-search'], [data-tour='nav-wishlist'], [data-tour='nav-cart'], [data-tour='nav-profile']",
    );
    await expect(anchors.first()).toBeAttached({ timeout: 10000 });
  });

  test("driver.js CSS/JS does not throw a client-side error on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await gotoAndWait(page, "/");
    await expect(page.getByRole("main").first()).toBeVisible();
    const driverErrors = errors.filter((e) => /driver/i.test(e));
    expect(driverErrors).toEqual([]);
  });
});
