/**
 * Consent OTP — Shared constants, path helpers, and utilities
 *
 * Single source of truth for all consent OTP logic shared across:
 *  - src/app/api/checkout/consent-otp/send/route.ts
 *  - src/app/api/checkout/consent-otp/verify/route.ts
 *  - src/actions/checkout.actions.ts
 *  - src/app/api/checkout/route.ts
 */

import { createHmac, randomInt } from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { escapeHtml } from "@/utils";
import { USER_COLLECTION } from "@/db/schema";

// ─── Private ──────────────────────────────────────────────────────────────────

const HMAC_KEY =
  process.env.CONSENT_OTP_HMAC_KEY ||
  process.env.HMAC_SECRET ||
  "consent-otp-secret";

// ─── Timing ───────────────────────────────────────────────────────────────────

/** OTP validity window (10 minutes). */
export const CONSENT_OTP_EXPIRY_MS = 10 * 60 * 1000;

/** Used in email body text so it stays in sync with CONSENT_OTP_EXPIRY_MS. */
export const CONSENT_OTP_EXPIRY_MINUTES = 10;

/** Per-user send cooldown (15 minutes). */
export const CONSENT_OTP_COOLDOWN_MS = 15 * 60 * 1000;

/** Maximum number of partial-order bypass credits a user can accumulate. */
export const CONSENT_OTP_MAX_BYPASS_CREDITS = 3;

/** Maximum failed verification attempts before the OTP is locked. */
export const CONSENT_OTP_MAX_ATTEMPTS = 5;

/** Rate-limit config for the verify endpoint / action (10 attempts per 5 min). */
export const CONSENT_OTP_VERIFY_RATE_LIMIT = {
  limit: 10,
  window: 300,
} as const;

// ─── Firestore Path Helpers ───────────────────────────────────────────────────

type Db = ReturnType<typeof getAdminDb>;

/** Reference to a user's consent OTP document for a given address. */
export function consentOtpRef(db: Db, uid: string, addressId: string) {
  return db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection("consentOtps")
    .doc(addressId);
}

/** Reference to a user's consent OTP rate-limit metadata document. */
export function consentOtpRateLimitRef(db: Db, uid: string) {
  return db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection("consentOtpRateLimit")
    .doc("meta");
}

// ─── Crypto ───────────────────────────────────────────────────────────────────

/** HMAC-SHA256 hash of an OTP code. Used for constant-time storage and comparison. */
export function hashOtp(code: string): string {
  return createHmac("sha256", HMAC_KEY).update(code).digest("hex");
}

/** Generate a cryptographically-secure random 6-digit OTP string. */
export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

/** Obfuscate an email address for display (e.g. j***e@example.com). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked =
    local.length <= 2
      ? "*".repeat(local.length)
      : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${masked}@${domain}`;
}

// ─── Email Builder ────────────────────────────────────────────────────────────

/** Build the consent OTP email subject and HTML body. */
export function buildConsentOtpEmail(
  recipientName: string,
  code: string,
  siteName: string,
): { subject: string; html: string } {
  return {
    subject: `${siteName}: Consent verification code — shipping to ${recipientName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Third-Party Shipping Consent</h2>
        <p style="color:#555">You are about to place an order that will be shipped to <strong>${escapeHtml(recipientName)}</strong>.</p>
        <p style="color:#555">Enter this code to confirm your consent:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;margin:24px 0;padding:16px;background:#f3f4f6;border-radius:8px">${code}</div>
        <p style="color:#888;font-size:12px">This code expires in ${CONSENT_OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
}
