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
    const { registerProviders } = await import("@mohasinac/contracts");
    const { firebaseAuthProvider, firebaseSessionProvider } =
      await import("@mohasinac/auth-firebase");
    const { createResendProvider } = await import("@mohasinac/email-resend");
    const { firebaseStorageProvider } =
      await import("@mohasinac/storage-firebase");
    const { firebaseDbProvider } = await import("@mohasinac/db-firebase");
    const { tailwindAdapter } = await import("@mohasinac/css-tailwind");

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
