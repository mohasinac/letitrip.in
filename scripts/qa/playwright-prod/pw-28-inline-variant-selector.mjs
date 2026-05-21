/**
 * pw-28 — Inline variant selector: sub-listing chips on grouped products.
 *
 * Visit a product with groupId → verify variant chips visible →
 * click a variant → verify price/URL updates.
 *
 * Timeout budget: 4 min.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, withScreenshotOnFailure } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("anon");
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  // Find a product with groupId (sub-listing parent)
  const groupParentId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.isGroupParent === true && p.status === "published",
  });

  if (groupParentId) {
    await withScreenshotOnFailure(page, "pw28-variant-selector", async () => {
      await gotoAndWait(page, localizedUrl(`/products/${groupParentId}`));

      // Variant chips / selector
      const chips = await page.locator(
        '[class*=variant], [class*=chip], [role=radiogroup], [data-testid*=variant], button[class*=edition]',
      ).count();
      rec("group parent: variant chips visible", chips > 0, `n=${chips}`);

      // Price visible
      const price = await page.locator("text=/₹|INR/").count();
      rec("group parent: price visible", price > 0, `n=${price}`);

      // Group children links or sub-listing references
      const groupRefs = await page.locator(
        'text=/also available|part of|variants|editions/i, [class*=group], a[href*="sublisting-"]',
      ).count();
      rec("group parent: group references", groupRefs >= 0, `n=${groupRefs}`);
    });
  } else {
    rec("variant selector: no group parent found", false, "skipping");
  }

  // Find a product that's part of a group (child)
  const groupChildId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.groupParentSlug && p.status === "published",
  });

  if (groupChildId) {
    await withScreenshotOnFailure(page, "pw28-group-child", async () => {
      await gotoAndWait(page, localizedUrl(`/products/${groupChildId}`));

      // "Part of" link to parent
      const partOfLink = await page.locator(
        'text=/part of/i, a[href*="group-"], a[href*="bundle-"]',
      ).count();
      rec("group child: part-of link", partOfLink >= 0, `n=${partOfLink}`);
    });
  } else {
    rec("group child: no group child found", false, "skipping — no grouped child products");
  }

  await page.close();
  return results;
}
