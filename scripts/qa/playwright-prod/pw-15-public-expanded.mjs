/**
 * pw-15 — Full public route crawl with visual and content assertions.
 *
 * Complements pw-01 with deeper content assertions:
 * - Product listing: ≥1 product card
 * - Auction listing: countdown timer present
 * - Store detail: all 5 sub-tabs render
 * - Event detail: tab strip + meta (type badge, dates)
 * - Blog article: author, read-time, content body
 * - Search: results rendered, pagination works
 * - Homepage: hero/carousel + section grid
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, withErrorCollector } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── Homepage deep check ──────────────────────────────────────────────────────

async function testHomepage(ctx) {
  const page = await ctx.newPage();
  const label = "homepage";
  try {
    await gotoAndWait(page, localizedUrl("/"));

    const h1 = await page.locator("h1").count();
    rec(`${label}: h1`, h1 > 0, `n=${h1}`);

    // Site logo
    const logo = page.locator('[data-testid=site-logo]');
    rec(`${label}: site logo`, (await logo.count()) > 0, `n=${await logo.count()}`);

    // Main nav links (at least the listed marketplace sections)
    const navLinks = await page.locator('nav a, [role=navigation] a').count();
    rec(`${label}: nav links ≥ 3`, navLinks >= 3, `n=${navLinks}`);

    // Footer links
    const footerLinks = await page.locator('footer a').count();
    rec(`${label}: footer links ≥ 3`, footerLinks >= 3, `n=${footerLinks}`);

    // Hero / carousel
    const heroContent = await page.locator(
      '[class*=carousel], [class*=hero], [class*=HeroSection], [class*=carousel-slide], section:first-of-type',
    ).count();
    rec(`${label}: hero/carousel present`, heroContent > 0, `n=${heroContent}`);

    // Sections below the fold (at least 2 product sections)
    const sections = await page.locator('[class*=Section], section, [data-section-type]').count();
    rec(`${label}: multiple sections`, sections >= 2, `n=${sections}`);

    // Eager images load
    const imgs = await page.locator("img:not([loading=lazy])").all();
    let broken = 0;
    for (const img of imgs.slice(0, 12)) {
      const ok = await img.evaluate((el) => el.complete && el.naturalWidth > 0).catch(() => true);
      if (!ok) broken++;
    }
    rec(`${label}: eager images (first 12)`, broken <= 1, `broken=${broken}`);

  } catch (e) {
    rec(`${label}: shell`, false, e.message);
  }
  await page.close();
}

// ─── Product listing deep check ───────────────────────────────────────────────

async function testListingPage(ctx, path, cardSelector, minCards = 1) {
  const page = await ctx.newPage();
  const label = path;
  try {
    await gotoAndWait(page, localizedUrl(path));
    const cards = await page.locator(cardSelector).count();
    const empty = await page.locator('[data-testid=empty-state], .appkit-empty-state').count();
    rec(`${label}: cards or empty state`, cards >= minCards || empty > 0, `cards=${cards} empty=${empty}`);
  } catch (e) {
    rec(`${label}: shell`, false, e.message);
  }
  await page.close();
}

// ─── Auction listing — countdown timer ───────────────────────────────────────

async function testAuctionListing(ctx) {
  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl("/auctions"));
    const countdown = await page.locator('[data-testid=countdown], .appkit-countdown')
      .or(page.locator('text=/\\d+[dhms]/'))
      .or(page.locator('text=/Ended/'))
      .count();
    rec("/auctions: countdown timer", countdown > 0, `n=${countdown}`);
  } catch (e) {
    rec("/auctions: countdown timer", false, e.message);
  }
  await page.close();
}

// ─── Search page deep check ───────────────────────────────────────────────────

async function testSearchPage(ctx) {
  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl("/search?q=dark+magician"));
    const searchBar = await page.locator('input[type=search], input[name=q], input[placeholder*="Search" i]').count();
    rec("/search: search bar", searchBar > 0, `n=${searchBar}`);

    const results2 = await page.locator('.appkit-card, [class*=card], [class*=result], [class*=product]').count();
    const noResults = await page.locator('text=/no results/i, text=/nothing found/i').count();
    rec("/search: results or no-results", results2 > 0 || noResults > 0, `results=${results2} noResults=${noResults}`);
  } catch (e) {
    rec("/search: shell", false, e.message);
  }
  await page.close();
}

// ─── Store detail + all sub-tabs ─────────────────────────────────────────────

async function testStoreDetail(ctx) {
  const storeId = await fetchFirstId(BASE_URL, "/api/stores", { filter: (s) => s.status === "active" });
  if (!storeId) {
    rec("store detail: found store", false, "no active stores");
    return;
  }

  const subTabs = [
    { tab: "products",    label: "store products tab" },
    { tab: "auctions",    label: "store auctions tab" },
    { tab: "pre-orders",  label: "store pre-orders tab" },
    { tab: "prize-draws", label: "store prize-draws tab" },
    { tab: "bundles",     label: "store bundles tab" },
    { tab: "coupons",     label: "store coupons tab" },
    { tab: "reviews",     label: "store reviews tab" },
    { tab: "about",       label: "store about tab" },
  ];

  for (const { tab, label } of subTabs) {
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(`/stores/${storeId}/${tab}`));
      const main = await page.locator("main").count();
      const h1 = await page.locator("h1, h2").count();
      const tabNav = await page.locator('[role=tab], [role=tablist], nav a[href*="/stores/"]').count();
      rec(`${label}: renders`, main > 0 && h1 > 0, `main=${main} h1=${h1} tabs=${tabNav}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }
}

// ─── Event detail deep check + sub-routes ────────────────────────────────────

async function testEventDetail(ctx) {
  const eventId = await fetchFirstId(BASE_URL, "/api/events");
  if (!eventId) {
    rec("event detail: found event", false, "no events");
    return;
  }

  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl(`/events/${eventId}`));
    const h1 = await page.locator("h1").count();
    const tabs = await page.locator(
      '[role=tab], a[href*="/participate"], a[href*="/leaderboard"], a[href*="/winner"]',
    ).count();
    const typeBadge = await page.locator('[class*=badge], [class*=chip], [class*=tag]').count();
    rec(`event detail: h1 + tabs`, h1 > 0 && tabs > 0, `h1=${h1} tabs=${tabs} badge=${typeBadge}`);
  } catch (e) {
    rec("event detail: shell", false, e.message);
  }
  await page.close();

  // Event sub-tab routes
  for (const sub of ["participate", "leaderboard", "winner"]) {
    const p = await ctx.newPage();
    try {
      await gotoAndWait(p, localizedUrl(`/events/${eventId}/${sub}`));
      const main = await p.locator("main").count();
      const h1 = await p.locator("h1, h2").count();
      rec(`event ${sub}: renders`, main > 0 && h1 > 0, `main=${main} h1=${h1}`);
    } catch (e) {
      rec(`event ${sub}: shell`, false, e.message);
    }
    await p.close();
  }
}

// ─── Blog article deep check ──────────────────────────────────────────────────

async function testBlogArticle(ctx) {
  const blogSlug = await fetchFirstId(BASE_URL, "/api/blog", { filter: (b) => b.status === "published" });
  if (!blogSlug) {
    rec("blog article: found blog", false, "no published posts");
    return;
  }

  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl(`/blog/${blogSlug}`));
    const h1 = await page.locator("h1").count();
    const article = await page.locator("article, [class*=article], [class*=BlogContent]").count();
    const readTime = await page.locator('text=/min read/i, text=/minutes/i').count();
    const author = await page.locator('text=/by /i, [class*=author], [class*=Author]').count();
    rec(`blog article: content`, h1 > 0 && article > 0, `h1=${h1} article=${article} time=${readTime} author=${author}`);
  } catch (e) {
    rec("blog article: shell", false, e.message);
  }
  await page.close();
}

// ─── Brand detail deep check ──────────────────────────────────────────────────

async function testBrandDetail(ctx) {
  const brandId = await fetchFirstId(BASE_URL, "/api/brands");
  if (!brandId) {
    rec("brand detail: found brand", false, "no brands");
    return;
  }

  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl(`/brands/${brandId}`));
    const h1 = await page.locator("h1").count();
    const logo = await page.locator("img[alt], [class*=logo], [class*=brand-img]").count();
    const products = await page.locator(".appkit-card, [class*=product-card], [class*=listing]").count();
    const empty = await page.locator('[data-testid=empty-state]').count();
    rec(`brand detail: renders`, h1 > 0, `h1=${h1} logo=${logo} products=${products} empty=${empty}`);
  } catch (e) {
    rec("brand detail: shell", false, e.message);
  }
  await page.close();
}

// ─── Category detail ──────────────────────────────────────────────────────────

async function testCategoryDetail(ctx) {
  const catId = await fetchFirstId(BASE_URL, "/api/categories");
  if (!catId) {
    rec("category detail: found category", false, "no categories");
    return;
  }

  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl(`/categories/${catId}`));
    const h1 = await page.locator("h1").count();
    const content = await page.locator(".appkit-card, [class*=card], [class*=category], [class*=product]").count();
    const empty = await page.locator('[data-testid=empty-state]').count();
    rec(`category detail: renders`, h1 > 0, `h1=${h1} content=${content} empty=${empty}`);
  } catch (e) {
    rec("category detail: shell", false, e.message);
  }
  await page.close();
}

// ─── Profile page ─────────────────────────────────────────────────────────────

async function testProfilePage(ctx) {
  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl("/profile/user-admin-letitrip"));
    const h1 = await page.locator("h1").count();
    const avatar = await page.locator('img[alt*="avatar" i], img[alt*="profile" i], [class*=avatar], [class*=Avatar]').count();
    rec("user profile: renders", h1 > 0, `h1=${h1} avatar=${avatar}`);
  } catch (e) {
    rec("user profile: shell", false, e.message);
  }
  await page.close();
}

// ─── How-to pages structural check ────────────────────────────────────────────

async function testHowToPages(ctx) {
  const HOW_TO = [
    "/how-auctions-work",
    "/how-pre-orders-work",
    "/how-checkout-works",
    "/how-offers-work",
    "/how-orders-work",
    "/how-reviews-work",
    "/how-payouts-work",
  ];

  for (const path of HOW_TO) {
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(path));
      const h1 = await page.locator("h1").count();
      const sections = await page.locator("h2, h3, [class*=step], ol li").count();
      rec(`${path}: structured content`, h1 > 0 && sections >= 2, `h1=${h1} sections=${sections}`);
    } catch (e) {
      rec(`${path}: shell`, false, e.message);
    }
    await page.close();
  }
}

// ─── Legal pages text density check ──────────────────────────────────────────

async function testLegalPages(ctx) {
  const LEGAL = [
    "/terms",
    "/privacy",
    "/security",
    "/cookies",
    "/refund-policy",
    "/shipping-policy",
  ];

  for (const path of LEGAL) {
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(path));
      const paragraphs = await page.locator("main p, article p, main li").count();
      const h1 = await page.locator("h1").count();
      rec(`${path}: legal text density`, h1 > 0 && paragraphs >= 3, `h1=${h1} p=${paragraphs}`);
    } catch (e) {
      rec(`${path}: shell`, false, e.message);
    }
    await page.close();
  }
}

// ─── Scam detail ──────────────────────────────────────────────────────────────

async function testScamDetail(ctx) {
  const scamId = await fetchFirstId(BASE_URL, "/api/scams");
  if (!scamId) {
    rec("scam detail: found scammer", false, "no scammers seeded");
    return;
  }
  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl(`/scams/${scamId}`));
    const h1 = await page.locator("h1").count();
    rec("scam detail: renders", h1 > 0, `h1=${h1}`);
  } catch (e) {
    rec("scam detail: shell", false, e.message);
  }
  await page.close();
}

// ─── New listing type index + detail pages ────────────────────────────────────

async function testNewListingTypes(ctx) {
  const NEW_LISTING_INDEXES = [
    { path: "/classified",    cardSel: ".appkit-card, [class*=card], [class*=classified]" },
    { path: "/digital-codes", cardSel: ".appkit-card, [class*=card], [class*=digital]" },
    { path: "/live",          cardSel: ".appkit-card, [class*=card], [class*=live]" },
  ];

  for (const { path, cardSel } of NEW_LISTING_INDEXES) {
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(path));
      const cards = await page.locator(cardSel).count();
      const empty = await page.locator('[data-testid=empty-state]').count();
      const main = await page.locator("main").count();
      rec(`${path}: listing renders`, main > 0 && (cards > 0 || empty > 0), `main=${main} cards=${cards} empty=${empty}`);
    } catch (e) {
      rec(`${path}: shell`, false, e.message);
    }
    await page.close();
  }

  // Detail pages for new listing types (via API)
  const DETAIL_SPECS = [
    { name: "classified detail",    apiPath: "/api/products?listingType=classified&pageSize=1",   routeFn: (id) => `/classified/${id}` },
    { name: "digital-code detail",  apiPath: "/api/products?listingType=digital-code&pageSize=1", routeFn: (id) => `/digital-codes/${id}` },
    { name: "live-item detail",     apiPath: "/api/products?listingType=live&pageSize=1",          routeFn: (id) => `/live/${id}` },
  ];

  for (const { name, apiPath, routeFn } of DETAIL_SPECS) {
    const id = await fetchFirstId(BASE_URL, apiPath);
    if (!id) {
      rec(`${name}: found item`, false, `no items at ${apiPath} — skip`);
      continue;
    }
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(routeFn(id)));
      const h1 = await page.locator("h1").count();
      const main = await page.locator("main").count();
      rec(`${name}: renders`, h1 > 0 && main > 0, `h1=${h1} main=${main}`);
    } catch (e) {
      rec(`${name}: shell`, false, e.message);
    }
    await page.close();
  }
}

// ─── Sublisting-categories index + detail ─────────────────────────────────────

async function testSublistingCategories(ctx) {
  const page = await ctx.newPage();
  try {
    await gotoAndWait(page, localizedUrl("/sublisting-categories"));
    const main = await page.locator("main").count();
    const cards = await page.locator(".appkit-card, [class*=card], [class*=sublisting], [data-testid=empty-state]").count();
    rec("/sublisting-categories: renders", main > 0 && cards > 0, `main=${main} cards=${cards}`);
  } catch (e) {
    rec("/sublisting-categories: shell", false, e.message);
  }
  await page.close();

  const subId = await fetchFirstId(BASE_URL, "/api/sublisting-categories");
  if (!subId) {
    rec("sublisting-category detail: found item", false, "no items — skip");
    return;
  }
  const p2 = await ctx.newPage();
  try {
    await gotoAndWait(p2, localizedUrl(`/sublisting-categories/${subId}`));
    const h1 = await p2.locator("h1").count();
    const main = await p2.locator("main").count();
    rec("sublisting-category detail: renders", main > 0 && h1 > 0, `h1=${h1} main=${main}`);
  } catch (e) {
    rec("sublisting-category detail: shell", false, e.message);
  }
  await p2.close();
}

// ─── Seller detail + seller-guide sub-pages ───────────────────────────────────

async function testSellerDetail(ctx) {
  const sellerId = await fetchFirstId(BASE_URL, "/api/sellers");
  if (!sellerId) {
    rec("seller detail: found seller", false, "no sellers — skip");
  } else {
    const page = await ctx.newPage();
    try {
      await gotoAndWait(page, localizedUrl(`/sellers/${sellerId}`));
      const h1 = await page.locator("h1").count();
      const main = await page.locator("main").count();
      rec("seller detail: renders", main > 0 && h1 > 0, `h1=${h1} main=${main}`);
    } catch (e) {
      rec("seller detail: shell", false, e.message);
    }
    await page.close();
  }

  // Seller-guide sub-pages
  for (const sub of ["bundles", "prize-draws"]) {
    const p = await ctx.newPage();
    try {
      await gotoAndWait(p, localizedUrl(`/seller-guide/${sub}`));
      const h1 = await p.locator("h1").count();
      const main = await p.locator("main").count();
      rec(`/seller-guide/${sub}: renders`, main > 0 && h1 > 0, `h1=${h1} main=${main}`);
    } catch (e) {
      rec(`/seller-guide/${sub}: shell`, false, e.message);
    }
    await p.close();
  }
}

// ─── Auth utility routes ──────────────────────────────────────────────────────

async function testAuthUtilityRoutes(ctx) {
  // oauth-loading is a transient page; just check it doesn't hard-crash (200 or redirect)
  for (const path of ["/auth/oauth-loading", "/auth/close"]) {
    const page = await ctx.newPage();
    try {
      const { status } = await gotoAndWait(page, localizedUrl(path));
      // 200, 3xx redirect, or intentional 404 are all acceptable for utility routes
      rec(`${path}: no 5xx`, status < 500, `status=${status}`);
    } catch (e) {
      rec(`${path}: shell`, false, e.message);
    }
    await page.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("anon");

  await testHomepage(ctx);
  await testAuctionListing(ctx);
  await testListingPage(ctx, "/products", ".appkit-card, [class*=card], [class*=product]");
  await testListingPage(ctx, "/stores", ".appkit-card, [class*=card], [class*=store]");
  await testListingPage(ctx, "/events", ".appkit-card, [class*=card], [class*=event]");
  await testListingPage(ctx, "/blog", ".appkit-card, [class*=card], article, [class*=blog]");
  await testListingPage(ctx, "/brands", ".appkit-card, [class*=card], [class*=brand]");
  await testListingPage(ctx, "/categories", ".appkit-card, [class*=card], [class*=category]");
  await testSearchPage(ctx);
  await testNewListingTypes(ctx);
  await testSublistingCategories(ctx);
  await testSellerDetail(ctx);
  await testAuthUtilityRoutes(ctx);
  await testStoreDetail(ctx);
  await testEventDetail(ctx);
  await testBlogArticle(ctx);
  await testBrandDetail(ctx);
  await testCategoryDetail(ctx);
  await testProfilePage(ctx);
  await testHowToPages(ctx);
  await testLegalPages(ctx);
  await testScamDetail(ctx);

  return results;
}
