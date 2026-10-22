#!/usr/bin/env node
/*
 * audit-cdn-cache-headers — the `Vercel-CDN-Cache-Control` rules in
 * next.config.js cache exactly the public routes, and no personalised one.
 *
 * ## Why this exists
 *
 * Measured on production 2026-10-22: EVERY public detail route served
 * `Cache-Control: private, no-cache, no-store` with `x-vercel-cache: MISS` on
 * two consecutive requests — `/products/[slug]` did so while declaring
 * `export const revalidate = 3600`. They are not ISR, they are fully dynamic
 * (Root Cause #94). Meanwhile the sitemap advertises 4,766 URLs, 4,658 of them
 * auto-generated `/categories/{slug}` pages, 10 of 10 sampled containing zero
 * products. ~95,000 uncached origin renders in six days — 43% of the billing
 * cycle — rendering empty pages for crawlers.
 *
 * The fix is a CDN TTL per route group. The hazard the fix introduces is the
 * opposite one: a shared CDN entry on a page that renders per-viewer content
 * serves one signed-in user's page to the next. This audit is the mechanism
 * that keeps both halves true.
 *
 * ## The rules
 *
 *   R1  Every path in MUST_CACHE resolves to a CDN cache header.
 *   R2  No path in MUST_NOT_CACHE resolves to one.
 *   R3  Every public page that reads the session server-side
 *       (`getServerSessionUser` / `cookies()` / `next/headers` in its own
 *       page.tsx or any layout.tsx above it) is uncached. This is the rule
 *       that generalises — R2 only knows the routes someone listed.
 *
 * ## How it matches
 *
 * Through Next's OWN `getPathMatch`, never a hand-rolled regex — the question
 * is what the framework will do, not what path-to-regexp is believed to mean.
 * That distinction is the whole value here: the first draft of this config used
 * a bare `/:locale${p}`, which matches ANY first segment, so `/products` also
 * matched `/admin/products`, `/store/products` and `/api/products`. Reading the
 * pattern did not reveal it; asserting against the matcher did.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(ROOT, "package.json"));
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match");

const CDN_KEY = "Vercel-CDN-Cache-Control";

/* The crawl surface that was costing money. */
const MUST_CACHE = [
  "/categories/category-0",
  "/categories/category-0/products/sort/relevance/page/1",
  "/categories/sort/relevance/page/1",
  "/en/categories/category-0",
  "/brands/brand-takara-tomy",
  "/franchise/beyblade",
  "/parts/attack-ring",
  "/parts/attack-ring/ar-001",
  "/faqs",
  "/faqs/shipping",
  "/about",
  "/spares",
  "/report",
  "/products",
  "/products/product-beyblade-x-dran-sword",
  "/en/products/product-beyblade-x-dran-sword",
  "/blog/authenticating-beyblades",
  "/bundles/bundle-x-battle-ready",
  "/auctions/auction-x",
  "/events/event-x",
  "/events/event-x/leaderboard",
];

/*
 * Personalised, or simply not ours to cache. The dashboard and API entries are
 * the regression test for the bare-`:locale` bug described in the header.
 */
const MUST_NOT_CACHE = [
  "/stores/store-letitrip-official",
  "/stores/store-letitrip-official/about",
  "/en/stores/store-letitrip-official",
  "/prize-draws/prizedraw-1",
  "/lottery/event-1",
  "/events/event-x/winner",
  "/events/event-x/spin-results",
  "/events/event-x/participate",
  "/search",
  "/search/beyblade/tab/all/sort/relevance/page/1",
  "/profile/user-1",
  "/profile/user-1/catalogue",
  "/catalogue/user-1/mycatalog-1",
  "/item-requests/req-1",
  "/messages/conv-1",
  "/admin",
  "/admin/products",
  "/store/products",
  "/user/orders",
  "/checkout",
  "/cart",
  "/wishlist",
  "/auth/login",
  "/api/products",
];

/** Dynamic-segment placeholders used when turning a file path into a URL. */
const SAMPLE = "x";

