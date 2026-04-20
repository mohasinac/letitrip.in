const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep appkit bundled by Next so subpath imports such as
  // @mohasinac/appkit/server do not rely on Node external ESM resolution.
  transpilePackages: ["@mohasinac/appkit"],
  serverExternalPackages: ["@upstash/ratelimit", "@upstash/redis"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // Local network access (dev)
      { protocol: "http", hostname: "192.168.1.*" },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
