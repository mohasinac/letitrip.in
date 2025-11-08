/**
 * Next.js Instrumentation
 * Called once when the server starts (dev and production)
 * 
 * To use:
 * 1. Add "experimental: { instrumentationHook: true }" to next.config.js
 * 2. This file will be automatically imported on server start
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry for error monitoring
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const { initSentry } = await import('./src/lib/sentry');
      initSentry();
    }
    
    // Import and initialize server-side services
    const { initializeServer } = await import('./src/lib/server-init');
    initializeServer();
  }
}
