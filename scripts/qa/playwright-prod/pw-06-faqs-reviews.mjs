/**
 * FAQ accordion expand, reviews page renders, search results render.
 */

import { getContext, localizedUrl } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("anon");

  // FAQs accordion
  {
    const page = await ctx.newPage();
    await page.goto(localizedUrl("/faqs/general"), { waitUntil: "domcontentloaded", timeout: 30000 });

    // FAQ items have details/summary, or button with aria-expanded
    const trigger = page.locator(
      'summary, [aria-expanded], button[aria-controls]',
    );
    const triggerCount = await trigger.count();
    rec("faq triggers present", triggerCount > 0, `n=${triggerCount}`);

    if (triggerCount > 0) {
      const first = trigger.first();
      const before = await first.getAttribute("aria-expanded").catch(() => null);
      await first.click({ trial: false }).catch(() => {});
      await page.waitForTimeout(400);
      const after = await first.getAttribute("aria-expanded").catch(() => null);
      // either aria-expanded changed, or details element became open
      const detailsOpen = await page.locator("details[open]").count();
      rec(
        "faq accordion expands",
        (before !== after && (after === "true" || detailsOpen > 0)) || detailsOpen > 0,
        `before=${before} after=${after} detailsOpen=${detailsOpen}`,
      );
    }
    await page.close();
  }

  // Reviews tab on a product
  {
    const page = await ctx.newPage();
    const productList = await fetch(
      `${(await import("../prod-suites/_fixtures.mjs")).BASE_URL}/api/products?pageSize=1&listingType=standard`,
    ).then((r) => r.json());
    const pid = productList?.data?.items?.[0]?.id;
    if (pid) {
      await page.goto(localizedUrl(`/products/${pid}`), {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      const reviewsBlock = page.locator(
        ':text("Review"), :text("Reviews"), [data-section*=review i]',
      );
      rec(
        `product detail mentions reviews`,
        (await reviewsBlock.count()) > 0,
        pid,
      );
    } else {
      rec(`product detail mentions reviews`, false, "no product");
    }
    await page.close();
  }

  // Search page renders results
  {
    const page = await ctx.newPage();
    await page.goto(localizedUrl("/search/dark+magician/tab/products/sort/relevance/page/1"), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const cards = await page.locator('a[href*="/products/"], article, [data-card]').count();
    rec("search results render", cards > 0, `n=${cards}`);
    await page.close();
  }

  return results;
}
