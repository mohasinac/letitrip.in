const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

// Packages that must never be bundled by webpack (server-only native / ESM-only)
const SERVER_EXTERNAL = [
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
  // Deep deps of @google-cloud/storage — optional native bindings
  "retry-request",
  "hash-stream-validation",
  "fast-crc32c",
  "request",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }, { protocol: "http", hostname: "**" }],
  },
  serverExternalPackages: SERVER_EXTERNAL,
  // appkit uses (module as any).require("firebase-admin/database") — a pattern that intentionally
  // escapes webpack's static analysis so the module is NOT added to the webpack module graph.
  // Vercel's output file tracer therefore never sees this dependency and excludes
  // lib/database/** from the Lambda bundle, causing a runtime "Cannot find module" error.
  // outputFileTracingIncludes forces Vercel to copy these files for every API route.
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": [
        "./node_modules/firebase-admin/lib/database/**",
        "./node_modules/firebase-admin/lib/esm/database/**",
      ],
    },
  },
  webpack(config, { isServer, webpack }) {
    if (isServer) {
      // serverExternalPackages only matches root node_modules/.
      // appkit is a file: dep whose local node_modules/ resolves firebase-admin
      // and GCP packages separately — externalize those too.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        ({ request }, callback) => {
          if (request && SERVER_EXTERNAL.some((pkg) => request === pkg || request.startsWith(pkg + "/"))) {
            return callback(null, "commonjs " + request);
          }
          callback();
        },
      ];

      // Suppress "Module not found" warnings for optional native deps that
      // firebase-admin wraps in try/catch and degrades gracefully without.
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(request|fast-crc32c)$/,
        })
      );
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
