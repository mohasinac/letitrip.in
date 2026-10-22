const path = require("path");
const fs = require("fs");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");
const consumerPkg = require("./package.json");

// Report the version of the appkit that ACTUALLY SHIPS, i.e. the installed copy
// in node_modules — not the local working tree.
//
// This used to be `require("./appkit/package.json")`, and that one line was the
// only build-time reference to the local appkit/ directory. Because .vercelignore
// had no `appkit` entry, it kept the entire 2,359-file / 356 KLOC source tree
// (plus a 27 MB dist/) in every Vercel upload, despite package.json pinning
// @mohasinac/appkit to the npm registry. `/appkit` is excluded there now, so
// reading the local file would throw on Vercel.
//
// It is also simply more correct: under an npm pin the local tree can drift from
// the pinned range, so the local file could report a version that was never
// deployed.
//
// A plain readFileSync rather than require(): appkit's `exports` map does not
// declare "./package.json", so `require("@mohasinac/appkit/package.json")` fails
// with ERR_PACKAGE_PATH_NOT_EXPORTED. A raw file read bypasses module resolution.
function readAppkitVersion() {
  const candidates = [
    path.join(__dirname, "node_modules", "@mohasinac", "appkit", "package.json"),
    // Fallback for a working tree where node_modules is not installed yet
    // (e.g. a tooling script that loads the config before `npm install`).
    path.join(__dirname, "appkit", "package.json"),
  ];
  for (const candidate of candidates) {
    try {
      const version = JSON.parse(fs.readFileSync(candidate, "utf8")).version;
      if (version) return version;
    } catch {
      // Try the next candidate. A missing version is a cosmetic footer problem,
      // never a reason to fail the build.
    }
  }
  return "0.0.0";
}

// Build-time version stamping — exposed via NEXT_PUBLIC_* so the footer can show
// what's actually deployed. Lets us visually confirm a redeploy without curling
// pages or rebuilding the audit.
const APP_VERSION = consumerPkg.version || "0.0.0";
const APPKIT_VERSION = readAppkitVersion();
const COMMIT_SHA = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);
// Read from the environment when present so a two-invocation build
// (`--experimental-build-mode=compile` then `=generate`) stamps ONE timestamp
// rather than two different ones — the config module is loaded once per
// invocation. Plan Stage 3a.
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

