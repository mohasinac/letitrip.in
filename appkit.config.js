// appkit.config.js — configuration for @mohasinac/appkit CLI tools
// Run "npx appkit-smoke-ssr", "npx appkit-smoke-bundle", etc. after setup.

/** @type {import("@mohasinac/appkit").AppkitConfig} */
const config = {
  baseUrl: "http://localhost:3000",
  locales: ["en"],

  // ─── Brand & identity ────────────────────────────────────────────────────
  brand: {
    name: "LetItRip",
    shortName: "LT",
    description:
      "India's collector-first marketplace for figures, TCG gear, cosplay, and curated collectibles. Trusted sellers, authentic products.",
    madeInText: "Made with ♥ for collectors",
    socialUrls: {
      whatsapp: "https://chat.whatsapp.com/JOlbdSwhVWYDKujolcBZDr",
      github: "https://github.com/mohasinac",
    },
  },

  // ─── SEO defaults ────────────────────────────────────────────────────────
  // 🛑 `siteUrl` is THE canonical host, and this is its ONLY definition.
  //
  // src/constants/seo.server.ts derives LETITRIP_SEO.siteUrl from this value
  // (via SEO_CONFIG) rather than reading env itself. It used to have its own
  // `NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_SITE_URL || "https://letitrip.in"`
  // chain, and a comment here claiming the two were "kept in sync". They were
  // not: once NEXT_PUBLIC_SITE_URL was set to the www host on Vercel, the
  // env-driven path (page canonicals, og:url, JSON-LD) said www while this
  // hardcoded literal (robots.txt Host/Sitemap, every sitemap <loc>, root
  // metadataBase) still said apex. Result: all 182 sitemap URLs pointed at a
  // host that 307-redirects, and the site fell out of Google.
  //
  // Two owners of one value is the bug. Keep it to one.
  // Enforced by scripts/audit-seo-canonical-host.mjs.
  //
  // Must include the scheme, must NOT have a trailing slash, and must match the
  // Vercel primary domain — the other host 308-redirects to it.
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.letitrip.in",
    defaultTitle: "LetItRip — India's Collectibles Marketplace",
    defaultDescription:
      "Buy, sell & auction action figures, trading cards, spinning tops, model kits and more. India's largest collectibles marketplace.",
    defaultImage: "/media/site-og-image",
    siteName: "LetItRip",
    locale: "en_IN",
  },

  // ─── i18n / next-intl routing ────────────────────────────────────────────
  i18n: {
    // Suppress the Set-Cookie: Next-Locale header so Vercel ISR caching works.
    // Only valid while the app runs a single locale (en).
    localePrefix: "never",
    enableLocaleCookie: false,
  },

  // ─── Smoke tests & theme probes ──────────────────────────────────────────
  routes: {
    smoke: [
      { path: "/", expect: ["LetItRip"] },
      { path: "/en", expect: ["LetItRip"] },
      { path: "/en/products", expect: ["Products", "LetItRip"] },
      { path: "/sitemap.xml", expect: ["<urlset"] },
      { path: "/robots.txt", expect: ["User-agent"] },
    ],
    themeProbe: [
      { path: "/en", screenshotName: "home" },
      { path: "/en/products", screenshotName: "products-list" },
    ],
  },

  bundleForbidden: ["firebase-admin", "node:fs", "node:child_process"],

  // authFixtures: set ADMIN_FIXTURE_TOKEN etc. from your test environment
  // authFixtures: {
  //   admin:  { cookie: "session=ADMIN_FIXTURE_TOKEN" },
  //   seller: { cookie: "session=SELLER_FIXTURE_TOKEN" },
  //   buyer:  { cookie: "session=BUYER_FIXTURE_TOKEN" },
  // },

  themeOverrides: {
    "--appkit-color-primary":   "#FF0066",
    "--appkit-color-secondary": "#0066FF",
  },

  // ─── Firebase ────────────────────────────────────────────────────────────
  firebase: {
    projectId: "letitrip-in",
    indexesPath: "appkit/firebase/base/firestore.indexes.json",
    functionsRegion: "asia-south1",
    extensions: {
      /** @type {import("@mohasinac/appkit").FirestoreIndex[]} */
      indexes: [],
      fieldOverrides: [],
      database: {},
      firestoreRules: "",
      storageRules: "",
    },
  },

  // ─── Vercel ──────────────────────────────────────────────────────────────
  vercel: {
    projectId: "letitrip-in",
    regions: ["bom1"],
  },
};

module.exports = config;
