/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Turbopack to handle server-side Node.js modules
  serverExternalPackages: [
    'crypto',
    'bcryptjs',
    'firebase-admin',
    '@auth/firebase-adapter',
  ],
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
