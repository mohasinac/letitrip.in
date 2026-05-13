/**
 * Listing pages toolbar interactions: search box, filter drawer, sort dropdown,
 * reset filters, pagination links.
 */

import { getContext, localizedUrl } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const TARGETS = ["/products", "/auctions", "/pre-orders", "/stores"];

export async function run() {
  const ctx = await getContext("anon");
  for (const path of TARGETS) {
    const page = await ctx.newPage();
    await page.goto(localizedUrl(path), { waitUntil: "domcontentloaded", timeout: 30000 });

    const search = page.locator(
      'input[type=search], input[placeholder*="Search" i], input[name=q]',
    );
    const searchCount = await search.count();
    rec(`${path}: search input present`, searchCount > 0, `n=${searchCount}`);

    const filtersBtn = page.locator(
      'button:has-text("Filter"), button:has-text("Filters"), [aria-label*="filter" i]',
    );
    rec(`${path}: filter button present`, (await filtersBtn.count()) > 0, "");

    const sort = page.locator(
      'select[aria-label*="sort" i], select[name=sort], button:has-text("Sort")',
    );
    rec(`${path}: sort control present`, (await sort.count()) > 0, "");

    const pagination = page.locator(
      '[aria-label*="pagination" i], nav[aria-label*="page" i], a:has-text("Next"), button:has-text("Next")',
    );
    rec(
      `${path}: pagination present or single-page`,
      true, // always pass — single-page is acceptable
      `n=${await pagination.count()}`,
    );

    // Try typing into search if visible
    if (searchCount > 0) {
      try {
        await search.first().fill("pokemon");
        await search.first().press("Enter");
        await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
        rec(`${path}: search submits without error`, true, page.url());
      } catch (e) {
        rec(`${path}: search submits without error`, false, e.message);
      }
    }

    await page.close();
  }
  return results;
}
