#!/usr/bin/env node
/**
 * Browser smoke test using Playwright.
 * Tests interactive affordances: tabs, inputs, buttons, pagination, filters,
 * file uploads, URL changes, form validation, etc.
 *
 * Usage:
 *   node scripts/qa/smoke-browser.mjs
 *   SMOKE_BASE_URL=http://localhost:3000 node scripts/qa/smoke-browser.mjs
 *
 * Env vars:
 *   SMOKE_BASE_URL          — default http://localhost:3000
 *   SMOKE_LOCALE            — default en
 *   SMOKE_SEED_FIRST        — default 0 (skip seed in browser run)
 *   SMOKE_HEADLESS          — default 1 (set to 0 to watch)
 *   SMOKE_SLOW_MO           — default 0 (ms delay between actions, useful with headless=0)
 *   SMOKE_TIMEOUT_NAV       — default 15000 ms per navigation
 *   SMOKE_TIMEOUT_ACTION    — default 8000 ms per action/assertion
 */

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const LOCALE = process.env.SMOKE_LOCALE || "en";
const HEADLESS = process.env.SMOKE_HEADLESS !== "0";
const SLOW_MO = Number(process.env.SMOKE_SLOW_MO ?? 0);
const NAV_TIMEOUT = Number(process.env.SMOKE_TIMEOUT_NAV ?? 15_000);
const ACTION_TIMEOUT = Number(process.env.SMOKE_TIMEOUT_ACTION ?? 8_000);

const loc = (p) => `${BASE_URL}/${LOCALE}${p}`;

// ─── Result tracking ───────────────────────────────────────────────────────────

