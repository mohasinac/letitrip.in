// Bundle analyzer configuration
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Production code has 0 TypeScript errors ✅
    ignoreBuildErrors: false,
  },

  // Note: swcMinify and optimizeFonts are now default in Next.js 16+
  // They have been removed as they're enabled by default

  // Remove console logs in production (keep errors and warnings)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Reduce Docker image size
  output: "standalone",

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  // Experimental features for faster builds
  experimental: {
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-quill",
      "date-fns",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
    // Enable CSS optimization
    optimizeCss: true,
  },

  // Webpack configuration for optimized chunking
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // BUNDLE-2: Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Vendor chunk for stable libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor",
              priority: 10,
              reuseExistingChunk: true,
            },
            // React ecosystem chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: "react-vendor",
              priority: 20,
              reuseExistingChunk: true,
            },
            // Firebase chunk
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|firebase-admin)[\\/]/,
              name: "firebase-vendor",
              priority: 15,
              reuseExistingChunk: true,
            },
            // UI libraries chunk
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|recharts|react-quill|quill)[\\/]/,
              name: "ui-vendor",
              priority: 12,
              reuseExistingChunk: true,
            },
            // DnD kit chunk
            dnd: {
              test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
              name: "dnd-vendor",
              priority: 12,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              name: "common",
            },
          },
          // Optimize chunk size
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          minSize: 20000,
        },
        // Enable runtime chunk for better caching
        runtimeChunk: {
          name: "runtime",
        },
      };
    }

    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
    qualities: [75, 85], // Add quality 85 to supported qualities
  },
};

module.exports = withBundleAnalyzer(nextConfig);
