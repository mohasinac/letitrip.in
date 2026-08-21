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

import { normalizeError } from "@mohasinac/appkit";
import type { IPaymentProvider } from "@mohasinac/appkit";

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
    const seededKey = creds.resendApiKey?.trim() ?? "";
    // A placeholder seed value (e.g. "re_PLACEHOLDER") is truthy but not a real
    // key — it must never win over a real RESEND_API_KEY env var.
    if (seededKey && !seededKey.includes("PLACEHOLDER")) return seededKey;
    return process.env.RESEND_API_KEY || "";
  } catch (_err) {
    void normalizeError(_err);
    return process.env.RESEND_API_KEY || ""; // site settings unavailable — fall back to env var
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
  } catch (_err) {
    void normalizeError(_err);
    return process.env.EMAIL_FROM_NAME || "App"; // site settings unavailable — fall back to env var
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
  } catch (_err) {
    void normalizeError(_err);
    return process.env.EMAIL_FROM || ""; // site settings unavailable — fall back to env var
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

    // Provider resolution — read payment-method toggles once at boot.
    // Shipping has no toggle: manual shipping is the only provider, always
    // registered.
    const bootSettings = await siteSettingsRepository.getSingleton().catch(() => null);
    const razorpayEnabled = bootSettings?.payment?.razorpayEnabled === true;
    const { ManualPaymentProvider, ManualShippingProvider } = await import("@mohasinac/appkit/server");

    let paymentProvider: IPaymentProvider;
    if (razorpayEnabled) {
      const { RazorpayProvider, resolveKeys } = await import("@mohasinac/appkit/server");
      const keys = await resolveKeys();
      paymentProvider = new RazorpayProvider({
        keyId: keys.razorpayKeyId,
        keySecret: keys.razorpayKeySecret,
        webhookSecret: keys.razorpayWebhookSecret,
      });
    } else {
      paymentProvider = new ManualPaymentProvider();
    }
    const shippingProvider = new ManualShippingProvider();

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
      // payment/shipping are always populated — manual by default, Razorpay
      // when siteSettings.payment.razorpayEnabled is true.
      payment: paymentProvider,
      shipping: shippingProvider,
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
// Overload 1: Next.js route handler pattern — explicit so TS preserves optional ctx.
// Context typed as `any` to remain compatible with Next.js production async params
// (Promise<TParams>) and test-time plain-object params ({ id: "…" }) simultaneously.
export function withProviders(fn: (request: Request, context?: any) => Promise<Response>): (request: Request, context?: any) => Promise<Response>;
// Overload 2: Generic fallback for any other async function
export function withProviders<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => Promise<R extends Promise<infer U> ? U : R>;
// Implementation
export function withProviders<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => Promise<R extends Promise<infer U> ? U : R> {
  return async (...args: A) => {
    await initProviders();
    return fn(...args) as R extends Promise<infer U> ? U : R;
  };
}

