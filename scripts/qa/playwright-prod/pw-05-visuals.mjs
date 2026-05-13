/**
 * Visual / asset checks: site logo, store banners, product images load,
 * watermark proxy in URLs.
 */

import { getContext, localizedUrl } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const ctx = await getContext("anon");
  const page = await ctx.newPage();

  // Homepage — logo + nav links + footer links
  await page.goto(localizedUrl("/"), { waitUntil: "domcontentloaded", timeout: 30000 });

  const logo = page.locator(
    'a[href="/"] img, a[href="/en"] img, [data-testid=site-logo], header svg',
  );
  rec("site logo present", (await logo.count()) > 0, "");

  // Top-level nav items (nav anchors anywhere in the layout shell)
  const navLinks = await page.locator("nav a, [role=navigation] a").count();
  rec("layout has nav links", navLinks >= 3, `n=${navLinks}`);

  // Footer links
  const footerLinks = await page.locator("footer a").count();
  rec("footer has links", footerLinks >= 3, `n=${footerLinks}`);

  // Hero / above-the-fold images load (skip lazy-loaded images that haven't entered viewport)
  const imgs = await page.locator("img:not([loading=lazy])").all();
  let totalImgs = imgs.length;
  let brokenImgs = 0;
  for (const img of imgs.slice(0, 12)) {
    const ok = await img.evaluate((el) => el.complete && el.naturalWidth > 0);
    if (!ok) brokenImgs++;
  }
  rec(
    `homepage eager images load (first 12)`,
    brokenImgs <= 1,
    `total=${totalImgs} broken=${brokenImgs}`,
  );

  // Store detail — banner
  const stores = await fetch(`${BASE_URL}/api/stores?pageSize=1`).then((r) => r.json());
  const storeSlug = stores?.data?.items?.[0]?.id;
  if (storeSlug) {
    await page.goto(localizedUrl(`/stores/${storeSlug}/products/sort/relevance/page/1`), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const banner = page.locator(
      'header img, [data-testid=store-banner], img[alt*=banner i], main img, img[src*="banner" i]',
    );
    const bannerCount = await banner.count();
    rec(`store banner present`, bannerCount > 0, `slug=${storeSlug} n=${bannerCount}`);
  } else {
    rec("store banner present", false, "no stores");
  }

  await page.close();
  return results;
}