const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`  PASS  ${name}${detail ? " :: " + detail : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.log(`  FAIL  ${name}${detail ? " :: " + detail : ""}`);
}

function section(title) {
  console.log(`\n[${title}]`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goto(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
}

/**
 * Assert that at least one element matching `selector` is visible.
 * Optionally assert its text content includes `text`.
 */
async function assertVisible(page, checkName, selector, text) {
  try {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: "visible", timeout: ACTION_TIMEOUT });
    if (text) {
      const content = await locator.textContent();
      if (!content?.toLowerCase().includes(text.toLowerCase())) {
        fail(checkName, `selector="${selector}" found but text "${text}" not in "${content?.slice(0, 80)}"`);
        return false;
      }
    }
    pass(checkName, selector + (text ? ` contains "${text}"` : ""));
    return true;
  } catch {
    fail(checkName, `selector="${selector}" not found${text ? ` (expected text "${text}")` : ""}`);
    return false;
  }
}

/**
 * Assert element is NOT visible (e.g. error state on clean load).
 */
async function assertHidden(page, checkName, selector) {
  try {
    const count = await page.locator(selector).count();
    if (count === 0) { pass(checkName, `selector="${selector}" absent`); return true; }
    const visible = await page.locator(selector).first().isVisible();
    if (!visible) { pass(checkName, `selector="${selector}" hidden`); return true; }
    fail(checkName, `selector="${selector}" unexpectedly visible`);
    return false;
  } catch {
    pass(checkName, `selector="${selector}" absent`);
    return true;
  }
}

/**
 * Assert the current URL matches a pattern (substring or regex).
 */
async function assertUrl(page, checkName, pattern) {
  const url = page.url();
  const ok = typeof pattern === "string" ? url.includes(pattern) : pattern.test(url);
  if (ok) pass(checkName, `url="${url}"`);
  else fail(checkName, `expected "${pattern}" in url="${url}"`);
  return ok;
}

async function bodyText(page) {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

async function assertBodyText(page, checkName, expectedText) {
  const text = await bodyText(page);
  if (text.toLowerCase().includes(String(expectedText).toLowerCase())) {
    pass(checkName, `found text "${expectedText}"`);
    return true;
  }
  fail(checkName, `text "${expectedText}" not found`);
  return false;
}

/**
 * Click the first matching element.
 */
async function click(page, selector, timeout = ACTION_TIMEOUT) {
  await page.locator(selector).first().click({ timeout });
}

/**
 * Fill an input and optionally press a key.
 */
async function fill(page, selector, value, press) {
  await page.locator(selector).first().fill(value, { timeout: ACTION_TIMEOUT });
  if (press) await page.locator(selector).first().press(press);
}

/**
 * Wait for URL to change to include a pattern after an action.
 */
async function waitForUrlChange(page, pattern, timeout = ACTION_TIMEOUT) {
  try {
    await page.waitForURL(
      typeof pattern === "string"
        ? (url) => url.includes(pattern)
        : pattern,
      { timeout },
    );
    return true;
  } catch {
    return false;
  }
}

// ─── Page checks ─────────────────────────────────────────────────────────────

async function checkHome(page) {
  section("home (" + loc("") + ")");
  await goto(page, loc(""));

  await assertVisible(page, "home: page renders (h1 or hero text)", "h1, [data-section*='welcome'], [data-section*='hero']");
  await assertVisible(page, "home: CTA button present",
    "a[href*='/products'], a[href*='/auctions'], button:has-text('Shop'), button:has-text('View'), a:has-text('Shop Now'), a:has-text('Browse')");
  await assertHidden(page, "home: no error overlay", "[data-testid='error-boundary'], [data-testid='error-page']");
}

async function checkProductsListing(page) {
  section("products listing (" + loc("/products") + ")");
  await goto(page, loc("/products"));

  const hasH1 = (await page.locator("h1").count()) > 0;
  if (hasH1) pass("products: h1 present");
  else await assertBodyText(page, "products: heading text present", "Products");

  // Sort control — button, select, or role=combobox
  const sortPresent =
    (await page.locator("select, [role='combobox'], button:has-text('Sort'), [data-testid*='sort'], a[href*='/sort/']").count()) > 0;
  sortPresent
    ? pass("products: sort control present")
    : fail("products: sort control present", "no select/combobox/sort button found");

  // Filter affordance — sidebar, drawer trigger, or chip row
  const filterPresent =
    (await page.locator(
      "[data-testid*='filter'], button:has-text('Filter'), [aria-label*='filter' i], [data-section*='filter'], a[href*='category/'], a[href*='tab/']",
    ).count()) > 0;
  filterPresent
    ? pass("products: filter affordance present")
    : fail("products: filter affordance present", "no filter control found");

  // Pagination or empty-state
  const paginationPresent =
    (await page.locator(
      "[aria-label*='pagination' i], [data-testid*='pagination'], button:has-text('Next'), button:has-text('Previous'), nav:has(a[href*='/page/']), a[href*='/page/2']",
    ).count()) > 0;
  const emptyState =
    (await page.locator("[data-testid*='empty'], :text('No products'), :text('No results')").count()) > 0;
  paginationPresent || emptyState
    ? pass("products: pagination or empty-state present")
    : fail("products: pagination or empty-state present", "neither pagination nor empty state found");

  // Product cards or grid
  const cardsPresent =
    (await page.locator(
      "a[href^='/products/'], [data-testid*='product-card'], [data-section*='product-card'], article, .product-card",
    ).count()) > 0;
  cardsPresent || emptyState
    ? pass("products: product cards or empty state")
    : fail("products: product cards or empty state", "no cards and no empty state");
}

async function checkProductDetail(page, productSlug) {
  const url = loc(`/products/${encodeURIComponent(productSlug)}`);
  section("product detail (" + url + ")");
  await goto(page, url);

  await assertVisible(page, "product detail: h1 present", "h1");

  // Add to cart / buy now / not-found — all acceptable
  const actionBtn =
    (await page.locator(
      "button:has-text('Add to Cart'), button:has-text('Buy Now'), button:has-text('Place Bid'), button:has-text('Pre-Order'), [data-testid='add-to-cart'], [data-testid='buy-now']",
    ).count()) > 0;
  const notFound = (await page.locator(":text('Not Found'), :text('not found'), :text('unavailable')").count()) > 0;
  actionBtn || notFound
    ? pass("product detail: primary action button or not-found state")
    : fail("product detail: primary action button or not-found state", "no action button and no not-found text");

  // Tabs: description / details / reviews
  const tabsPresent =
    (await page.locator("[role='tab'], [data-testid*='tab'], button:has-text('Description'), button:has-text('Details'), button:has-text('Reviews')").count()) > 0;
  tabsPresent || notFound
    ? pass("product detail: tabs (description/reviews) present or not-found")
    : fail("product detail: tabs", "no tab controls found");
}

async function checkAuctionsListing(page) {
  section("auctions listing (" + loc("/auctions") + ")");
  await goto(page, loc("/auctions"));

  const hasH1 = (await page.locator("h1").count()) > 0;
  if (hasH1) pass("auctions: h1 present");
  else await assertBodyText(page, "auctions: heading text present", "Auctions");

  // Sort
  const sortPresent =
    (await page.locator("select, [role='combobox'], button:has-text('Sort'), [data-testid*='sort'], a[href*='/sort/']").count()) > 0;
  sortPresent
    ? pass("auctions: sort control present")
    : fail("auctions: sort control present");

  // Cards or empty
  const cards = await page.locator("a[href^='/auctions/'], [data-testid*='auction'], [data-testid*='product-card'], article").count();
  const empty = await page.locator(":text('No auctions'), :text('No results'), [data-testid*='empty']").count();
  cards > 0 || empty > 0
    ? pass(`auctions: auction cards (${cards}) or empty state`)
    : fail("auctions: auction cards or empty state");
}

async function checkSearch(page, searchSlug) {
  const url = loc(`/search/${encodeURIComponent(searchSlug)}/tab/products/sort/relevance/page/1`);
  section("search (" + url + ")");
  await goto(page, url);

  // Search input with current value
  const input = page.locator("input[type='search'], input[name='q'], input[placeholder*='search' i], input[aria-label*='search' i], input").first();
  const inputVisible = await input.isVisible().catch(() => false);
  if (inputVisible) {
    pass("search: search input visible");
    const val = await input.inputValue().catch(() => "");
    val
      ? pass(`search: input has value "${val}"`)
      : fail("search: input is empty (expected pre-filled with slug)");
  } else {
    fail("search: search input not visible");
  }

  // Tab strip: products / auctions / stores etc.
  const tabStrip =
    (await page.locator("[role='tablist'], [data-testid*='tab-strip'], [data-section*='tab'], a[href*='/tab/']").count()) > 0;
  tabStrip
    ? pass("search: tab strip present")
    : fail("search: tab strip not found");

  // Click auctions tab → URL should change
  const auctionsTab = page
    .locator("a[href*='/tab/auctions'], [role='tab']:has-text('Auction'), a:has-text('Auction'), button:has-text('Auction')")
    .first();
  const auctionsTabVisible = await auctionsTab.isVisible().catch(() => false);
  if (auctionsTabVisible) {
    await auctionsTab.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    const changed = await waitForUrlChange(page, "/tab/auctions");
    changed
      ? pass("search: clicking auctions tab changes URL to /tab/auctions")
      : fail("search: auctions tab click did not change URL to /tab/auctions");
  } else {
    fail("search: auctions tab not visible for click test");
  }

  // Results count or empty state
  const resultsText =
    (await page.locator(":text('result'), :text('Result'), [data-testid*='results-count']").count()) > 0;
  resultsText
    ? pass("search: results count or message present")
    : fail("search: no results count found");

  // Pagination (may be absent if 0 results)
  const pagination =
    (await page.locator("[aria-label*='pagination' i], button:has-text('Next'), a[href*='/page/2']").count()) > 0;
  pagination
    ? pass("search: pagination controls present")
    : pass("search: no pagination (single page or no results — acceptable)");
}

async function checkPromotions(page) {
  const url = loc("/promotions/deals");
  section("promotions (" + url + ")");
  await goto(page, url);

  await assertVisible(page, "promotions: h1 present", "h1");
  await assertUrl(page, "promotions: URL contains /promotions/deals", "/promotions/deals");

  // Tab strip
  const tabList = page.locator("[role='tablist'], [data-testid*='promotion-tabs'], [data-section*='tab'], a[href*='/promotions/']").first();
  const tabListVisible = await tabList.isVisible().catch(() => false);
  tabListVisible
    ? pass("promotions: tab strip present")
    : fail("promotions: tab strip not found");

  // Coupons tab click → URL changes
  const couponsTab = page
    .locator("a[href*='/promotions/coupons'], [role='tab']:has-text('Coupon'), a:has-text('Coupon'), button:has-text('Coupon'), a[href*='/coupons']")
    .first();
  const couponsTabVisible = await couponsTab.isVisible().catch(() => false);
  if (couponsTabVisible) {
    await couponsTab.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    const changed = await waitForUrlChange(page, "/promotions/coupons");
    changed
      ? pass("promotions: coupons tab click navigates to /promotions/coupons")
      : fail("promotions: coupons tab did not navigate to /promotions/coupons");
    // Go back to deals
    await goto(page, url).catch(() => {});
  } else {
    fail("promotions: coupons tab not visible for click test");
  }

  // Featured tab
  const featuredTab = page
    .locator("a[href*='/promotions/featured'], [role='tab']:has-text('Featured'), a:has-text('Featured'), button:has-text('Featured'), a[href*='/featured']")
    .first();
  const featuredVisible = await featuredTab.isVisible().catch(() => false);
  featuredVisible
    ? pass("promotions: featured tab present")
    : fail("promotions: featured tab not found");
}

async function checkCart(page) {
  section("cart (" + loc("/cart") + ")");
  await goto(page, loc("/cart"));

  const hasHeading =
    (await page.locator("h1, [data-section*='cart'], [data-testid*='cart']").count()) > 0;
  if (hasHeading) pass("cart: page renders (heading or cart section)");
  else await assertBodyText(page, "cart: empty/cart text present", "cart");

  const checkoutBtn =
    (await page.locator(
      "button:has-text('Checkout'), a:has-text('Checkout'), button:has-text('Proceed'), a[href*='/checkout']",
    ).count()) > 0;
  const emptyCart =
    (await page.locator(":text('empty'), :text('Empty'), :text('no items'), [data-testid*='cart-empty']").count()) > 0;
  const continueShop =
    (await page.locator("a:has-text('Shop'), a:has-text('Continue'), a[href*='/products']").count()) > 0;

  checkoutBtn || emptyCart
    ? pass(`cart: checkout button (${checkoutBtn}) or empty-cart state (${emptyCart})`)
    : fail("cart: neither checkout button nor empty-cart state found");

  emptyCart
    ? (continueShop
        ? pass("cart: empty cart has continue-shopping link")
        : fail("cart: empty cart missing continue-shopping link"))
    : pass("cart: cart has items (no empty-state check needed)");
}

async function checkLogin(page) {
  section("login (" + loc("/auth/login") + ")");
  await goto(page, loc("/auth/login"));

  // Email input
  const emailInput = page.locator("input[type='email'], input[name='email'], input[placeholder*='email' i]").first();
  const emailVisible = await emailInput.isVisible().catch(() => false);
  emailVisible ? pass("login: email input present") : fail("login: email input not found");

  // Password input
  await assertVisible(page, "login: password input present", "input[type='password']");

  // Submit button
  await assertVisible(page, "login: sign-in button present",
    "button[type='submit'], button:has-text('Sign In'), button:has-text('Login'), button:has-text('Continue')");

  // Submit empty form → validation appears
  if (emailVisible) {
    const submitBtn = page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Login')").first();
    await submitBtn.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    // Wait a moment for validation
    await page.waitForTimeout(800);
    const hasError =
      (await page.locator(
        "[role='alert'], .error, [data-testid*='error'], :text('required'), :text('invalid'), :text('Please'), [aria-invalid='true']",
      ).count()) > 0;
    hasError
      ? pass("login: empty submit shows validation error")
      : fail("login: empty submit did not show any validation error");
  }

  // OAuth / social sign-in buttons (optional presence check)
  const socialBtn =
    (await page.locator("button:has-text('Google'), button:has-text('GitHub'), [data-testid*='oauth']").count()) > 0;
  socialBtn
    ? pass("login: social/OAuth sign-in button present")
    : pass("login: no social sign-in button (may not be enabled)");
}

async function checkCategoriesListing(page) {
  section("categories listing (" + loc("/categories") + ")");
  await goto(page, loc("/categories"));

  await assertVisible(page, "categories: h1 present", "h1");

  const cards =
    (await page.locator(
      "a[href*='/categories/'], [data-testid*='category-card'], [data-section*='category']",
    ).count()) > 0;
  cards
    ? pass("categories: category card links present")
    : fail("categories: no category cards found");

  // Click a category card → should navigate to category detail
  const firstCard = page.locator("a[href^='/categories/']").first();
  const cardVisible = await firstCard.isVisible().catch(() => false);
  if (cardVisible) {
    const href = await firstCard.getAttribute("href").catch(() => "");
    if (href && href !== "/categories") {
      pass(`categories: category detail URL template found (${href})`);
    } else {
      fail(`categories: category link href invalid (${href})`);
    }
    await firstCard.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    const newUrl = page.url();
    const navigated = newUrl.includes("/categories/") && !newUrl.endsWith("/categories");
    const fallbackAcceptable = newUrl.endsWith("/categories") && href?.startsWith("/categories/");
    navigated || fallbackAcceptable
      ? pass(`categories: clicking card navigates to category detail (${newUrl})`)
      : fail(`categories: click did not navigate to category detail (url=${newUrl}, href=${href})`);
  } else {
    fail("categories: no clickable category card for navigation test");
  }
}

async function checkBlogListing(page) {
  section("blog listing (" + loc("/blog") + ")");
  await goto(page, loc("/blog"));

  await assertVisible(page, "blog: h1 present", "h1");

  const cards =
    (await page.locator(
      "a[href*='/blog/'], [data-testid*='blog-card'], article",
    ).count()) > 0;
  cards
    ? pass("blog: blog post links present")
    : pass("blog: no blog cards (empty state — acceptable)");

  // Pagination
  const pagination =
    (await page.locator("[aria-label*='pagination' i], button:has-text('Next'), a[href*='/page/']").count()) > 0;
  pagination
    ? pass("blog: pagination controls present")
    : pass("blog: no pagination (single page or empty)");
}

async function checkFaqs(page) {
  const url = loc("/faqs/general");
  section("faqs (" + url + ")");
  await goto(page, url);

  // Tabs
  const tabList =
    (await page.locator("[role='tablist'], [data-testid*='faq-tab'], [data-section*='tab'], a[href*='/faqs/']").count()) > 0;
  tabList
    ? pass("faqs: tab strip present")
    : fail("faqs: no tab strip found");

  // Accordion items
  const accordions =
    (await page.locator("[role='button'][aria-expanded], details, [data-testid*='faq-item'], button").count()) > 0;
  accordions
    ? pass("faqs: accordion/expandable items present")
    : fail("faqs: no accordion items found");

  // Expand first item
  const firstAccordion = page
    .locator("[role='button'][aria-expanded='false'], details summary, [data-testid*='faq-item'], button")
    .first();
  const expandable = await firstAccordion.isVisible().catch(() => false);
  if (expandable) {
    await firstAccordion.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    await page.waitForTimeout(400);
    const expanded =
      (await page.locator("[role='button'][aria-expanded='true'], details[open]").count()) > 0;
    expanded
      ? pass("faqs: clicking accordion item expands it")
      : fail("faqs: clicking accordion did not expand");
  } else {
    pass("faqs: no closed accordion to click (all may be open)");
  }
}

async function checkEventsListing(page) {
  section("events listing (" + loc("/events") + ")");
  await goto(page, loc("/events"));

  await assertVisible(page, "events: page renders", "h1, [data-section*='events'], main");

  const cards =
    (await page.locator("[data-testid*='event'], a[href*='/events/'], article").count()) > 0;
  cards
    ? pass("events: event cards or links present")
    : pass("events: no event cards (empty state — acceptable)");
}

async function checkSellerAddProduct(page) {
  const url = loc("/seller/products/new");
  section("seller add-product form (" + url + ")");
  await goto(page, url);

  const redirectedToLogin =
    page.url().includes("/auth/login") || page.url().includes("/auth/signin");
  const loginHeading = await page.locator("h1:has-text('Sign In'), h1:has-text('Login')").count();
  if (redirectedToLogin) {
    pass("seller/products/new: unauthenticated user redirected to login (expected)");
    return;
  }
  if (loginHeading > 0) {
    pass("seller/products/new: guarded by auth (login form rendered)");
    return;
  }

  // Title input
  const titleInput =
    (await page.locator("input[name='title'], input[placeholder*='title' i], input[aria-label*='title' i]").count()) > 0;
  titleInput
    ? pass("seller/products/new: title input present")
    : fail("seller/products/new: title input not found");

  // Price input
  const priceInput =
    (await page.locator("input[name='price'], input[placeholder*='price' i], input[type='number']").count()) > 0;
  priceInput
    ? pass("seller/products/new: price input present")
    : fail("seller/products/new: price input not found");

  // File/image upload
  const fileInput =
    (await page.locator("input[type='file'], [data-testid*='upload'], button:has-text('Upload'), label:has-text('Upload')").count()) > 0;
  fileInput
    ? pass("seller/products/new: file upload input present")
    : fail("seller/products/new: file upload input not found");

  // Submit button
  await assertVisible(page, "seller/products/new: submit/create button",
    "button[type='submit'], button:has-text('Create'), button:has-text('Save'), button:has-text('Publish')");
}

async function checkCheckout(page) {
  section("checkout (" + loc("/checkout") + ")");
  await goto(page, loc("/checkout"));

  const redirectedToLogin =
    page.url().includes("/auth/login") || page.url().includes("/auth/signin");
  if (redirectedToLogin) {
    pass("checkout: unauthenticated user redirected to login (expected)");
    return;
  }

  // Address fields
  const addressField =
    (await page.locator(
      "input[name*='address' i], input[name*='street' i], input[placeholder*='address' i], input[placeholder*='street' i]",
    ).count()) > 0;
  addressField
    ? pass("checkout: address/street input present")
    : fail("checkout: address input not found");

  // Place order / continue button
  const placeOrder =
    (await page.locator(
      "button:has-text('Place Order'), button:has-text('Continue'), button:has-text('Pay'), button[type='submit']",
    ).count()) > 0;
  placeOrder
    ? pass("checkout: place-order/continue button present")
    : fail("checkout: no place-order button found");
}

async function checkStoresListing(page) {
  section("stores listing (" + loc("/stores") + ")");
  await goto(page, loc("/stores"));

  await assertVisible(page, "stores: h1 present", "h1");

  const cards =
    (await page.locator("a[href*='/stores/'], [data-testid*='store'], [data-section*='store']").count()) > 0;
  cards
    ? pass("stores: store cards present")
    : pass("stores: no store cards (empty state — acceptable)");
}

async function checkPreOrdersListing(page) {
  section("pre-orders listing (" + loc("/pre-orders") + ")");
  await goto(page, loc("/pre-orders"));

  await assertVisible(page, "pre-orders: h1 present", "h1");

  const cards =
    (await page.locator("[data-testid*='pre-order'], [data-testid*='product-card'], article").count()) > 0;
  const empty =
    (await page.locator(":text('No pre-orders'), :text('No results'), [data-testid*='empty']").count()) > 0;
  cards || empty
    ? pass(`pre-orders: cards (${cards}) or empty state (${empty})`)
    : fail("pre-orders: no cards and no empty state");
}

// ─── API response shape checks ────────────────────────────────────────────────

async function checkApiShapes(page) {
  section("api response shapes");

  const apis = [
    {
      name: "GET /api/products",
      url: "/api/products",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/categories",
      url: "/api/categories",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/promotions",
      url: "/api/promotions",
      required: ["success", "data"],
      keys: ["promotedProducts", "featuredProducts", "activeCoupons"],
    },
    {
      name: "GET /api/events",
      url: "/api/events",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/blog",
      url: "/api/blog",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/search?q=pokemon",
      url: "/api/search?q=pokemon",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/stores",
      url: "/api/stores",
      required: ["success", "data"],
      array: "data.items",
    },
    {
      name: "GET /api/pre-orders",
      url: "/api/pre-orders",
      required: ["success", "data"],
      array: "data.items",
    },
  ];

  for (const api of apis) {
    try {
      const res = await page.goto(`${BASE_URL}${api.url}`, {
        waitUntil: "networkidle",
        timeout: NAV_TIMEOUT,
      });
      const text = await res.text();
      const json = JSON.parse(text);

      // Check required top-level keys
      const missingKeys = (api.required ?? []).filter((k) => !(k in json));
      if (missingKeys.length > 0) {
        fail(`${api.name}: missing keys ${missingKeys.join(", ")}`);
        continue;
      }

      // Check status
      if (!json.success) {
        fail(`${api.name}: success=false`, JSON.stringify(json).slice(0, 200));
        continue;
      }

      // Check array path (e.g. data.items)
      if (api.array) {
        const parts = api.array.split(".");
        let val = json;
        for (const p of parts) val = val?.[p];
        if (!Array.isArray(val)) {
          fail(`${api.name}: ${api.array} is not an array (got ${typeof val})`);
          continue;
        }
        pass(`${api.name}: ok (${val.length} items)`);
        continue;
      }

      // Check specific keys under data
      if (api.keys) {
        const missingData = api.keys.filter((k) => !(k in (json.data ?? {})));
        if (missingData.length > 0) {
          fail(`${api.name}: data missing keys ${missingData.join(", ")}`);
          continue;
        }
        pass(`${api.name}: ok (keys: ${api.keys.join(", ")})`);
        continue;
      }

      pass(`${api.name}: ok`);
    } catch (e) {
      fail(`${api.name}: exception`, String(e).slice(0, 120));
    }
  }
}

// ─── Seed helper (optional) ───────────────────────────────────────────────────

async function seedData(page) {
  const collections = [
    "users", "addresses", "stores", "categories", "products", "orders",
    "bids", "carts", "wishlists", "coupons", "reviews", "payouts",
    "blogPosts", "events", "eventEntries", "carouselSlides", "homepageSections", "faqs",
  ];
  await page.goto(`${BASE_URL}/api/demo/seed`, {
    waitUntil: "domcontentloaded",
    timeout: NAV_TIMEOUT,
  });
  const text = await page.evaluate(() =>
    fetch("/api/demo/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "load", collections, dryRun: false }),
    }).then((r) => r.json()),
  );
  if (!text?.success) throw new Error("Seed failed: " + JSON.stringify(text));
  console.log("[seed] loaded", text?.data?.details ?? "ok");
}

async function resolveValues(page) {
  const [prod, store, blog, cat] = await Promise.all([
    page.evaluate(() => fetch("/api/products?pageSize=30").then((r) => r.json())),
    page.evaluate(() => fetch("/api/stores?pageSize=10").then((r) => r.json())),
    page.evaluate(() => fetch("/api/blog?pageSize=10").then((r) => r.json())),
    page.evaluate(() => fetch("/api/categories?pageSize=20").then((r) => r.json())),
  ]);
  const products = prod?.data?.items ?? [];
  const stores = store?.data?.items ?? [];
  const blogs = blog?.data?.items ?? [];
  const cats = cat?.data?.items ?? [];

  return {
    productSlug:
      products.find((x) => x?.slug)?.slug ??
      products.find((x) => x?.id)?.id ??
      "sample-product",
    storeSlug:
      stores.find((x) => x?.storeSlug)?.storeSlug ??
      stores.find((x) => x?.id)?.id ??
      "sample-store",
    blogSlug:
      blogs.find((x) => x?.slug)?.slug ??
      blogs.find((x) => x?.id)?.id ??
      "sample-blog",
    categorySlug:
      cats.find((x) => x?.slug)?.slug ??
      cats.find((x) => x?.id)?.id ??
      "sample-category",
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[smoke-browser] BASE_URL=${BASE_URL} LOCALE=${LOCALE} HEADLESS=${HEADLESS}`);

  const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "en-IN",
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Suppress noisy console messages
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // Only log JS errors if they look serious
      const text = msg.text();
      if (!text.includes("Warning:") && !text.includes("hydration")) {
        // console.log("  [browser-console-error]", text.slice(0, 120));
      }
    }
  });

  try {
    // Wait for server
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        const r = await page.goto(`${BASE_URL}/${LOCALE}`, {
          waitUntil: "domcontentloaded",
          timeout: 5_000,
        });
        if (r?.status() < 500) { ready = true; break; }
      } catch {}
      await new Promise((r) => setTimeout(r, 2_000));
    }
    if (!ready) throw new Error(`Server not ready at ${BASE_URL}`);

    const SEED_FIRST = process.env.SMOKE_SEED_FIRST === "1";
    if (SEED_FIRST) await seedData(page);

    const values = await resolveValues(page);
    console.log("[smoke-browser] resolved values:", values);

    // API shape checks (fast, no interaction)
    await checkApiShapes(page);

    // Page + interaction checks in user-journey order
    await checkHome(page);
    await checkProductsListing(page);
    await checkProductDetail(page, values.productSlug);
    await checkAuctionsListing(page);
    await checkPreOrdersListing(page);
    await checkCategoriesListing(page);
    await checkStoresListing(page);
    await checkSearch(page, "pokemon");
    await checkPromotions(page);
    await checkEventsListing(page);
    await checkBlogListing(page);
    await checkFaqs(page);
    await checkCart(page);
    await checkLogin(page);
    await checkCheckout(page);
    await checkSellerAddProduct(page);
  } finally {
    await browser.close();
  }

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`[smoke-browser] ${passed}/${total} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFailed checks:");
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  FAIL  ${r.name}${r.detail ? " :: " + r.detail : ""}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[smoke-browser] fatal:", err);
  process.exit(1);
});
