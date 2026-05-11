// appkit.config.js — configuration for @mohasinac/appkit CLI tools
// Run "npx appkit-smoke-ssr", "npx appkit-smoke-bundle", etc. after setup.

/** @type {import("@mohasinac/appkit").AppkitConfig} */
const config = {
  baseUrl: "http://localhost:3000",
  locales: ["en"],

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

  firebase: {
    projectId: "letitrip-in",
    indexesPath: "appkit/firebase/base/firestore.indexes.json",
    functionsRegion: "asia-south1",
  },

  vercel: {
    projectId: "letitrip-in",
  },
};

module.exports = config;