module.exports = withNextIntl(
  defineNextConfig({
    /**
     * 🛑 Opting BACK IN to the Next image optimizer, which appkit defaults off.
     *
     * `appkit/src/configs/next.ts` merges `unoptimized: true` and documents this
     * exact override as the supported way back in. Its stated reason — "pre-launch
     * demo data pulls from various hosts (ygoprodeck, unsplash, picsum)" — is now
     * stale: the catalogue is same-origin `/media/<slug>` and
     * `/images/seed-tiles/*.svg`, and `picsum.photos` is short-circuited to a local
     * tile in two independent places (Root Cause #104). Measured 2026-10-19, the
     * only external image hosts left in seed data are the two below.
     *
     * What this fixes: with `unoptimized: true` Next emits a single `src` and NO
     * `srcset`, so a 64px thumbnail and a 1200px hero downloaded identical bytes,
     * and `MediaImage`'s six carefully-tuned `sizes` strings were inert. Measured
     * competitors emit 12-25 widths and negotiate AVIF/WebP; on one Shopify image
     * that is 15.9 KB of AVIF at 246w against 250 KB at 1946w. See
     * docs/research/competitor-crawl-2026-10/images.md.
     *
     * 🛑 Ordered AFTER A3 on purpose. `/api/media/[...slug]` used to sharp-composite
     * a watermark on every response; the optimizer fetching N widths would have
     * multiplied that. The mark is now baked once at finalize and the proxy streams,
     * so the optimizer resizes a plain object.
     *
     * 🛑 COST: this trades Fast Origin Transfer for Image Optimization
     * transformations, and the transformation count is DERIVED, not measured —
     * roughly 1,237 products x ~4 widths x 2 formats, one-time, then held by
     * `minimumCacheTTL`. Read the real per-SKU dollars from the `usage-summary`
     * endpoint (CLAUDE.md § "Secrets & Runtime Env Parity") a day after deploying
     * rather than trusting that estimate.
     */
    images: {
      unoptimized: false,
      formats: ["image/avif", "image/webp"],
      /*
       * Next's defaults are [640, 750, 828, 1080, 1200, 1920, 2048, 3840]. 2048 and
       * 3840 are dropped because the stored master is capped at 2048 by
       * `downscale-image.ts`, so both could only UPSCALE — and each distinct width
       * is a separately billed transformation.
       */
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      // 30 days. Matches the CDN window the media proxy already sets, so a
      // transformation is paid for once a month at most.
      minimumCacheTTL: 2592000,
      /*
       * Deliberately a two-entry allowlist, not a wildcard. Anything else must
       * come through `/media/<slug>` (same-origin, needs no entry) — which is the
       * rule `audit-media-proxy-hosts` and `audit-seed-media-host` already enforce.
       */
      remotePatterns: [
        // Unfinalized Google OAuth profile photos, already carved out of
        // `audit-raw-img-src` for the same reason.
        { protocol: "https", hostname: "lh3.googleusercontent.com" },
        // The two video-demo fixtures' poster frames.
        { protocol: "https", hostname: "upload.wikimedia.org" },
      ],
    },
    env: {
      NEXT_PUBLIC_APP_VERSION: APP_VERSION,
      NEXT_PUBLIC_APPKIT_VERSION: APPKIT_VERSION,
      NEXT_PUBLIC_COMMIT_SHA: COMMIT_SHA,
      NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
    },
    // Firestore docs, seed data, and resolveMediaUrl() all emit the bare
    // `/media/<slug>` form as the canonical media URL, but the only actual
    // handler is `src/app/api/media/[...slug]/route.ts` at `/api/media/<slug>`.
    // Without this rewrite every image on the site 404s at the router level
    // (invisible to try/catch — the browser just renders a broken-image icon).
    async rewrites() {
      return [
        {
          source: "/media/:path*",
          destination: "/api/media/:path*",
        },
      ];
    },
    /**
     * Cache headers that cannot be expressed on the route itself.
     *
     * 🛑 There was no `headers()` here at all before 2026-10-09, and that cost
     * real money in two distinct ways.
     *
     * 1. **`public/` defaults to `max-age=0, must-revalidate` on Vercel.** The
     *    six seed tiles that replaced ~400 proxied placeholder images are static
     *    assets, and without this every one of them paid a revalidation
     *    round-trip on every page view — turning the fix into a smaller version
     *    of the problem. Verified locally: the tile served `max-age=0` until
     *    this block existed. They are content-addressed by colour and never
     *    change, so `immutable` is honest.
     *
     * 2. **A dynamic listing page emits `no-store`,** so the CDN cannot hold it
     *    even though its HTML depends only on the query string.
     *    `Vercel-CDN-Cache-Control` is CDN-only — it never reaches the browser,
     *    so no stale HTML is pinned in anyone's cache — and it takes precedence
     *    over that `no-store` rather than fighting it. The window is long
     *    because correctness now comes from the revalidation webhook, not from
     *    expiry.
     *
     * 🛑 These pages are deliberately NOT made static instead. `useSearchParams()`
     * sits in the grid's render path, so a static prerender bails to CSR, the
     * existing `<Suspense>` has no fallback, **the build still passes**, and a
     * crawler receives a page with no products in it (Root Cause #17b). The grid
     * being in the SSR HTML is the SEO asset.
     */
    async headers() {
      const LISTING_CDN_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
      const listingPaths = [
        "/products", "/auctions", "/pre-orders", "/prize-draws", "/bundles",
        "/art", "/classified", "/digital-codes", "/live", "/stores",
        "/sellers", "/events", "/blog", "/reviews", "/scams", "/groups",
      ];

      /*
       * 🛑 The sixteen paths above used to be the WHOLE list, justified by a
       * comment reading "Detail routes are ISR and carry their own
       * `revalidate`; adding a CDN header there would be a second, competing
       * source of truth". **Measured against production 2026-10-22, that is
       * false — there is no first source of truth to compete with.**
       *
       * `/products/[slug]` declares `export const revalidate = 3600` and still
       * served `Cache-Control: private, no-cache, no-store` and
       * `x-vercel-cache: MISS` on every request, twice in a row, forever. Same
       * for every other detail route. They are not ISR; they are fully dynamic
       * (Root Cause #94 — read the prerender manifest, never `grep` for
       * `revalidate`, because `revalidate` says what a developer wrote and the
       * manifest says what Next does).
       *
       * What that cost, measured over one 6-day window:
       *
       *   - the sitemap advertises 4,766 URLs, **4,658 of them
       *     `/categories/{slug}`** — auto-generated part-code pages, of which
       *     10 out of 10 sampled contained ZERO products
       *   - each is ~110 KB on the wire (brotli) and ~0.3 s of function time
       *   - Fast Origin Transfer $2.60 ÷ $0.25/GB at bom1 ≈ 10.4 GB
       *     ≈ **~95,000 uncached origin renders**, which independently matches
       *     Function Duration $2.79 ÷ $0.18/GB-hr ≈ 15.5 GB-hr at ~0.3 s each
       *   - = **43% of the billing cycle**, spent rendering empty pages for
       *     crawlers, with no caching layer anywhere between them and origin
       *
       * So the rule is inverted: a public page is CDN-cached unless it renders
       * per-viewer content. `Vercel-CDN-Cache-Control` is CDN-only — it never
       * reaches the browser — so none of this pins stale HTML in a user's cache.
       *
       * 🛑 EXCLUDED, and each exclusion is load-bearing. Every one of these
       * calls `await getServerSessionUser()` during its own render, so a shared
       * CDN entry would serve one visitor's personalised page to the next:
       *
       *   /stores/:storeSlug/*   — its layout reads the viewer (whole subtree)
       *   /prize-draws/:slug     — note the LISTING /prize-draws stays cached
       *   /lottery/:id
       *   /events/:id/winner, /spin-results, /participate
       *   /search, /search/*
       *
       * Also excluded on judgement rather than measurement: /profile/*,
       * /catalogue/*, /item-requests/*, /messages/*. None appears in the
       * sitemap, so none carries crawl cost worth taking any risk for.
       *
       * Verify a change here against production rather than reasoning about it
       * — request the same URL twice and read `x-vercel-cache`. A MISS on both
       * means the route renders at origin every single time.
       */

      // Taxonomy and evergreen copy: changes on a deploy or an admin edit, not
      // on traffic. This is the tier that holds the 4,658-page category space.
      const TAXONOMY_CDN_CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";
      const taxonomyPaths = [
        "/categories/:slug",
        "/categories/:slug/:tab/sort/:sortKey/page/:page",
        "/categories/sort/:sortKey/page/:page",
        "/brands/:slug",
        "/franchise/:slug",
        "/beys/:slug",
        "/parts/:classification",
        "/parts/:classification/:code",
        "/sublisting-categories/:slug",
        "/collectibles/:city",
        "/faqs",
        "/faqs/:category",
        "/about",
        "/spares",
        "/report",
      ];

      // Content whose body can be edited by an admin or a seller. One hour
      // matches the browse surfaces above; a stale price is bounded by it.
      const DETAIL_CDN_CACHE = LISTING_CDN_CACHE;
      const detailPaths = [
        "/products/:slug",
        "/bundles/:slug",
        "/blog/:slug",
        "/groups/:slug",
        "/reviews/:id",
        "/scams/:id",
        "/sellers/:id",
        "/promotions/:tab",
      ];

      /*
       * Inventory and countdowns. 60 s is still a ~99% cut against a crawler
       * walking thousands of URLs, while staying short enough that a cached
       * page cannot show an "Active" badge and an enabled bid button on a lot
       * that has closed — the affordance half of Root Cause #104, which only
       * became visible once TTLs were raised. Server-side enforcement is
       * independent and unaffected either way: `placeBid` re-reads and rejects.
       */
      const LIVE_CDN_CACHE = "public, s-maxage=60, stale-while-revalidate=300";
      const livePaths = [
        "/auctions/:id",
        "/pre-orders/:id",
        "/classified/:slug",
        "/digital-codes/:slug",
        "/live/:slug",
        "/events/:id",
        "/events/:id/leaderboard",
      ];

      /*
       * 🛑 The locale prefix MUST be constrained to the real locale list.
       *
       * This was `/:locale${p}` — a bare param, which path-to-regexp matches
       * against ANY single segment. So `/products` in the list above also
       * matched **`/admin/products`, `/store/products` and `/api/products`**,
       * handing a public, shared `s-maxage=3600` to two dashboard routes and an
       * API route. Caught by asserting the patterns against Next's own
       * `getPathMatch` rather than by reading them (Root Cause #87 — never
       * trust a rule you have not seen fail).
       *
       * Production was not actually leaking when this was found: `/admin/*`
       * 302s at the middleware and `/store/*` sets a session cookie, and Vercel
       * declines to cache either. But that is the *response* saving us, not the
       * rule — one dashboard route that renders 200 without a cookie would have
       * served one signed-in user's page to the next.
       *
       * Derived from `src/i18n/routing.ts` rather than hardcoded, so adding a
       * locale cannot silently drop its CDN caching. A parse failure falls back
       * to the default locale alone — narrower than reality, never wider, so
       * the failure mode is "a locale stops being cached", not "everything
       * matches again".
       */
      const localeAlternation = (() => {
        const FALLBACK = ["en"];
        let locales = FALLBACK;
        try {
          const src = fs.readFileSync(
            path.join(__dirname, "src/i18n/routing.ts"),
            "utf8",
          );
          const found = /locales:\s*\[([^\]]*)\]/.exec(src)?.[1];
          const parsed = found
            ? [...found.matchAll(/["'`]([a-z]{2}(?:-[A-Za-z0-9]+)?)["'`]/g)].map((m) => m[1])
            : [];
          if (parsed.length > 0) locales = parsed;
        } catch {
          // Fall through to FALLBACK — see the note above on the safe direction.
        }
        return locales.join("|");
      })();

      // next-intl serves the locale-prefixed form of every one of these too.
      const cdnCache = (paths, value) =>
        paths.flatMap((p) => [
          { source: p, headers: [{ key: "Vercel-CDN-Cache-Control", value }] },
          {
            source: `/:locale(${localeAlternation})${p}`,
            headers: [{ key: "Vercel-CDN-Cache-Control", value }],
          },
        ]);

      return [
        {
          // Hashed build output already carries its own immutable headers; this
          // is for the hand-placed assets under public/.
          source: "/images/:path*",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        {
          source: "/media-placeholder.svg",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        ...cdnCache(listingPaths, LISTING_CDN_CACHE),
        ...cdnCache(taxonomyPaths, TAXONOMY_CDN_CACHE),
        ...cdnCache(detailPaths, DETAIL_CDN_CACHE),
        ...cdnCache(livePaths, LIVE_CDN_CACHE),
      ];
    },
    cacheMaxMemorySize: 0,

    // ── Keep appkit out of the server compile graph ───────────────────
    //
    // appkit builds with plain `tsc`: dist/ is 2,387 individual .js files,
    // 1:1 with src, no bundler anywhere in its build script. Nothing
    // externalises it, so Turbopack constructs a graph over all of them —
    // 27 MB, for 774 route entries, in the main process's arena.
    //
    // Measured cost of NOT doing this (3 cold replicates, this machine):
    //   working set    6655 / 8140 / 8415 MB   (spread 1760 MB — noisy)
    //   private commit 8925 / 9021 / 8754 MB   (spread  267 MB — stable)
    //   wall            153 /  126 /  130 s
    // Every one of those exceeds Hobby's 8192 MB container on private commit,
    // as does every one of the 9 historical variants in .build-memory/ — 12 of
    // 12 recorded cold builds. That is the deploy failure, and it is consistent
    // rather than marginal.
    //
    // 🛑 PRIVATE COMMIT IS THE METRIC, not working set. A Linux cgroup kills on
    // something close to it, and it is also the LESS noisy of the two here: the
    // three runs above spanned 1.45-9.12 GB of free RAM and private commit still
    // moved only 267 MB while working set moved 1760 MB. Windows trims working
    // sets under pressure, which is exactly what makes RSS unusable for this.
    //
    // 🛑 This changes NOTHING on Vercel's runtime and nothing in `next dev` —
    // see the preloadEntriesOnStart note below for the minimalMode gate. What it
    // changes is what the BUILD has to parse.
    //
    // 🛑 DO NOT ADD `serverExternalPackages: ["@mohasinac/appkit"]`.
    //
    // Driven all the way to its root cause 2026-10-11 rather than abandoned at
    // the first error. FOUR layers, peeled one at a time; the last one is
    // architectural and is the real answer.
    //
    //   1. dist was not valid native ESM. 10,737 relative specifiers with no
    //      extension, because `tsc` emits them verbatim and Node's resolver
    //      requires one. ✅ FIXED — appkit/scripts/fix-esm-extensions.mjs
    //      rewrites them, verify-esm-dist.mjs gates it in appkit's build. This
    //      is independently correct: a package declaring "type": "module"
    //      should ship loadable ESM.
    //
    //   2. The package's own CSS subpath. `serverExternalPackages` externalises
    //      a package WHOLE, and Next refuses outright:
    //        "The request @mohasinac/appkit/styles matches
    //         serverExternalPackages. Only .mjs, .cjs, .js, .json, or .node can
    //         be handled by Node.js."
    //      ✅ SOLVABLE, and cheaply — the app requested that subpath from
    //      exactly ONE place (src/app/layout.tsx), so copying dist/styles.css
    //      into src/styles/ and importing it there removes the request. Proven
    //      to clear the error; reverted because it buys nothing on its own.
    //      (A CSS `@import` is NOT the alternative — Root Cause #10.)
    //
    //   3. Bare `next/*` specifiers. `next` publishes NO exports map, so Node
    //      resolves `next/server` as a plain path and needs `next/server.js`.
    //      117 such imports in dist. ✅ SOLVABLE by the same rewrite, with a
    //      forward-compat caveat: the day Next adds an exports map declaring
    //      `./server` but not `./server.js`, it inverts.
    //
    //   4. 🛑 appkit's SERVER-REACHABLE MODULES IMPORT ITS UI BARREL, AND THAT
    //      BARREL IMPORTS CSS. `dist/next/middleware/chain.js` transitively
    //      reaches `ui/index.js`, which does `import "./forms/FormShell.style.css"`
    //      — and Node cannot load CSS at ANY path (ERR_UNKNOWN_FILE_EXTENSION,
    //      verified against a file that exists).
    //
    //      Those imports CANNOT simply be deleted: bundle-css.mjs flattens only
    //      the @import chain from dist/styles.css, so component stylesheets
    //      arrive via JS import instead. Measured: `.appkit-formshell` appears
    //      ZERO times in the bundled styles.css. The two mechanisms are
    //      complementary by design.
    //
    // So externalisation is blocked on a real architectural defect, not a flag:
    // a middleware chain should not transitively import React components. That
    // is the same import-hygiene problem as the 417 high-cost sites in appkit —
    // fixing it is worth doing on its own merits, and externalisation would
    // then become available as a side effect.
    //
    // Bundling dist is NOT the alternative either. appkit has 592 `"use client"`
    // and 24 `"use server"` files, and a directive is file-scoped: esbuild
    // SILENTLY DROPS it when bundling (verified on a two-file fixture — the
    // directive simply vanished from the output). Merging modules would erase
    // every RSC boundary. The only bundler mode that preserves them emits one
    // file per input, which is what tsc already does.
    //
    // The anticipated risk — ERR_REQUIRE_ESM at Lambda module load, Root Cause
    // #69 — was never reached at any layer. Every failure here is at build
    // time, local, and loud. That is the one good thing about it.
    // Vercel Hobby build containers are hard-capped at 8GB total RAM — a 731-route
    // app (360 pages + 371 API routes) OOMs during the prerender/compile phase even
    // with a raised --max-old-space-size heap cap, because source-map generation and
    // in-build TypeScript checking are both memory-heavy on top of the V8 heap itself.
    // Type safety is already enforced by `npm run check` (tsc --noEmit on both repos),
    // which gates every deploy via scripts/deploy.mjs's pre-flight — re-checking types
    // a second time inside the Vercel build itself is redundant for this project.
    // Source maps only affect prod stack-trace readability, not app behaviour.
    typescript: {
      ignoreBuildErrors: true,
    },
    productionBrowserSourceMaps: false,
    enablePrerenderSourceMaps: false,
    experimental: {
      serverSourceMaps: false,

      // ── Client router cache ───────────────────────────────────────────
      //
      // `dynamic` defaults to 0 in Next 15+, i.e. a dynamically-rendered page
      // segment is NOT reused at all: every soft navigation back to it refetches
      // the whole RSC payload, which is an Edge Request plus a function
      // invocation each time.
      //
      // That default is expensive here specifically because this app is mostly
      // dynamic — verified against .next/prerender-manifest.json, which holds
      // only 81 static + 75 [locale]-only routes, with every [slug]/[id] content
      // detail route absent from it (they read searchParams or a session, so
      // they render per request). Tab bars and card grids make back-and-forth
      // navigation the normal browsing pattern, so this default was being paid
      // constantly.
      //
      // 180s is a client-side reuse window, not a content-freshness contract:
      // a hard navigation, a reload, and back/forward caching are all
      // unaffected, and shared layouts were already not refetched per navigation.
      staleTimes: {
        dynamic: 180,
        static: 300,
      },

      // ── Local prod-server startup footprint ───────────────────────────
      //
      // Next preloads EVERY page's JavaScript modules into memory when the
      // server starts, rather than at request time — its own memory guide
      // (node_modules/next/dist/docs/01-app/02-guides/memory-usage.md) calls
      // this "a larger initial memory footprint" in exchange for faster first
      // responses. On a 774-route app that is 774 routes' modules resident
      // before the first request.
      //
      // 🛑 READ THE CONDITION BEFORE ASSUMING THIS AFFECTS PRODUCTION. It does
      // not. `next-server.js:467` gates the preload on
      //     if (!options.dev && !this.minimalMode && …preloadEntriesOnStart)
      // and `base-server.js:366` sets `minimalMode` from
      // `NEXT_PRIVATE_MINIMAL_MODE`, which Vercel sets for its serverless
      // output. So on Vercel the preload is ALREADY skipped and this flag is a
      // no-op; and it never applied to `next dev` either, because of the
      // `!options.dev` guard.
      //
      // What it does change is the one place that runs a real `next start`:
      // `npm run dev` (scripts/dev-light.mjs → build + start, the ~500 MB
      // path). That is also the server the Claude tester drives, since
      // tester/scripts/fetch-cases.mjs defaults BASE_URL to localhost:3000 — a
      // batch visits ~12 routes, so preloading all 774 is pure cost.
      //
      // 🛑 It LOWERS THE FLOOR, IT DOES NOT BOUND THE CEILING. Next's guide is
      // explicit that modules are never unloaded: "even with this optimization
      // disabled, the memory footprint will eventually be the same if all pages
      // are eventually requested." A long tester sweep in one server lifetime
      // still grows monotonically — which is why the server is recycled between
      // batches rather than relied upon to shed memory.
      preloadEntriesOnStart: false,

      // ── Static-generation worker pool ─────────────────────────────────
      //
      // 🛑 This is the single most important build-memory setting in this file.
      //
      // next/dist/build/index.js `getNumberOfWorkers()` derives the pool size
      // from `experimental.cpus`, which next/dist/server/config-shared.js
      // defaults to `Math.max(1, os.cpus().length - 1)`. Node's `os.cpus()`
      // reports the HOST core count, NOT the container's cgroup CPU quota — so
      // a 2-vCPU Vercel build container running on a 32-core host asks for 31
      // worker processes.
      //
      // Measured on this repo before the override: 15 workers, and with the
      // default `staticGenerationMaxConcurrency` of 8 (export/worker.js) that is
      // 120 pages rendering simultaneously.
      //
      // And you cannot bound them by heap: the pool is created with
      // `isolatedMemory: true`, and next/dist/lib/worker.js then does
      //     delete nodeOptions['max-old-space-size']
      // so each worker ignores NODE_OPTIONS and falls back to V8's default heap
      // sized off TOTAL SYSTEM RAM. Worker count is the only control there is.
      //
      // Both are env-overridable so a measurement run can isolate one variable:
      //   BUILD_CPUS=15 BUILD_PAGE_CONCURRENCY=8  reproduces the old behaviour
      //                                           exactly (the negative control).
      // See scripts/probe-build-memory.mjs.
      cpus: Number(process.env.BUILD_CPUS ?? 2),
      staticGenerationMaxConcurrency: Number(process.env.BUILD_PAGE_CONCURRENCY ?? 2),

      // ── Compile-phase memory ──────────────────────────────────────────
      //
      // MEASURED 2026-09-13 across 7 valid cold builds (.build-memory/):
      // the compile phase dominates, consistently and by ~3x —
      //   compile            70-122s   6.5-8.4 GB, almost all of it MAIN process
      //   static-generation   26-58s   1.8-3.0 GB
      // So the prerender worker pool above was NOT the binding constraint once
      // capped. The compile phase is, and it lives in the MAIN process because
      // Turbopack runs in a worker thread (`isolatedMemory: false`), sharing
      // that address space. Its Rust arena is invisible to --max-old-space-size.
      //
      // 🛑 THE PHASE ORDERING IS SOLID; THE PER-KNOB DELTAS BELOW ARE NOT.
      // Repeated runs of a byte-identical config measured 6563 / 8398 / 8426 MB
      // peak — a 1.9 GB spread, wider than any effect being hunted. Treat every
      // memory number here as an order of magnitude, never as a comparison, and
      // do not quote a single run as a result. Wall time is the less noisy
      // metric. See scripts/summarize-build-memory.mjs, which now prints the
      // within-config spread as an explicit noise floor and excludes failed runs.
      //
      // turbopackSourceMaps is separate from the three sourcemap flags above:
      // those control emission/consumption, this controls whether Turbopack
      // GENERATES map data during compile at all. No observability regression —
      // productionBrowserSourceMaps and serverSourceMaps are already false, so
      // stacks are already unmapped, and triage here is digest-driven
      // (src/instrumentation.ts records error.digest as the join key).
      //
      // What the measurement actually supports, n=3 valid cold runs each:
      //   OFF  compile 70/81/89s   peak WS median 8398 MB
      //   ON   compile 78/111/122s peak WS median 8307 MB
      // i.e. NO memory benefit — the medians are indistinguishable and OFF is
      // marginally higher. The compile-TIME median is 30s better, but the ranges
      // overlap (one ON run beat two OFF runs), so even that is suggestive
      // rather than established.
      //
      // Kept anyway, because the cost side is zero rather than because the win
      // is proven: productionBrowserSourceMaps and serverSourceMaps are already
      // false, so these maps are generated and then never applied to anything.
      // Turning off work whose output is discarded needs no memory argument.
      //
      // BUILD_TP_SOURCEMAPS=1 restores generation — the negative control, needed
      // because the default is not verifiable from JS (the key appears only in
      // the zod schema; the default lives on the Rust side).
      turbopackSourceMaps: process.env.BUILD_TP_SOURCEMAPS === "1",

      // Turbopack's persistent build cache (Next 16.3). Kept ON — this is the
      // Next default, stated explicitly because it was measured and the
      // intuition against it turned out to be wrong.
      //
      // The worry was that it inflates the compile peak, since the cache is held
      // in memory and flushed at shutdown. Measured: compile time was identical
      // (81s on / 82s off) and peak memory was inside the noise floor. The flush
      // happens AFTER the peak, so there is nothing to reclaim by disabling it —
      // and doing so forfeits the 5.5x speedup on warm repeat builds.
      // BUILD_TP_FSCACHE=0 disables it.
      turbopackFileSystemCacheForBuild: process.env.BUILD_TP_FSCACHE !== "0",

      // 🛑 DO NOT set `turbopackPluginRuntimeStrategy: "workerThreads"`.
      // Next's docstring says it "should use less memory and CPU" than the
      // default childProcesses. On THIS app it is a regression, measured
      // 2026-09-13 at matched RAM:
      // Measured once at compile 94s, against 70-89s for the default. No
      // benefit observed. Same caveat as above: the noise floor makes the
      // memory column unusable, so this is a "did not help" not a quantified
      // regression.
      //
      // Why the docstring's advice inverts here: worker threads share one heap.
      // This build's peak is already main-process-dominated (Turbopack's Rust
      // arena runs in a worker thread with isolatedMemory:false, i.e. in the
      // main address space), so moving plugin work into that same heap stacks it
      // on the peak instead of isolating it in a separate process.

      // 🛑 DO NOT add `optimizePackageImports: ["@mohasinac/appkit"]`.
      // It was measured 2026-09-13 and it is a REGRESSION, not a win:
      //
      // Measured once at compile 119s, against 70-89s for the same config
      // without it. Given the noise floor above, read that as "no benefit
      // observed, and the only signal points the wrong way" rather than as a
      // precise regression figure.
      //
      // Why it backfires here: the SWC transform rewrites named imports to deep
      // imports, but appkit's exports["."] resolves to dist/server-entry.js,
      // which is `export * from "./index"` — a WILDCARD hop above the barrel. To
      // resolve 1,516 imports through that the compiler must walk the whole
      // 5,641-line barrel graph anyway, and then pay the rewriting cost on top.
      // More analysis for no pruning.
      //
      // The durable fix for the barrel is the deep-import migration already
      // mandated by CLAUDE.md Root Cause #18 (Phase 11, W5-1/W5-2) — changing
      // the 1,516 call sites, not asking the bundler to infer them.
    },
    // Turbopack (used by `next build`) does not respect webpack's config.resolve.alias.
    // Without this, appkit/node_modules/firebase and root node_modules/firebase are two
    // separate module instances — initializeApp() registers the app in one, but getAuth()
    // looks in the other and throws "No Firebase App '[DEFAULT]'".
    // Mirrors the webpack alias in defineNextConfig's mergedWebpack (Pattern #14).
    turbopack: {
      resolveAlias: {
        firebase: path.resolve(__dirname, "node_modules/firebase"),
      },
    },
  })
);
