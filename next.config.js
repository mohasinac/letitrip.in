/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
