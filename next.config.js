// next-intl plugin — wires src/i18n/request.ts as the per-request i18n config
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mohasinac/appkit"],

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
  serverExternalPackages: [
    "crypto",
    "bcryptjs",
    "firebase-admin",
    "firebase-admin/app",
    "firebase-admin/auth",
    "firebase-admin/firestore",
    "firebase-admin/storage",
    "firebase-admin/database",
    "@auth/firebase-adapter",
    "@mohasinac/sievejs",
  ],

  experimental: {
    externalDir: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  devIndicators: false,

  webpack: (config, { isServer, webpack }) => {
    // Force all react-query and react instances to resolve to letitrip's
    // own copies, preventing dual-instance errors when appkit is a symlinked
    // workspace package with its own node_modules.
    const path = require("path");
    const nm = (pkg) => path.resolve(__dirname, "node_modules", pkg);

    // Prioritise letitrip's node_modules so that appkit's nested copies of
    // singleton packages (react, react-dom, next-intl, etc.) are never used.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules || ["node_modules"]),
    ];

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: nm("react"),
      "react-dom": nm("react-dom"),
      "react/jsx-runtime": nm("react/jsx-runtime"),
      "react/jsx-dev-runtime": nm("react/jsx-dev-runtime"),
      "@tanstack/react-query": nm("@tanstack/react-query"),
      "firebase-admin": nm("firebase-admin"),
      "firebase/app": nm("firebase/app"),
      "firebase/auth": nm("firebase/auth"),
      "firebase/firestore": nm("firebase/firestore"),
      "firebase/storage": nm("firebase/storage"),
    };

    if (!isServer) {
      // Server-only appkit providers must not be bundled for the browser.
      const serverOnlyStub = path.resolve(
        __dirname,
        "src/__mocks__/server-only-empty.js",
      );

      // The shared alias above set "firebase-admin" as a prefix alias, which
      // would intercept "firebase-admin/app", "firebase-admin/auth", etc.
      // BEFORE our specific subpath stubs below (webpack matches the first alias
      // that fits in iteration order).  Delete the prefix alias, then re-add it
      // AFTER the specific stubs so the specific stubs win.
      const baseAliases = { ...config.resolve.alias };
      delete baseAliases["firebase-admin"];

      config.resolve.alias = {
        ...baseAliases,
        "@mohasinac/appkit/providers/db-firebase": serverOnlyStub,
        "@mohasinac/appkit/providers/auth-firebase": serverOnlyStub,
        // Specific firebase-admin subpaths — must come BEFORE the prefix alias.
        "firebase-admin/app": serverOnlyStub,
        "firebase-admin/auth": serverOnlyStub,
        "firebase-admin/firestore": serverOnlyStub,
        "firebase-admin/storage": serverOnlyStub,
        "firebase-admin/database": serverOnlyStub,
        // General prefix alias comes last so specific ones above win.
        "firebase-admin": serverOnlyStub,
        "node:crypto": require.resolve("crypto-browserify"),
        crypto: require.resolve("crypto-browserify"),
      };

      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
      };

      // Replace any firebase-admin module that makes it through the alias
      // (e.g. via transpilePackages source-file resolution) with an empty stub
      // so the browser bundle never contains firebase-admin code.
      const emptyLoader = require.resolve("./src/__mocks__/empty-loader.js");
      // Module rule for node_modules/firebase-admin (catches direct requires)
      config.module.rules.push({
        test: /[\\/]node_modules[\\/]firebase-admin[\\/]/,
        use: [emptyLoader],
      });

      // NormalModuleReplacementPlugin intercepts at resolve-time, before any
      // loader runs — this is needed for transpilePackages source files where
      // the regular alias check is bypassed because webpack already has a
      // resolved file path.
      // NOTE: resourceRegExp is matched against the RAW REQUEST string, not the
      // resolved path. So match the package specifier patterns.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@mohasinac\/appkit\/providers\/(db-firebase|auth-firebase)(\/|$)/,
          serverOnlyStub,
        ),
      );

      // Also add absolute-path based aliases for the specific appkit source files
      // that get resolved via transpilePackages — webpack applies these AFTER
      // the module resolution, matching on the resolved file path.
      // Add BOTH the real path and the symlink/junction path to cover both cases
      // (webpack may resolve symlinks or keep the junction path depending on config).
      // Normalize to forward slashes — webpack uses forward-slash paths on all platforms.
      const appkitRoot = path.resolve(__dirname, "..", "appkit", "src").replace(/\\/g, "/");
      const appkitJunctionRoot = path.resolve(__dirname, "node_modules", "@mohasinac", "appkit", "src").replace(/\\/g, "/");
      for (const root of [appkitRoot, appkitJunctionRoot]) {
        for (const relFile of [
          "providers/db-firebase/index.ts",
          "providers/db-firebase/admin.ts",
          "providers/db-firebase/base.ts",
          "providers/db-firebase/sieve.ts",
          "providers/db-firebase/realtime.ts",
          "providers/db-firebase/helpers.ts",
          "providers/auth-firebase/index.ts",
        ]) {
          const fwdSlash = `${root}/${relFile}`;
          const backSlash = fwdSlash.replace(/\//g, "\\");
          config.resolve.alias[fwdSlash] = serverOnlyStub;
          config.resolve.alias[backSlash] = serverOnlyStub;
        }
      }

      // Push externals function to catch firebase-admin requests that slip past
      // the NormalModuleReplacementPlugin (e.g. from next-flight-action loader).
      // Returning undefined keeps webpack's normal behaviour; returning {} stubs it.
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) config.externals = [config.externals];
      config.externals.push(({ request }, callback) => {
        if (
          request &&
          (request.startsWith("firebase-admin") || request.startsWith("@google-cloud/firestore"))
        ) {
          // "var {}" makes webpack evaluate to an empty object in browser bundles
          return callback(null, "var {}");
        }
        callback();
      });
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
          // Content Security Policy — set dynamically per-request in proxy.ts
          // with a per-request nonce that eliminates unsafe-eval in prod.
          // Leaving an empty placeholder so the header is still explicit.
          // The dynamic value in proxy.ts takes precedence.
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
