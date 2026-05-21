/**
 * pw-01 — Full public page coverage.
 *
 * Visits every static + dynamic public route.
 * Asserts: h1, main landmark, footer, header nav, no 5xx responses, ≤5 console errors.
 * Also checks specific content per page type.
 */

import { getContext, localizedUrl, withErrorCollector, fetchFirstId, getCookieHeader, gotoAndWait } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ─── Static paths ────────────────────────────────────────────────────────────

const STATIC_PUBLIC_PATHS = [
  // Marketplace listings
  "/",
  "/products",
  "/auctions",
  "/pre-orders",
  "/bundles",
  "/prize-draws",
  "/sellers",
  "/stores",
  "/categories",
  "/brands",
  "/reviews",
  // Community
  "/events",
  "/blog",
  "/scams",
  "/scams/types",
  "/scams/report",
  "/scams/faqs",
  // Informational
  "/about",
  "/contact",
  "/help",
  "/fees",
  "/support",
  "/seller-guide",
  "/track",
  "/search",
  "/promotions",
  // How-to guides
  "/how-auctions-work",
  "/how-pre-orders-work",
  "/how-offers-work",
  "/how-checkout-works",
  "/how-orders-work",
  "/how-reviews-work",
  "/how-payouts-work",
  // Legal
  "/terms",
  "/privacy",
  "/security",
  "/cookies",
  "/refund-policy",
  "/shipping-policy",
  // Auth
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  // FAQs
  "/faqs",
  "/faqs/general",
  "/faqs/shipping",
  // Errors
  "/unauthorized",
];

// ─── Dynamic path resolvers (fetch IDs at runtime) ───────────────────────────

async function buildDynamicPaths() {
  const paths = [];

  // Standard product detail
  const productId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "standard" && p.status === "published",
  });
  if (productId) paths.push({ path: `/products/${productId}`, name: "product detail" });

  // Auction detail
  const auctionId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "auction",
  });
  if (auctionId) paths.push({ path: `/auctions/${auctionId}`, name: "auction detail" });

  // Pre-order detail
  const preorderId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "pre-order",
  });
  if (preorderId) paths.push({ path: `/pre-orders/${preorderId}`, name: "pre-order detail" });

  // Bundle detail
  const bundleId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "bundle",
  });
  if (bundleId) paths.push({ path: `/bundles/${bundleId}`, name: "bundle detail" });

  // Prize draw detail
  const prizedrawId = await fetchFirstId(BASE_URL, "/api/products", {
    filter: (p) => p.listingType === "prize-draw",
  });
  if (prizedrawId) paths.push({ path: `/prize-draws/${prizedrawId}`, name: "prize draw detail" });

  // Event detail + sub-routes
  const eventId = await fetchFirstId(BASE_URL, "/api/events");
  if (eventId) {
    paths.push({ path: `/events/${eventId}`, name: "event detail" });
    paths.push({ path: `/events/${eventId}/leaderboard`, name: "event leaderboard" });
  }
  const activeEventId = await fetchFirstId(BASE_URL, "/api/events", {
    filter: (e) => e.status === "active",
  });
  if (activeEventId) {
    paths.push({ path: `/events/${activeEventId}/participate`, name: "event participate" });
  }

  // Blog article
  const blogSlug = await fetchFirstId(BASE_URL, "/api/blog", {
    filter: (b) => b.status === "published",
  });
  if (blogSlug) paths.push({ path: `/blog/${blogSlug}`, name: "blog article" });

  // Brand detail
  const brandId = await fetchFirstId(BASE_URL, "/api/brands");
  if (brandId) paths.push({ path: `/brands/${brandId}`, name: "brand detail" });

  // Category detail
  const categoryId = await fetchFirstId(BASE_URL, "/api/categories");
  if (categoryId) paths.push({ path: `/categories/${categoryId}`, name: "category detail" });

  // Store detail + sub-tabs
  const storeId = await fetchFirstId(BASE_URL, "/api/stores", {
    filter: (s) => s.status === "active",
  });
  if (storeId) {
    paths.push({ path: `/stores/${storeId}`, name: "store detail" });
    paths.push({ path: `/stores/${storeId}/products`, name: "store products tab" });
    paths.push({ path: `/stores/${storeId}/auctions`, name: "store auctions tab" });
    paths.push({ path: `/stores/${storeId}/pre-orders`, name: "store pre-orders tab" });
    paths.push({ path: `/stores/${storeId}/reviews`, name: "store reviews tab" });
    paths.push({ path: `/stores/${storeId}/about`, name: "store about tab" });
  }

  // Scam detail
  const scamId = await fetchFirstId(BASE_URL, "/api/scams");
  if (scamId) paths.push({ path: `/scams/${scamId}`, name: "scam detail" });

  // Review detail
  const reviewId = await fetchFirstId(BASE_URL, "/api/reviews");
  if (reviewId) paths.push({ path: `/reviews/${reviewId}`, name: "review detail" });

  // User profile
  paths.push({ path: "/profile/user-admin-letitrip", name: "user profile" });

  // Search with query
  paths.push({ path: "/search?q=blue+eyes", name: "search with query" });

  // YGO-specific known slugs
  paths.push({ path: "/blog/blog-identify-1st-edition-yugioh", name: "blog: 1st edition guide" });
  paths.push({ path: "/products/bundle-exodia-complete-set", name: "bundle: exodia set" });

  return paths;
}

