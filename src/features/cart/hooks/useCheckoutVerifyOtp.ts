"use client";

/**
 * useCheckoutVerifyOtp
 *
 * Unified OTP state machine for checkout verification.
 *
 * Replaces the previous split between usePaymentOtp (Firebase Phone Auth,
 * fired at "Place Order") and useAddressConsentOtp (email HMAC, fired at
 * address selection).  Now a SINGLE OTP is fired at "Place Order" time and
 * covers BOTH identity verification AND third-party shipping consent.
 *
 * Mode selection:
 *  - 'sms'   — Default when the shipping address phone matches the buyer's
 *              Firebase-registered phone.  Uses Firebase Phone Auth +
 *              reauthenticateWithPhone.  After success, calls
 *              grantCheckoutConsentViaSmsAction to write the Firestore
 *              consent doc so the backend can verify it uniformly.
 *  - 'email' — Used for third-party addresses (phones don't match) OR when
 *              the buyer manually switches.  Uses HMAC email OTP via the
 *              existing consent-otp API routes.
 *
 * The buyer can toggle between modes before sending the OTP.
 *
 * State machine:
 *   idle → sending → code_sent → verifying → granting → verified | error
 *
 * On reaching 'verified', the Firestore consent doc for the given addressId
 * exists with verified=true.  The checkout / payment-verify backend routes
 * check this doc uniformly for ALL orders.
 */

import { useState, useRef, useCallback } from "react";
import {
  sendPhoneOtp,
  reauthenticateWithPhone,
} from "@/lib/firebase/auth-helpers";
import { logger } from "@mohasinac/appkit/core";
import {
  grantCheckoutConsentViaSmsAction,
  sendConsentOtpAction,
  verifyConsentOtpAction,
} from "@/actions";
import { apiClient, ApiClientError } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckoutVerifyMode = "sms" | "email";

export type CheckoutVerifyState =
  | "idle"
  | "sending"
  | "code_sent"
  | "verifying"
  | "granting" // SMS path only: calling grantCheckoutConsentViaSmsAction
  | "verified"
  | "error";

export interface UseCheckoutVerifyOtpOptions {
  addressId: string;
  /** Phone number stored on the shipping address. */
  addressPhone: string;
  /** Buyer's Firebase-registered phone number — null if not set. */
  buyerPhone: string | null;
}

