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

// ─── Email credential helpers ─────────────────────────────────────────────────

/**
 * Fetch the Resend API key from site settings, falling back to the env var.
 * Extracted to avoid deeply nested try/catch inside registerProviders.
 */
async function getResendApiKey(
  getSiteSettingsCredentials: () => Promise<{ resendApiKey?: string }>,
): Promise<string> {
  try {
    const creds = await getSiteSettingsCredentials();
    return creds.resendApiKey || process.env.RESEND_API_KEY || "";
  } catch {
    return process.env.RESEND_API_KEY || "";
  }
}

/**
 * Fetch the email "from" display name from site settings, falling back to env var.
 */
async function getEmailFromName(
  getSingleton: () => Promise<{ emailSettings?: { fromName?: string } } | null>,
): Promise<string> {
  try {
    const settings = await getSingleton();
    return settings?.emailSettings?.fromName || process.env.EMAIL_FROM_NAME || "App";
  } catch {
    return process.env.EMAIL_FROM_NAME || "App";
  }
}

/**
 * Fetch the email "from" address from site settings, falling back to env var.
 */
async function getEmailFromAddress(
  getSingleton: () => Promise<{ emailSettings?: { fromEmail?: string } } | null>,
): Promise<string> {
  try {
    const settings = await getSingleton();
    return settings?.emailSettings?.fromEmail || process.env.EMAIL_FROM || "";
  } catch {
    return process.env.EMAIL_FROM || "";
  }
}

/**
 * Idempotent — safe to call multiple times; runs exactly once per process.
 */
export function initProviders(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // -- Market defaults (must run before any formatter/provider reads baseline)
    const [
      { configureMarketDefaults },
      { firebaseAuthProvider, firebaseSessionProvider },
      { createResendProvider },
      { firebaseStorageProvider },
      { firebaseDbProvider },
      { tailwindAdapter },
      { registerProviders },
    ] = await Promise.all([
      import("@mohasinac/appkit/core/baseline-resolver"),
      import("@mohasinac/appkit/providers/auth-firebase"),
      import("@mohasinac/appkit/providers/email-resend"),
      import("@mohasinac/appkit/providers/storage-firebase"),
      import("@mohasinac/appkit/providers/db-firebase"),
      import("@mohasinac/appkit/style/tailwind"),
      import("@mohasinac/appkit/contracts/registry"),
    ]);
    configureMarketDefaults({
      currency: "INR",
      locale: "en-IN",
      country: "IN",
      phonePrefix: "+91",
      timezone: "Asia/Kolkata",
      currencySymbol: "₹",
    });
    const { siteSettingsRepository } = await import("@mohasinac/appkit/repositories/site-settings");

    // Track H — provider resolution. Read the mock flags once at boot. The
    // resolver throws on production+mock to make the misconfiguration loud.
    const bootSettings = await siteSettingsRepository.getSingleton().catch(() => null);
    const useMockPayment = bootSettings?.featureFlags?.useMockPayment === true;
    const useMockShipping = bootSettings?.featureFlags?.useMockShipping === true;
    if (useMockPayment && process.env.NODE_ENV === "production") {
      throw new Error(
        "[providers] siteSettings.featureFlags.useMockPayment is TRUE in production. " +
          "The mock payment provider must never run in production.",
      );
    }
    if (useMockShipping && process.env.NODE_ENV === "production") {
      throw new Error(
        "[providers] siteSettings.featureFlags.useMockShipping is TRUE in production. " +
          "The mock shipping provider must never run in production.",
      );
    }

    const paymentProvider = useMockPayment
      ? await import("@mohasinac/appkit/server").then(
          (m) => new m.MockRazorpayProvider(),
        )
      : undefined; // real Razorpay path resolves credentials per-call (legacy createRazorpayOrder)
    const shippingProvider = useMockShipping
      ? await import("@mohasinac/appkit/server").then(
          (m) => new m.MockShiprocketProvider(),
        )
      : undefined;

    registerProviders({
      db: firebaseDbProvider,
      auth: firebaseAuthProvider,
      session: firebaseSessionProvider,
       
      email: (createResendProvider as any)({
        apiKey: () => getResendApiKey(() => siteSettingsRepository.getDecryptedCredentials()),
        fromName: () => getEmailFromName(() => siteSettingsRepository.getSingleton()),
        fromEmail: () => getEmailFromAddress(() => siteSettingsRepository.getSingleton()),
      }),
      storage: firebaseStorageProvider,
      style: tailwindAdapter,
      rbac: {
        getPermissions: async (uid: string) => {
          const { getServerPermissions } = await import("@mohasinac/appkit/server");
          const resolved = await getServerPermissions(uid);
          return resolved.permissions;
        },
        isAdmin: async (uid: string) => {
          const { getServerPermissions } = await import("@mohasinac/appkit/server");
          const resolved = await getServerPermissions(uid);
          return resolved.isAdmin;
        },
      },
      // Track H — mock providers are registered when the corresponding
      // featureFlag is on (and NODE_ENV !== "production"). When the flag is
      // off, the slot stays empty and the existing real-provider path (via
      // appkit's resolveKeys + createRazorpayOrder / shiprocketAuthenticate)
      // remains in effect — full provider-registry migration is deferred.
      ...(paymentProvider ? { payment: paymentProvider } : {}),
      ...(shippingProvider ? { shipping: shippingProvider } : {}),
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
 *   import { GET as _GET } from "@mohasinac/appkit";
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

