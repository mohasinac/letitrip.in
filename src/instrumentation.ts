/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the Node.js server process starts,
 * before any request is handled — including API routes.
 *
 * This is the correct place for one-time server-side initialization that
 * must run before both page RSC renders AND API route handlers.
 *
 * Why this file exists:
 *   `src/app/layout.tsx` imports `@/providers.config` but Next.js App Router
 *   API routes never go through the layout tree. Any @mohasinac/feat-* handler
 *   that calls `getProviders()` would crash with "Call registerProviders() before
 *   getProviders()" if providers are only registered in the layout.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Import providers in any non-Edge runtime (Node.js server, standalone, etc.).
  // process.env.NEXT_RUNTIME is "edge" for middleware / edge functions.
  // In Turbopack dev mode it may also be undefined, so guard with !== "edge"
  // rather than === "nodejs" to avoid silently skipping the import.
  if (process.env.NEXT_RUNTIME !== "edge") {
    // `await import("./providers.config")` only waits for the module LOAD, not
    // for the async webpack-module initialization inside it. Explicitly calling
    // and awaiting initProviders() ensures registerProviders() has completed
    // before the first request is handled.
    try {
      const { initProviders } = await import("./providers.config");
      await initProviders();
      // eslint-disable-next-line no-console
      console.log("[instrumentation] registerProviders() completed ✓");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[instrumentation] initProviders() FAILED:", err);
    }
  }
}