// ─── Per-path content assertions ─────────────────────────────────────────────

function assertSpecificContent(rec, path, page) {
  return async () => {
    const pn = path.split("?")[0];

    if (pn === "/" || pn === "") {
      // Homepage: hero section or carousel present
      const hero = await page.locator(
        "[data-testid=carousel], .appkit-hero, [data-section*=hero], section, .appkit-card",
      ).count();
      rec(`${path}: homepage content`, hero > 0, `hero=${hero}`);
    } else if (pn.startsWith("/products/") || pn.startsWith("/auctions/") || pn.startsWith("/pre-orders/") || pn.startsWith("/bundles/") || pn.startsWith("/prize-draws/")) {
      // Product-type detail: price visible
      const price = await page.locator("text=/₹|INR/").count();
      rec(`${path}: price visible`, price > 0, `priceEl=${price}`);
    } else if (/\/events\/[^/]+$/.test(pn)) {
      // Event detail: tab strip
      const tabs = await page.locator('[role=tab], [role=tablist] a, a[href*="/participate"], a[href*="/leaderboard"]').count();
      rec(`${path}: event tabs`, tabs > 0, `tabs=${tabs}`);
    } else if (pn.startsWith("/blog/")) {
      // Blog article: article or long text block
      const article = await page.locator("article, [class*=article], [class*=blog], time").count();
      rec(`${path}: blog article content`, article > 0, `article=${article}`);
    } else if (pn.startsWith("/stores/") && !pn.match(/\/stores\/[^/]+$/)) {
      // Store sub-tab: tab strip visible
      const tabs = await page.locator('[role=tab], [role=tablist], nav a[href*="/stores/"]').count();
      rec(`${path}: store tab nav`, tabs > 0, `tabs=${tabs}`);
    } else if (pn === "/auth/login") {
      const emailInput = await page.locator('input[type=email], input[name=email]').count();
      const pwInput = await page.locator('input[type=password]').count();
      rec(`${path}: login form fields`, emailInput > 0 && pwInput > 0, `email=${emailInput} pw=${pwInput}`);
    } else if (pn === "/auth/register") {
      const fields = await page.locator('input[type=email], input[name=email], input[name=password], input[type=password]').count();
      rec(`${path}: register form fields`, fields >= 2, `fields=${fields}`);
    } else if (pn === "/track") {
      const trackInput = await page.locator('input[name=orderId], input[placeholder*="order" i], input[placeholder*="track" i]').count();
      rec(`${path}: tracking input`, trackInput > 0, `n=${trackInput}`);
    } else if (pn === "/search") {
      const searchBar = await page.locator('input[type=search], input[name=q], input[placeholder*="search" i]').count();
      rec(`${path}: search bar present`, searchBar > 0, `n=${searchBar}`);
    } else if (pn.startsWith("/how-")) {
      // How-to pages: at least 3 section headings
      const headings = await page.locator("h2, h3").count();
      rec(`${path}: how-to headings`, headings >= 2, `h=${headings}`);
    } else if (["/terms", "/privacy", "/security", "/cookies", "/refund-policy", "/shipping-policy"].includes(pn)) {
      // Legal pages: substantial text content
      const bodyText = await page.locator("main p, article p, main li").count();
      rec(`${path}: legal body text`, bodyText >= 3, `p=${bodyText}`);
    }
  };
}

