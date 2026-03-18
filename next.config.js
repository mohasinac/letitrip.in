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

  // Allow Next.js webpack to transpile workspace packages (@mohasinac/*).
  // These packages resolve via tsconfig paths to packages/*/src/ TypeScript
  // source — not pre-compiled dist — so webpack must transform them.
  //
  // The list is derived from features.config.ts (see src/features.config.ts)
  // using the same ALWAYS_TRANSPILE + FEATURE_PACKAGE_MAP logic as
  // @mohasinac/cli/next withFeatures(). next.config.js runs as plain Node.js
  // (before webpack), so we inline the resolution here rather than requiring
  // the TypeScript source of @mohasinac/cli/next.
  transpilePackages: (() => {
    // Packages always needed regardless of which features are enabled.
    const ALWAYS = [
      "@mohasinac/contracts",
      "@mohasinac/core",
      "@mohasinac/react",
      "@mohasinac/ui",
      "@mohasinac/http",
      "@mohasinac/next",
      "@mohasinac/tokens",
      "@mohasinac/css-tailwind",
      "@mohasinac/css-vanilla",
      "@mohasinac/cli",
      "@mohasinac/db-firebase",
      "@mohasinac/auth-firebase",
      "@mohasinac/email-resend",
      "@mohasinac/storage-firebase",
      "@mohasinac/errors",
      "@mohasinac/security",
      "@mohasinac/validation",
      "@mohasinac/utils",
      "@mohasinac/seo",
      "@mohasinac/monitoring",
    ];

    // Maps features.config.ts keys → @mohasinac/feat-* package names.
    // Keep in sync with packages/cli/src/next.ts FEATURE_PACKAGE_MAP.
    /** @type {Record<string, string>} */
    const FEATURE_PACKAGE_MAP = {
      layout: "@mohasinac/feat-layout",
      forms: "@mohasinac/feat-forms",
      filters: "@mohasinac/feat-filters",
      media: "@mohasinac/feat-media",
      auth: "@mohasinac/feat-auth",
      account: "@mohasinac/feat-account",
      products: "@mohasinac/feat-products",
      categories: "@mohasinac/feat-categories",
      cart: "@mohasinac/feat-cart",
      wishlist: "@mohasinac/feat-wishlist",
      checkout: "@mohasinac/feat-checkout",
      orders: "@mohasinac/feat-orders",
      payments: "@mohasinac/feat-payments",
      blog: "@mohasinac/feat-blog",
      reviews: "@mohasinac/feat-reviews",
      faq: "@mohasinac/feat-faq",
      search: "@mohasinac/feat-search",
      homepage: "@mohasinac/feat-homepage",
      admin: "@mohasinac/feat-admin",
      events: "@mohasinac/feat-events",
      auctions: "@mohasinac/feat-auctions",
      promotions: "@mohasinac/feat-promotions",
      seller: "@mohasinac/feat-seller",
      stores: "@mohasinac/feat-stores",
      "pre-orders": "@mohasinac/feat-pre-orders",
      consultation: "@mohasinac/feat-consultation",
      concern: "@mohasinac/feat-concern",
      corporate: "@mohasinac/feat-corporate",
      "before-after": "@mohasinac/feat-before-after",
      loyalty: "@mohasinac/feat-loyalty",
      collections: "@mohasinac/feat-collections",
      preorders: "@mohasinac/feat-preorders",
      "whatsapp-bot": "@mohasinac/feat-whatsapp-bot",
    };

    // features.config.ts (mirrored as a JS-safe value here; the canonical
    // source of truth is src/features.config.ts — keep both in sync).
    // true  = feature enabled for this project
    // false = feature disabled (no transpilePackages entry added)
    /** @type {Record<string, boolean>} */
    const features = {
      // Shell (always on)
      layout: true,
      forms: true,
      filters: true,
      media: true,
      // Shared domain
      auth: true,
      account: true,
      products: true,
      categories: true,
      cart: true,
      wishlist: true,
      checkout: true,
      orders: true,
      payments: true,
      blog: true,
      reviews: true,
      faq: true,
      search: true,
      homepage: true,
      admin: true,
      // letitrip-specific
      events: true,
      auctions: true,
      promotions: true,
      seller: true,
      stores: true,
      "pre-orders": true,
      // Other projects — not used here
      consultation: false,
      concern: false,
      corporate: false,
      "before-after": false,
      loyalty: false,
      collections: false,
      preorders: false,
      "whatsapp-bot": false,
    };

    const featPkgs = Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([key]) => FEATURE_PACKAGE_MAP[key])
      .filter(Boolean);

    return [...ALWAYS, ...featPkgs];
  })(),

  // Workspace packages use ESM-style `.js` extensions in TS imports
  // (e.g. `from "./provider.js"`). Webpack needs extensionAlias so it
  // can resolve `.js` → `.ts` / `.tsx` when transpiling from source.
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },

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
