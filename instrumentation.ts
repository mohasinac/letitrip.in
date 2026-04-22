/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the Node.js server process starts,
 * before any request is handled. This is the correct place for one-time
 * provider registration and DI setup.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initProviders } = await import("./src/providers.config");
      await initProviders();
      console.log("[instrumentation] Providers initialized successfully");
    } catch (error) {
      console.error("[instrumentation] Provider initialization failed:", error);
      throw error; // Fail fast on provider initialization error
    }
  }
}


