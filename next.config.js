/** @type {import('next').NextConfig} */
const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const withSerwist = require("@serwist/next").default;

// next-intl plugin — wires src/i18n/request.ts as the per-request i18n config
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// ---------------------------------------------------------------------------
// Local package resolution — only active in local dev (USE_LOCAL_PACKAGES=true)
//
// Turbopack limitation: resolveAlias paths that resolve to absolute paths
// OUTSIDE the project root are automatically externalized by Turbopack.
// Externalization works for the Node.js server context but not in browser/edge
// contexts ("chunking context does not support external modules").
// Therefore resolveAlias is NOT used for Turbopack; both Turbopack (dev) and
// webpack (prod) use node_modules which already contains compiled dist/.
//
// To pick up live source changes during development:
//   cd D:\proj\packages\packages\<name> && npm run dev   (runs tsup --watch)
// Then the updated dist/ is used by the Next.js dev server on next HMR reload.
// ---------------------------------------------------------------------------
const USE_LOCAL_PACKAGES = process.env.USE_LOCAL_PACKAGES === "true";
const PACKAGES_ROOT = path.resolve(__dirname, "../packages/packages");

const MOHASINAC_PACKAGES = [
  "auth-firebase",
  "cli",
  "contracts",
  "core",
  "css-tailwind",
  "css-vanilla",
  "db-firebase",
  "email-resend",
  "errors",
  "feat-account",
  "feat-admin",
  "feat-auctions",
  "feat-auth",
  "feat-before-after",
  "feat-blog",
  "feat-cart",
  "feat-categories",
  "feat-checkout",
  "feat-collections",
  "feat-consultation",
  "feat-corporate",
  "feat-events",
  "feat-faq",
  "feat-filters",
  "feat-forms",
  "feat-homepage",
  "feat-layout",
  "feat-loyalty",
  "feat-media",
  "feat-orders",
  "feat-payments",
  "feat-pre-orders",
  "feat-preorders",
  "feat-products",
  "feat-promotions",
  "feat-reviews",
  "feat-search",
  "feat-seller",
  "feat-stores",
  "feat-whatsapp-bot",
  "feat-wishlist",
  "http",
  "monitoring",
  "next",
  "react",
  "security",
  "seo",
  "storage-firebase",
  "tokens",
  "ui",
  "utils",
  "validation",
];

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

  // Allow Turbopack and webpack to handle server-side Node.js modules.
  // @mohasinac/* packages are Junction-symlinked on Windows; Turbopack cannot
  // follow junctions so they must be externalized (loaded by Node.js directly).
  serverExternalPackages: [
    "crypto",
    "bcryptjs",
    "firebase-admin",
    "@auth/firebase-adapter",
    "@mohasinac/sievejs",
    "@mohasinac/auth-firebase",
    "@mohasinac/contracts",
    "@mohasinac/core",
    "@mohasinac/css-tailwind",
    "@mohasinac/css-vanilla",
    "@mohasinac/db-firebase",
    "@mohasinac/email-resend",
    "@mohasinac/errors",
    "@mohasinac/feat-account",
    "@mohasinac/feat-admin",
    "@mohasinac/feat-auctions",
    "@mohasinac/feat-auth",
    "@mohasinac/feat-before-after",
    "@mohasinac/feat-blog",
    "@mohasinac/feat-cart",
    "@mohasinac/feat-categories",
    "@mohasinac/feat-checkout",
    "@mohasinac/feat-collections",
    "@mohasinac/feat-consultation",
    "@mohasinac/feat-corporate",
    "@mohasinac/feat-events",
    "@mohasinac/feat-faq",
    "@mohasinac/feat-filters",
    "@mohasinac/feat-forms",
    "@mohasinac/feat-homepage",
    "@mohasinac/feat-layout",
    "@mohasinac/feat-loyalty",
    "@mohasinac/feat-media",
    "@mohasinac/feat-orders",
    "@mohasinac/feat-payments",
    "@mohasinac/feat-pre-orders",
    "@mohasinac/feat-preorders",
    "@mohasinac/feat-products",
    "@mohasinac/feat-promotions",
    "@mohasinac/feat-reviews",
    "@mohasinac/feat-search",
    "@mohasinac/feat-seller",
    "@mohasinac/feat-stores",
    "@mohasinac/feat-whatsapp-bot",
    "@mohasinac/feat-wishlist",
    "@mohasinac/http",
    "@mohasinac/monitoring",
    "@mohasinac/next",
    "@mohasinac/payment-razorpay",
    "@mohasinac/react",
    "@mohasinac/search-algolia",
    "@mohasinac/security",
    "@mohasinac/seo",
    "@mohasinac/shipping-shiprocket",
    "@mohasinac/storage-firebase",
    "@mohasinac/tokens",
    "@mohasinac/ui",
    "@mohasinac/utils",
    "@mohasinac/validation",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Turbopack is used for `next dev --turbopack` only.
  // Production builds use webpack via `next build --webpack` because Turbopack
  // has a chunk-generation bug in Next.js 16 with large deeply-nested `as const`
  // objects (EcmascriptModuleContent::new_merged) — tracked in TECH_DEBT.md.
  turbopack: {},

  // webpack is used for production builds only (`next build`).
  // When USE_LOCAL_PACKAGES=true we alias @mohasinac/* to the local dist/
  // so the production bundle uses the same compiled output as node_modules
  // but resolves through the workspace source tree for easier debugging.
  webpack(config) {
    if (USE_LOCAL_PACKAGES) {
      config.resolve.alias = {
        ...config.resolve.alias,
        ...Object.fromEntries(
          MOHASINAC_PACKAGES.flatMap((pkg) => [
            [
              `@mohasinac/${pkg}$`,
              path.join(PACKAGES_ROOT, pkg, "dist", "index.js"),
            ],
            [`@mohasinac/${pkg}`, path.join(PACKAGES_ROOT, pkg, "dist")],
          ]),
        ),
      };
    }
    return config;
  },

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
