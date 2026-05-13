const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
const { defineNextConfig } = require("@mohasinac/appkit/configs");

// All Firebase/GCP tracing and image remotePatterns are managed by appkit defaults.
// Only add genuine consumer-specific overrides here.
module.exports = withNextIntl(defineNextConfig());
