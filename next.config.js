/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for both dev and production
  webpack: (config, { isServer, dev }) => {
    // Add polyfills for Node.js core modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
      };
    }
    
    return config;
  },
  
  // Add empty turbopack config to silence webpack/turbopack conflict warning
  turbopack: {},
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
