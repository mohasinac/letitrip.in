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
      instagram: "https://instagram.com/letitrip.in",
      twitter: "https://twitter.com/letitrip_in",
      whatsapp: "https://wa.me/c/917000000000",
    },
  },

  // ─── SEO defaults ────────────────────────────────────────────────────────
  seo: {
    siteUrl: "https://letitrip.in",
    defaultTitle: "letitrip — Curated Marketplace",
    defaultDescription:
      "Discover unique products, auctions, and pre-orders on letitrip — your curated online marketplace.",
    defaultImage: "/images/og-default.png",
    siteName: "letitrip",
    twitterHandle: "@letitrip",
    locale: "en-IN",
  },

  // ─── i18n / next-intl routing ────────────────────────────────────────────
  i18n: {
    // Suppress the Set-Cookie: Next-Locale header so Vercel ISR caching works.
    // Only valid while the app runs a single locale (en).
    localePrefix: "never",
    enableLocaleCookie: false,
  },

  // ─── External image hosts (demo / seed data only) ────────────────────────
  // prod listings use Firebase Storage via the /api/media proxy — not these hosts.
  externalImagePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "picsum.photos" },
  ],

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
