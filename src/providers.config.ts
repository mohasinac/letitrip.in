/**
 * providers.config.ts — Dependency Injection wiring for letitrip.in
 *
 * This is the SINGLE file that knows which concrete providers are used.
 * To swap a provider, change one line here — nothing else in the codebase changes.
 *
 * Import this file at the entry point of the application (e.g. in
 * `src/app/layout.tsx` before the tree renders, or in the middleware).
 *
 * @example
 * ```ts
 * // app/layout.tsx (server component)
 * import "@/providers.config";
 * ```
 */

import { registerProviders } from "@mohasinac/contracts";
import {
  firebaseAuthProvider,
  firebaseSessionProvider,
} from "@mohasinac/auth-firebase";
import { createResendProvider } from "@mohasinac/email-resend";
import { firebaseStorageProvider } from "@mohasinac/storage-firebase";
import { firebaseDbProvider } from "@mohasinac/db-firebase";
import { tailwindAdapter } from "@mohasinac/css-tailwind";

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
