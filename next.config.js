const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }, { protocol: "http", hostname: "**" }],
  },
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@google-cloud/common",
    "google-auth-library",
    "google-gax",
    "gaxios",
    "gtoken",
    "jws",
    "teeny-request",
    "http-proxy-agent",
    "https-proxy-agent",
    "configstore",
    "graceful-fs",
    "make-dir",
    "write-file-atomic",
    "dot-prop",
    "json-file-plus",
    "@mohasinac/sievejs",
  ],
};

module.exports = withNextIntl(nextConfig);
