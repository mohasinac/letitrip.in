const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep appkit bundled by Next so subpath imports such as
  // @mohasinac/appkit/server do not rely on Node external ESM resolution.
  transpilePackages: ["@mohasinac/appkit"],
  serverExternalPackages: [
    "@upstash/ratelimit",
    "@upstash/redis",
    // Exclude all Firebase Admin and Google Cloud packages from client bundle
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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.pokemontcg.io" },
      // Local network access (dev)
      { protocol: "http", hostname: "192.168.1.*" },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
