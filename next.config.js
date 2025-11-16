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
    ],
    // Enable CSS optimization
    optimizeCss: true,
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
