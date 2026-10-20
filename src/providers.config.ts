/**
 * providers.config.ts — Dependency Injection wiring for letitrip.in
 *
 * `initProviders()` must be called and awaited before any route handler
 * runs. It is called in `instrumentation.ts → register()` which Next.js
 * awaits before serving the first request.
 *
 * `@mohasinac/sievejs` is listed in `serverExternalPackages`, so webpack loads
 * it as async ESM. (This comment used to claim ALL `@mohasinac/*` packages were
 * — `@mohasinac/appkit` is NOT, which is why its `dist` is inlined into the SSR
 * chunk rather than loaded from `node_modules`. That distinction is exactly what
 * made a relative `module.require` inside appkit resolve against the chunk path
 * and fail in production; see CLAUDE.md Root Cause #86.)
 * A plain `import` side-effect cannot be
 * reliably awaited across webpack's async-module boundary. Exporting an
 * explicit async function and awaiting its return value bypasses this
 * limitation: the caller awaits the real Promise, not just the module load.
 */

import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { BUSINESS, formatBusinessAddress } from "@/constants";
import type { IPaymentProvider } from "@mohasinac/appkit/contracts/payment";
import type { IShippingProvider } from "@mohasinac/appkit/contracts/shipping";

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

    /*
     * The platform's statutory identity, from the ONE place that owns it.
     *
     * 🛑 `resolveSupplierIdentity` used to read `siteSettings.gst.*` for this,
     * which made the invoice path a sixth owner of the legal name, address and
     * GSTIN — and the one that decides what a tax invoice says about who
     * issued it. `appkit.config.js → business` is the owner; appkit has no
     * runtime reader for a consumer config file, so it is injected here, the
     * same way configureMarketDefaults injects currency and locale.
     *
     * `siteSettings.gst.enabled` still decides WHETHER to charge GST. This is
     * only WHO the supplier is.
     */
    const { configurePlatformSupplier } = await import("@mohasinac/appkit/server");
    configurePlatformSupplier({
      gstin: BUSINESS.gstin ?? undefined,
      legalName: BUSINESS.legalName ?? undefined,
      address: formatBusinessAddress() ?? undefined,
    });

    // Provider resolution — read the payment and SHIPPING toggles once at boot.
    // Degrades to manual-only payments, which is the safe direction — but a
    // silent degrade here disables the online gateway for the whole process
    // with no signal, so name it.
    const bootSettings = await siteSettingsRepository
      .getSingleton()
      .catch((err: unknown) => {
        console.warn(
          "[providers] siteSettings read failed at boot; the online gateway stays disabled for this process",
          err,
        );
        return null;
      });
    const { ManualPaymentProvider, ManualShippingProvider } = await import("@mohasinac/appkit/server");

    /*
     * ── Exactly ONE online gateway per process ──────────────────────────────
     *
     * `registerProviders({ payment })` takes a single provider, so this is a
     * choice, not a merge. Razorpay is checked first; if both flags are on,
     * Razorpay wins and PhonePe is ignored. That ordering is a tie-break, not
     * a feature — the admin toggle for PhonePe says as much, because an admin
     * who leaves both on and expects PhonePe would otherwise have no way to
     * tell why their buyers see Razorpay.
     *
     * 🛑 Both branches read credentials through `resolveKeys()`, which treats
     * a seeded `*_PLACEHOLDER` as ABSENT. That matters here: Razorpay's
     * constructor throws on empty credentials, so a flag switched on with no
     * real key fails LOUDLY at boot rather than at the moment a buyer tries
     * to pay. Compare the Shiprocket branch below — same reasoning, and the
     * asymmetry with the fall-through to manual is the same too: manual
     * payment is a complete, working flow, so degrading to it collects money
     * correctly; a half-configured gateway does not.
     */
    const razorpayEnabled = bootSettings?.payment?.razorpayEnabled === true;
    const phonepeEnabled = bootSettings?.payment?.phonepeEnabled === true;

    let paymentProvider: IPaymentProvider;
    if (razorpayEnabled) {
      const { RazorpayProvider, resolveKeys } = await import("@mohasinac/appkit/server");
      const keys = await resolveKeys();
      paymentProvider = new RazorpayProvider({
        keyId: keys.razorpayKeyId,
        keySecret: keys.razorpayKeySecret,
        webhookSecret: keys.razorpayWebhookSecret,
      });
      if (phonepeEnabled) {
        console.warn(
          "[providers] both razorpayEnabled and phonepeEnabled are true; registering Razorpay and ignoring PhonePe",
        );
      }
    } else if (phonepeEnabled) {
      const { PhonePeProvider, resolveKeys } = await import("@mohasinac/appkit/server");
      const keys = await resolveKeys();
      paymentProvider = new PhonePeProvider({
        clientId: keys.phonepeClientId,
        clientSecret: keys.phonepeClientSecret,
        clientVersion: keys.phonepeClientVersion,
        environment: keys.phonepeEnvironment === "production" ? "production" : "sandbox",
        webhookUsername: keys.phonepeWebhookUsername,
        webhookPassword: keys.phonepeWebhookPassword,
      });
    } else {
      paymentProvider = new ManualPaymentProvider();
    }
    /*
     * ── C5c: shipping is a resolved provider, not a hardcoded one ───────────
     *
     * There was no shipping branch here at all — payment had one and shipping
     * did not — so `ManualShippingProvider` was registered unconditionally and
     * `siteSettings.shipping.provider` had nowhere to be read.
     *
     * 🛑 A `shiprocket` selection with no credentials THROWS. It does not fall
     * back to manual, and that asymmetry with the payment branch above is
     * deliberate: a degraded payment provider still collects money correctly
     * (manual payment is a real, complete flow), whereas a degraded shipping
     * provider hands back a synthetic `manual_{orderId}` tracking id for a
     * parcel no carrier has been told about. The seller sees an AWB-shaped
     * string and a success toast; the buyer sees a tracking number that tracks
     * nothing. A hard failure at boot is loud, attributable and recoverable by
     * flipping one setting — the fallback is none of those.
     *
     * 🛑 The Shiprocket provider itself is NOT implemented. The credentials do
     * not exist in any runtime (measured 2026-10-11: zero `SHIPROCKET_*` keys),
     * so its carrier calls cannot be exercised against the live API, and §9.1's
     * billing question — does creating an order schedule a real pickup, does an
     * AWB consume an allocation, does a cancel still bill — cannot be answered
     * by running anything. Writing a ~600-line HTTP client that no test can
     * reach would be shipping a plausible implementation and calling it done.
     * So this branch exists, is wired, and refuses: the selection is reachable
     * the moment a provider and credentials land, and until then it says what
     * is missing instead of pretending.
     */
    const selectedShipping = bootSettings?.shipping?.provider ?? "manual";
    let shippingProvider: IShippingProvider;
    if (selectedShipping === "shiprocket") {
      /*
       * 🛑 Still REFUSES when unconfigured — the constructor throws on empty
       * credentials. The asymmetry with the payment branch above is unchanged
       * and deliberate: a degraded PAYMENT provider still collects money
       * correctly, whereas a degraded SHIPPING provider hands back a synthetic
       * tracking id for a parcel no carrier was told about. The seller sees an
       * AWB-shaped string and a success toast; the buyer gets a number that
       * tracks nothing.
       *
       * Auth is a dedicated Shiprocket API USER, not the dashboard login, so
       * the token survives a dashboard password change and can be revoked on
       * its own. The login payload field is `email` — hence
       * SHIPROCKET_LOGIN_USER_EMAIL rather than a "login id", which invites
       * someone to put a username in it and get a 400 they cannot explain.
       */
      const { ShiprocketShippingProvider } = await import("@mohasinac/appkit/server");
      shippingProvider = new ShiprocketShippingProvider({
        email: process.env.SHIPROCKET_LOGIN_USER_EMAIL ?? "",
        password: process.env.SHIPROCKET_API_PASSWORD ?? "",
        pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION,
      });
    } else {
      shippingProvider = new ManualShippingProvider();
    }

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
      // payment/shipping are always populated — manual by default, Razorpay or
      // PhonePe when the matching siteSettings.payment flag is true.
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

