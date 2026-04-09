/**
 * providers.config.ts — Dependency Injection wiring for letitrip.in
 *
 * `initProviders()` must be called and awaited before any route handler
 * runs. It is called in `instrumentation.ts → register()` which Next.js
 * awaits before serving the first request.
 *
 * All `@mohasinac/*` packages are listed in `serverExternalPackages`, so
 * webpack loads them as async ESM. A plain `import` side-effect cannot be
 * reliably awaited across webpack's async-module boundary. Exporting an
 * explicit async function and awaiting its return value bypasses this
 * limitation: the caller awaits the real Promise, not just the module load.
 */

let initPromise: Promise<void> | null = null;

/**
 * Idempotent — safe to call multiple times; runs exactly once per process.
 */
export function initProviders(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { registerProviders } = await import("@mohasinac/appkit/contracts");
    const { firebaseAuthProvider, firebaseSessionProvider } =
      await import("@mohasinac/appkit/providers/auth-firebase");
    const { createResendProvider } =
      await import("@mohasinac/appkit/providers/email-resend");
    const { firebaseStorageProvider } =
      await import("@mohasinac/appkit/providers/storage-firebase");
    const { firebaseDbProvider } =
      await import("@mohasinac/appkit/providers/db-firebase");
    const { tailwindAdapter } =
      await import("@mohasinac/appkit/style/tailwind");

    registerProviders({
      db: firebaseDbProvider,
      auth: firebaseAuthProvider,
      session: firebaseSessionProvider,
      email: createResendProvider({
        // API key is resolved from RESEND_API_KEY env var by default.
        // For DB-stored key rotation, pass a key factory here.
      }),
      storage: firebaseStorageProvider,
      style: tailwindAdapter,
      // Uncomment when @mohasinac/payment-razorpay is available (Phase 10):
      // payment: createRazorpayProvider({ keyId: process.env.RAZORPAY_KEY_ID! }),
      // Uncomment when @mohasinac/shipping-shiprocket is available (Phase 10):
      // shipping: createShiprocketProvider({ ...config }),
    });
  })();
  return initPromise;
}

/**
 * Wrap any Next.js route handler to guarantee providers are initialized
 * before the handler runs. Use this for all feat-* route re-exports, which
 * cannot await initProviders() themselves because they are compiled in the
 * @mohasinac/* packages and run synchronously on import.
 *
 * Usage:
 *   import { withProviders } from "@/providers.config";
 *   import { GET as _GET } from "@mohasinac/appkit/features/events";
 *   export const GET = withProviders(_GET);
 */
export function withProviders<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => Promise<R extends Promise<infer U> ? U : R> {
  return async (...args: A) => {
    await initProviders();
    return fn(...args) as R extends Promise<infer U> ? U : R;
  };
}