export interface UseCheckoutVerifyOtpReturn {
  state: CheckoutVerifyState;
  mode: CheckoutVerifyMode;
  /** True when the SMS path is available (address phone == buyer's phone). */
  canUseSms: boolean;
  error: string | null;
  /** Masked delivery target — phone digits or email address. */
  maskedTarget: string | null;
  /** Switch mode before sending.  No-op once a code has been sent. */
  switchMode: (m: CheckoutVerifyMode) => void;
  /** Send OTP.  For SMS pass the reCAPTCHA container element id. */
  sendOtp: (recaptchaContainerId?: string) => Promise<void>;
  /** Confirm the 6-digit code entered by the user. */
  confirmOtp: (code: string) => Promise<void>;
  reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(s: string): string {
  return s.replace(/[^0-9]/g, "").slice(-10);
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckoutVerifyOtp({
  addressId,
  addressPhone,
  buyerPhone,
}: UseCheckoutVerifyOtpOptions): UseCheckoutVerifyOtpReturn {
  const canUseSms =
    !!buyerPhone && normalizePhone(addressPhone) === normalizePhone(buyerPhone);

  const [state, setState] = useState<CheckoutVerifyState>("idle");
  const [mode, setMode] = useState<CheckoutVerifyMode>(
    canUseSms ? "sms" : "email",
  );
  const [error, setError] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string | null>(
    canUseSms && buyerPhone ? maskPhone(buyerPhone) : null,
  );

  // SMS path: Firebase Phone Auth verification ID
  const verificationIdRef = useRef<string | null>(null);

  // ── Switch mode ────────────────────────────────────────────────────────────

  const switchMode = useCallback(
    (m: CheckoutVerifyMode) => {
      if (state !== "idle" && state !== "error") return; // already in-flight
      setMode(m);
      setError(null);
      setMaskedTarget(m === "sms" && buyerPhone ? maskPhone(buyerPhone) : null);
      verificationIdRef.current = null;
    },
    [state, buyerPhone],
  );

  // ── Send OTP ───────────────────────────────────────────────────────────────

  const sendOtp = useCallback(
    async (recaptchaContainerId?: string) => {
      setState("sending");
      setError(null);

      if (mode === "sms") {
        if (!buyerPhone) {
          setError("no_phone");
          setState("error");
          return;
        }
        // 1. Server gate: per-user cooldown + daily SMS quota
        try {
          await apiClient.post(API_ENDPOINTS.PAYMENT.OTP_REQUEST, {});
        } catch (err: unknown) {
          logger.warn("OTP grant denied", { err });
          if (err instanceof ApiClientError && err.status === 429) {
            const msg = err instanceof Error ? err.message : undefined;
            setError(
              msg && !msg.toLowerCase().includes("daily") ? msg : "daily_limit",
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to request OTP. Please try again.",
            );
          }
          setState("error");
          return;
        }
        // 2. Send SMS via Firebase Phone Auth
        try {
          const verificationId = await sendPhoneOtp(
            buyerPhone,
            recaptchaContainerId ?? "recaptcha-container",
          );
          verificationIdRef.current = verificationId;
          setMaskedTarget(maskPhone(buyerPhone));
          setState("code_sent");
        } catch (err: unknown) {
          logger.error("SMS OTP send failed", { err });
          setError(
            err instanceof Error
              ? err.message
              : "Failed to send OTP. Please try again.",
          );
          setState("error");
        }
      } else {
        // Email path — existing consent-otp action
        try {
          const result = await sendConsentOtpAction(addressId);
          setMaskedTarget(result.maskedEmail);
          setState("code_sent");
        } catch (err: unknown) {
          logger.warn("Email OTP send failed", { err });
          const msg =
            err instanceof ApiClientError && err.status === 429
              ? "consentOtpRateLimit"
              : err instanceof Error
                ? err.message
                : "consentOtpErrorSendFailed";
          setError(msg);
          setState("error");
        }
      }
    },
    [mode, buyerPhone, addressId],
  );

  // ── Confirm OTP ────────────────────────────────────────────────────────────

  const confirmOtp = useCallback(
    async (code: string) => {
      setState("verifying");
      setError(null);

      if (mode === "sms") {
        const verificationId = verificationIdRef.current;
        if (!verificationId) {
          setError("OTP session expired. Please request a new OTP.");
          setState("error");
          return;
        }
        // Re-authenticate with phone
        try {
          await reauthenticateWithPhone(verificationId, code);
        } catch (err: unknown) {
          logger.error("Phone OTP confirm failed", { err });
          const errorCode = (err as { code?: string })?.code;
          const msg =
            errorCode === "auth/invalid-verification-code"
              ? "invalid_code"
              : errorCode === "auth/code-expired"
                ? "expired_code"
                : errorCode === "auth/user-mismatch"
                  ? "phone_mismatch"
                  : err instanceof Error
                    ? err.message
                    : "OTP verification failed. Please try again.";
          setError(msg);
          setState("error");
          return;
        }
        // Grant consent server-side so backend can verify uniformly
        setState("granting");
        try {
          await grantCheckoutConsentViaSmsAction(addressId);
          setState("verified");
        } catch (err: unknown) {
          logger.error("Consent grant via SMS failed", { err });
          setError(
            err instanceof Error
              ? err.message
              : "Failed to record consent. Please try again.",
          );
          setState("error");
        }
      } else {
        // Email path — verify via consent-otp action
        try {
          await verifyConsentOtpAction(addressId, code);
          setState("verified");
        } catch (err: unknown) {
          logger.warn("Email OTP verify failed", { err });
          const rawMsg = err instanceof Error ? err.message : "";
          const msg = rawMsg.toLowerCase().includes("expired")
            ? "consentOtpErrorExpired"
            : rawMsg.toLowerCase().includes("attempts")
              ? "consentOtpErrorMaxAttempts"
              : "consentOtpErrorInvalid";
          setError(msg);
          setState("error");
        }
      }
    },
    [mode, addressId],
  );

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setState("idle");
    setMode(canUseSms ? "sms" : "email");
    setError(null);
    setMaskedTarget(canUseSms && buyerPhone ? maskPhone(buyerPhone) : null);
    verificationIdRef.current = null;
  }, [canUseSms, buyerPhone]);

  return {
    state,
    mode,
    canUseSms,
    error,
    maskedTarget,
    switchMode,
    sendOtp,
    confirmOtp,
    reset,
  };
}
