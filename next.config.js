/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for Firebase Storage and other remote sources
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
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth profile photos
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Seed data placeholder images
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

  // Allow Turbopack to handle server-side Node.js modules
  serverExternalPackages: [
    "crypto",
    "bcryptjs",
    "firebase-admin",
    "@auth/firebase-adapter",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Turbopack configuration (empty config to silence webpack warning)
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
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-inline/eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebase.com https://*.firebaseio.com https://*.cloudfunctions.net",
              "frame-src 'self' https://accounts.google.com https://appleid.apple.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