function ttlResolver(rules) {
  const cdnRules = rules.filter((r) => r.headers?.some((h) => h.key === CDN_KEY));
  if (cdnRules.length === 0) {
    console.error(`audit-cdn-cache-headers: no ${CDN_KEY} rules found at all.`);
    process.exit(1);
  }
  const compiled = cdnRules.map((r) => ({
    source: r.source,
    value: r.headers.find((h) => h.key === CDN_KEY).value,
    match: getPathMatch(r.source, { removeUnnamedParams: true }),
  }));
  return (pathname) => compiled.find((c) => c.match(pathname)) ?? null;
}

/**
 * Public page routes whose own file — or any layout above it — reads the
 * session. Returns URL paths with `[param]` replaced by a sample segment.
 */
function personalisedPublicRoutes() {
  const appDir = path.join(ROOT, "src/app/[locale]");
  const PRIVATE_TREES = /^\/(admin|store|user|auth|checkout|cart|wishlist|unauthorized|preview|track|tools)(\/|$)/;
  const SESSION = /getServerSessionUser|requireAuthFromRequest|from ["']next\/headers["']|\bcookies\(\)/;

  /** Strip comments so a cautionary note about `cookies()` is not a hit. */
  const readCode = (file) =>
    fs
      .readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  const out = [];
  const walk = (dir, url) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const seg = e.name.startsWith("[") ? SAMPLE : e.name;
      // Route groups `(name)` contribute no URL segment.
      const nextUrl = /^\(.*\)$/.test(e.name) ? url : `${url}/${seg}`;
      const dirPath = path.join(dir, e.name);
      const page = path.join(dirPath, "page.tsx");
      if (fs.existsSync(page) && !PRIVATE_TREES.test(nextUrl)) {
        const layout = path.join(dirPath, "layout.tsx");
        const reads =
          SESSION.test(readCode(page)) ||
          (fs.existsSync(layout) && SESSION.test(readCode(layout)));
        if (reads) out.push(nextUrl);
      }
      walk(dirPath, nextUrl);
    }
  };
  walk(appDir, "");

  /*
   * A layout personalises its whole subtree, so a route under one must also be
   * reported even when its own page is clean. Re-walk, marking descendants of
   * any directory whose layout reads the session.
   */
  const layoutOwned = [];
  const walkLayouts = (dir, url, tainted) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const seg = e.name.startsWith("[") ? SAMPLE : e.name;
      const nextUrl = /^\(.*\)$/.test(e.name) ? url : `${url}/${seg}`;
      const dirPath = path.join(dir, e.name);
      const layout = path.join(dirPath, "layout.tsx");
      const nowTainted =
        tainted || (fs.existsSync(layout) && SESSION.test(readCode(layout)));
      if (nowTainted && fs.existsSync(path.join(dirPath, "page.tsx")) && !PRIVATE_TREES.test(nextUrl)) {
        layoutOwned.push(nextUrl);
      }
      walkLayouts(dirPath, nextUrl, nowTainted);
    }
  };
  walkLayouts(appDir, "", false);

  return [...new Set([...out, ...layoutOwned])];
}

const config = require(path.join(ROOT, "next.config.js"));
const resolved = typeof config === "function" ? config() : (config.default ?? config);
const rules = await resolved.headers();
const ttlFor = ttlResolver(rules);

const violations = [];

for (const p of MUST_CACHE) {
  if (!ttlFor(p)) violations.push(`R1 ${p} has no ${CDN_KEY} — it renders at origin on every request.`);
}
for (const p of MUST_NOT_CACHE) {
  const hit = ttlFor(p);
  if (hit) {
    violations.push(
      `R2 ${p} resolves to a SHARED CDN cache via "${hit.source}" (${hit.value}). ` +
        `If that route ever answers 200 without a cookie, one viewer's page is served to the next.`,
    );
  }
}
for (const p of personalisedPublicRoutes()) {
  const hit = ttlFor(p);
  if (hit) {
    violations.push(
      `R3 ${p} reads the session server-side but matches "${hit.source}" (${hit.value}). ` +
        `Remove it from the cached path list, or stop reading the session in its page/layout.`,
    );
  }
}

if (violations.length > 0) {
  console.error(`\naudit-cdn-cache-headers: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error("");
  process.exit(1);
}

console.log(
  `audit-cdn-cache-headers: clean ✓ ` +
    `(${MUST_CACHE.length} cached, ${MUST_NOT_CACHE.length} excluded, ` +
    `${personalisedPublicRoutes().length} session-reading public routes verified uncached)`,
);
