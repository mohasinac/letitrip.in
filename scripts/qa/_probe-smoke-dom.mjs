import { chromium } from "playwright";

const routes = [
  "/products",
  "/auctions",
  "/search/pokemon/tab/products/sort/relevance/page/1",
  "/promotions/deals",
  "/faqs/general",
  "/cart",
  "/seller/products/new",
];

const b = await chromium.launch({ headless: true });
const p = await b.newPage();

for (const r of routes) {
  await p.goto(`http://localhost:3000${r}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(1000);
  const text = (await p.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 360);
  const counts = {
    h1: await p.locator("h1").count(),
    buttons: await p.locator("button").count(),
    links: await p.locator("a").count(),
    inputs: await p.locator("input").count(),
    tabRole: await p.locator("[role='tab']").count(),
    tabLike: await p.locator("a[href*='/tab/'], [data-testid*='tab'], [data-section*='tab']").count(),
    pagination: await p.locator("a[href*='/page/'], button:has-text('Next'), button:has-text('Previous')").count(),
    filterLike: await p.locator("button:has-text('Filter'), [aria-label*='filter' i], [data-testid*='filter']").count(),
    sortLike: await p.locator("button:has-text('Sort'), select, [role='combobox'], [data-testid*='sort']").count(),
    uploadLike: await p.locator("input[type='file'], button:has-text('Upload'), label:has-text('Upload')").count(),
    recoverableError: await p.locator(":text('Recoverable Error'), [role='dialog']:has-text('Hydration')").count(),
  };

  console.log(`\nROUTE ${r} URL ${p.url()}`);
  console.log("COUNTS", counts);
  console.log("TEXT", text);
}

await b.close();
