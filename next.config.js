const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");
const appkitConfig = require("./appkit.config.js");

// Firebase/GCP tracing and base remotePatterns are managed by appkit defaults.
// Unsplash + picsum are used by seed/demo data only; prod listings use Firebase Storage.
module.exports = withNextIntl(
  defineNextConfig({
    images: {
      remotePatterns: appkitConfig.externalImagePatterns ?? [],
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
