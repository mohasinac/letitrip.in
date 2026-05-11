const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");

/**
 * Firebase-admin + GCP externals, IgnorePlugin, and outputFileTracingIncludes
 * are baked into defineNextConfig() — no manual plumbing needed here.
 */
module.exports = withNextIntl(
  defineNextConfig({
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "**" },
        { protocol: "http", hostname: "**" },
      ],
    },
  })
);
