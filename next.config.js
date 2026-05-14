const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");

// Firebase/GCP tracing and base remotePatterns are managed by appkit defaults.
// Unsplash + picsum are used by seed/demo data only; prod listings use Firebase Storage.
module.exports = withNextIntl(
  defineNextConfig({
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "picsum.photos" },
      ],
    },
  })
);