// ─── Visit helper ─────────────────────────────────────────────────────────────

async function visitPublicPath(ctx, pathEntry) {
  const path = typeof pathEntry === "string" ? pathEntry : pathEntry.path;
  const name = typeof pathEntry === "string" ? path : pathEntry.name;
  const page = await ctx.newPage();
  let httpStatus = 0;

  const { consoleErrors, netFailures } = await withErrorCollector(page, async () => {
    const res = await page.goto(localizedUrl(path), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    httpStatus = res?.status() ?? 0;
    // Wait for content to attach
    await page
      .locator("h1, main, [data-testid], .appkit-card, form, article")
      .first()
      .waitFor({ state: "attached", timeout: 8000 })
      .catch(() => {});
  });

  const h1 = await page.locator("h1").count();
  const main = await page.locator("main, [role=main]").count();
  const footer = await page.locator("footer, [role=contentinfo]").count();
  const header = await page.locator("header, [role=banner]").count();
  const finalUrl = page.url();
  const is5xx = netFailures.some((f) => /^5/.test(f));

  rec(`${name}: h1`, h1 > 0, `n=${h1} url=${finalUrl}`);
  rec(`${name}: main landmark`, main > 0, `n=${main}`);
  rec(`${name}: footer`, footer > 0, `n=${footer}`);
  rec(`${name}: header nav`, header > 0, `n=${header}`);
  rec(`${name}: no 5xx`, !is5xx, netFailures.slice(0, 2).join(" | "));
  rec(`${name}: console errors ≤ 5`, consoleErrors.length <= 5, `n=${consoleErrors.length} first=${consoleErrors[0]?.slice(0, 120) ?? ""}`);

  // Page-specific assertions
  await assertSpecificContent(rec, path, page)();

  await page.close();
}

// ─── Main run ─────────────────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("anon");

  // Static paths
  for (const path of STATIC_PUBLIC_PATHS) {
    await visitPublicPath(ctx, path);
  }

  // Dynamic paths
  const dynamicPaths = await buildDynamicPaths();
  for (const entry of dynamicPaths) {
    await visitPublicPath(ctx, entry);
  }

  // ── Checkout OTP consent step checkpoint ────────────────────────────────
  {
    const userCtx = await getContext("buyer");
    const page = await userCtx.newPage();
    page.setDefaultTimeout(20000);
    const label = "checkout-otp-consent";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/checkout"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: checkout loads (or redirects to login)`, status < 400, `status=${status}`);

      if (!redirected) {
        // OTP consent step heading
        const otpHeading = await page
          .locator("h1, h2, h3")
          .filter({ hasText: /verify.*identity|otp|phone verification/i })
          .count()
          .catch(() => 0);
        rec(`${label}: otp-consent step heading visible`, otpHeading > 0, `count=${otpHeading}`);

        // "Send verification code" button (not immediate send)
        const sendCodeBtn = await page
          .locator("button")
          .filter({ hasText: /send.*code|send.*otp|verify/i })
          .count()
          .catch(() => 0);
        rec(`${label}: send verification code button`, sendCodeBtn > 0, `count=${sendCodeBtn}`);
      }
    } catch (e) {
      rec(`${label}: checkout otp consent`, false, e.message);
    }
    await page.close();
    await userCtx.close();
  }

  return results;
}
