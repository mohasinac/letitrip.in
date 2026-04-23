import { chromium } from "playwright";

const b = await chromium.launch({ headless: true });
const p = await b.newPage();

// Quick test of products page
await p.goto("http://localhost:3000/en/products", { waitUntil: "domcontentloaded", timeout: 15000 });
const h1 = await p.locator("h1").count();
const sort = await p.locator("select, [role='combobox'], button:has-text('Sort'), [data-testid*='sort'], a[href*='/sort/']").count();
const filter = await p.locator("[data-testid*='filter'], button:has-text('Filter'), [aria-label*='filter' i], [data-section*='filter'], a[href*='category/'], a[href*='/tab/']").count();
const cards = await p.locator("a[href^='/products/'], [data-testid*='product-card'], [data-section*='product-card'], article, .product-card").count();

console.log("Products page: h1=" + h1 + " sort=" + sort + " filter=" + filter + " cards=" + cards);

await b.close();
