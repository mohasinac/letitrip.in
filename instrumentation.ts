/**
 * Next.js Instrumentation
 * Called once when the server starts (dev and production)
 *
 * To use:
 * 1. Add "experimental: { instrumentationHook: true }" to next.config.js
 * 2. This file will be automatically imported on server start
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import and initialize server-side services
    const { initializeServer } = await import("./src/app/api/lib/utils/server-init");
    initializeServer();
  }
}
