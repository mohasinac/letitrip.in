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

// Images: appkit defaults to `unoptimized: true` so any host works without
// remotePatterns maintenance. Prod images move to Firebase Storage / /api/media.
module.exports = withNextIntl(
  defineNextConfig({
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
    cacheMaxMemorySize: 0,
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
