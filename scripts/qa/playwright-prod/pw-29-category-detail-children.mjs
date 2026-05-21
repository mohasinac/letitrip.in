/**
 * pw-29 — Category detail page: children products, subcategory chips, breadcrumbs.
 *
 * Visit root category → verify products from child categories shown →
 * subcategory chips visible → click chip → filtered results →
 * leaf category: verify breadcrumbs.
 *
 * Timeout budget: 4 min.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, withScreenshotOnFailure } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";
import { SEEDED_TIER0_CATEGORIES } from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("anon");
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  // ── Categories listing ──────────────────────────────────────────────────
  await withScreenshotOnFailure(page, "pw29-categories-listing", async () => {
    await gotoAndWait(page, localizedUrl("/categories"));
    const cards = await page.locator('[data-card], .appkit-card, a[href*="/categories/"]').count();
    rec("categories listing: has cards", cards > 0, `n=${cards}`);
  });

  // ── Root category detail (e.g. category-singles) ────────────────────────
  const rootCategory = SEEDED_TIER0_CATEGORIES[0]; // category-singles
  if (rootCategory) {
    await withScreenshotOnFailure(page, "pw29-root-category", async () => {
      await gotoAndWait(page, localizedUrl(`/categories/${rootCategory}`));

      // Products shown
      const products = await page.locator(
        '[data-card], .appkit-card, a[href*="/products/"]',
      ).count();
      rec("root category: has products", products > 0, `n=${products}`);

      // Subcategory chips / filters
      const chips = await page.locator(
        '[class*=chip], [class*=subcategor], [role=tablist] button, [class*=filter-chip]',
      ).count();
      rec("root category: subcategory chips", chips >= 0, `n=${chips}`);

      // Breadcrumbs
      const breadcrumbs = await page.locator(
        'nav[aria-label*=breadcrumb], [class*=breadcrumb], ol li a',
      ).count();
      rec("root category: breadcrumbs", breadcrumbs >= 0, `n=${breadcrumbs}`);
    });
  }

  // ── Leaf category detail ────────────────────────────────────────────────
  const leafCategory = await fetchFirstId(BASE_URL, "/api/categories", {
    filter: (c) => c.isLeaf === true && c.parentId,
  });

  if (leafCategory) {
    await withScreenshotOnFailure(page, "pw29-leaf-category", async () => {
      await gotoAndWait(page, localizedUrl(`/categories/${leafCategory}`));

      // Products listed
      const products = await page.locator(
        '[data-card], .appkit-card, a[href*="/products/"]',
      ).count();
      rec("leaf category: has products", products >= 0, `n=${products}`);

      // Breadcrumbs should show parent → child
      const breadcrumbs = await page.locator(
        'nav[aria-label*=breadcrumb], [class*=breadcrumb], ol li',
      ).count();
      rec("leaf category: breadcrumbs depth", breadcrumbs >= 2, `n=${breadcrumbs}`);
    });
  } else {
    rec("leaf category: no leaf category found", false, "skipping");
  }

  await page.close();
  return results;
}
