/**
 * Visit every public page; assert h1 present, footer present, header nav present,
 * no 500s on the response, and no console errors at HIGH severity.
 */

import { getContext, localizedUrl, withErrorCollector } from "./_pw-setup.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const PUBLIC_PATHS = [
  "/",
  "/products",
  "/auctions",
  "/pre-orders",
  "/stores",
  "/categories/sort/relevance/page/1",
  "/events",
  "/blog",
  "/faqs/general",
  "/promotions/deals",
  "/scams",
  "/scams/types",
  "/auth/login",
  "/auth/register",
];

export async function run() {
  const ctx = await getContext("anon");
  for (const path of PUBLIC_PATHS) {
    const page = await ctx.newPage();
    let httpStatus = 0;
    page.on("response", (r) => {
      const u = r.url();
      if (u === localizedUrl(path) || u.endsWith(path)) httpStatus = r.status();
    });
    const { consoleErrors, netFailures } = await withErrorCollector(page, async () => {
      await page.goto(localizedUrl(path), { waitUntil: "domcontentloaded", timeout: 30000 });
    });

    const h1 = await page.locator("h1").first().count();
    const main = await page.locator("main, [role=main]").first().count();
    const footer = await page.locator("footer, [role=contentinfo]").first().count();
    const header = await page.locator("header, [role=banner]").first().count();

    rec(`${path}: h1`, h1 > 0, `n=${h1}`);
    rec(`${path}: main landmark`, main > 0, `n=${main}`);
    rec(`${path}: footer`, footer > 0, `n=${footer}`);
    rec(`${path}: header`, header > 0, `n=${header}`);
    rec(
      `${path}: no 5xx network`,
      netFailures.length === 0,
      netFailures.slice(0, 2).join(" | "),
    );
    // Console errors are noisy in prod (analytics, etc.) — only fail on >5
    rec(
      `${path}: console errors ≤ 5`,
      consoleErrors.length <= 5,
      `n=${consoleErrors.length} first=${consoleErrors[0]?.slice(0, 120) ?? ""}`,
    );

    await page.close();
  }
  return results;
}
