const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");

module.exports = withNextIntl(
  defineNextConfig({
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "**" },
        { protocol: "http", hostname: "**" },
      ],
    },
    // Ensure firebase-admin sub-packages are included in Vercel Lambda bundles.
    // The appkit default only traces database/**; firestore+auth+app are required
    // by the seed API route and all server-side admin SDK calls.
    outputFileTracingIncludes: {
      "/api/**": [
        "./node_modules/firebase-admin/lib/database/**",
        "./node_modules/firebase-admin/lib/esm/database/**",
        "./node_modules/firebase-admin/lib/firestore/**",
        "./node_modules/firebase-admin/lib/esm/firestore/**",
        "./node_modules/firebase-admin/lib/auth/**",
        "./node_modules/firebase-admin/lib/esm/auth/**",
        "./node_modules/firebase-admin/lib/app/**",
        "./node_modules/firebase-admin/lib/esm/app/**",
        "./node_modules/@google-cloud/firestore/build/src/**",
      ],
    },
  })
);
