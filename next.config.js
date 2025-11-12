/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Don't fail on type errors during build (handled separately)
    ignoreBuildErrors: false,
  },

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
