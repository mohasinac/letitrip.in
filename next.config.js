/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Production code has 0 TypeScript errors ✅
    ignoreBuildErrors: false,
  },

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  // Experimental features for faster builds
  experimental: {
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ["lucide-react", "recharts", "react-quill"],
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
  },
};

module.exports = nextConfig;
