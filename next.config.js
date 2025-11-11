/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ESLint configuration
  eslint: {
    // Warnings are for development improvement - don't fail builds
    // This allows deployment while maintaining code quality standards
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    // Don't fail on type errors during build (handled separately)
    ignoreBuildErrors: false,
  },

  // Note: swcMinify is enabled by default in Next.js 15+

  // Reduce module count by optimizing imports
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },

  // Experimental features for faster builds
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react", "recharts", "react-quill"],
  },

  // Image optimization
  images: {
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
        hostname: "images.unsplash.com",
        protocol: "https",
      },
      {
        hostname: "via.placeholder.com",
        protocol: "https",
      },
      { hostname: "source.unsplash.com", protocol: "https" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
