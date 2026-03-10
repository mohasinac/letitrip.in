/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const withSerwist = require("@serwist/next").default;

// next-intl plugin — wires src/i18n/request.ts as the per-request i18n config
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  // Image optimization for Firebase Storage and other remote sources
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'none'; style-src 'unsafe-inline'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth profile photos
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Seed data placeholder images
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // Seed data placeholder images
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Avatar placeholders
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Allow Turbopack and webpack to handle server-side Node.js modules
  serverExternalPackages: [
    "crypto",
    "bcryptjs",
    "firebase-admin",
    "@auth/firebase-adapter",
    "@mohasinac/sievejs",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Allow Next.js webpack to transpile workspace packages (@lir/*).
  // These packages resolve via tsconfig paths to packages/*/src/ TypeScript
  // source — not pre-compiled dist — so webpack must transform them.
  transpilePackages: [
    "@lir/core",
    "@lir/react",
    "@lir/ui",
    "@lir/http",
    "@lir/next",
  ],

  // Turbopack is used for `next dev --turbopack` only.
  // Production builds use webpack via `next build --webpack` because Turbopack
  // has a chunk-generation bug in Next.js 16 with large deeply-nested `as const`
  // objects (EcmascriptModuleContent::new_merged) — tracked in TECH_DEBT.md.
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy — set dynamically per-request in middleware.ts
          // with a per-request nonce that eliminates unsafe-eval in prod.
          // Leaving an empty placeholder so the header is still explicit.
          // The dynamic value in middleware.ts takes precedence.
        ],
      },
    ];
  },
};

module.exports = withNextIntl(
  withBundleAnalyzer(
    withSerwist({
      swSrc: "src/sw.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
      // Disable in development to avoid service worker caching issues during dev
      disable: process.env.NODE_ENV === "development",
    })(nextConfig),
  ),
);
