const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");
const consumerPkg = require("./package.json");
const appkitPkg = require("./appkit/package.json");

// Build-time version stamping — exposed via NEXT_PUBLIC_* so the footer can show
// what's actually deployed. Lets us visually confirm a redeploy without curling
// pages or rebuilding the audit.
const APP_VERSION = consumerPkg.version || "0.0.0";
const APPKIT_VERSION = appkitPkg.version || "0.0.0";
const COMMIT_SHA = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);
const BUILD_TIME = new Date().toISOString();

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
    cacheMaxMemorySize: 0,
    // Turbopack (used by `next build`) does not respect webpack's config.resolve.alias.
    // Without these, packages installed at multiple paths in the monorepo get bundled
    // as separate module instances, producing two separate React context registries:
    //   - firebase: two app registries → "No Firebase App '[DEFAULT]'"
    //   - @tanstack/react-query: two QueryClientContext instances → "No QueryClient set"
    // Pinning every import to a single root path keeps the context singletons shared.
    // Mirrors the webpack alias in defineNextConfig's mergedWebpack (Pattern #14).
    turbopack: {
      resolveAlias: {
        firebase: path.resolve(__dirname, "node_modules/firebase"),
        "@tanstack/react-query": path.resolve(
          __dirname,
          "node_modules/@tanstack/react-query",
        ),
        "@tanstack/query-core": path.resolve(
          __dirname,
          "node_modules/@tanstack/query-core",
        ),
      },
    },
    webpack: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@tanstack/react-query": path.resolve(
          __dirname,
          "node_modules/@tanstack/react-query",
        ),
        "@tanstack/query-core": path.resolve(
          __dirname,
          "node_modules/@tanstack/query-core",
        ),
      };
      return config;
    },
  })
);
