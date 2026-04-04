"use client";

/**
 * usePaymentOtp
 *
 * Manages the phone OTP lifecycle for pre-payment purchase verification.
 *
 * All Firebase calls are routed through @/lib/firebase/auth-helpers — this hook
 * contains NO direct firebase/auth or @/lib/firebase/config imports.
 *
 * Flow:
 *   1. requestOtp() → server gate (POST /api/payment/otp/request checks daily limit)
 *                   → sendPhoneOtp() sends SMS via auth-helpers
 *   2. confirmOtp() → reauthenticateWithPhone() re-authenticates current user
 *
 * State machine: idle → sending → code_sent → verifying → verified | error
 */

import { useState, useRef, useCallback } from "react";
import {
  sendPhoneOtp,
  reauthenticateWithPhone,
} from "@/lib/firebase/auth-helpers";
import { logger } from "@/classes";
import { apiClient, ApiClientError } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";

export type OtpState =
  | "idle"
  | "sending"
  | "code_sent"
  | "verifying"
  | "verified"
  | "error";

export interface UsePaymentOtpReturn {
  otpState: OtpState;
  error: string | null;
  /** Send OTP to the given phone number. Pass the id of a div to host the invisible reCAPTCHA. */
  requestOtp: (recaptchaContainerId: string) => Promise<void>;
  /** Confirm the 6-digit code entered by the user. */
  confirmOtp: (code: string) => Promise<void>;
  /** Reset back to idle (e.g. when modal is closed). */
  reset: () => void;
}

export function usePaymentOtp(phoneNumber: string | null): UsePaymentOtpReturn {
  const [otpState, setOtpState] = useState<OtpState>("idle");
  const [error, setError] = useState<string | null>(null);
  const verificationIdRef = useRef<string | null>(null);

  const requestOtp = useCallback(
    async (recaptchaContainerId: string) => {
      if (!phoneNumber) {
        setError("no_phone");
        setOtpState("error");
        return;
      }

      setOtpState("sending");
      setError(null);

      // 1. Server-side gate: checks per-user 15-min cooldown AND the daily SMS quota.
      try {
        await apiClient.post(API_ENDPOINTS.PAYMENT.OTP_REQUEST, {});
      } catch (err: unknown) {
        logger.warn("Payment OTP grant denied", { err });
        if (err instanceof ApiClientError && err.status === 429) {
          // The server returns the specific message — surface it directly so the
          // UI can show "wait X minutes" vs "daily limit reached".
          const serverMsg = err instanceof Error ? err.message : undefined;
          if (serverMsg && !serverMsg.toLowerCase().includes("daily")) {
            setError(serverMsg); // e.g. "Please wait 12 minutes before requesting another OTP."
          } else {
            setError("daily_limit");
          }
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to request OTP. Please try again.",
          );
        }
        setOtpState("error");
        return;
      }

      // 2. Server approved — send SMS via auth-helpers (reCAPTCHA managed internally).
      try {
        const verificationId = await sendPhoneOtp(
          phoneNumber,
          recaptchaContainerId,
        );
        verificationIdRef.current = verificationId;
        setOtpState("code_sent");
      } catch (err: unknown) {
        logger.error("Payment OTP send failed", { err });
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to send OTP. Please try again.";
        setError(msg);
        setOtpState("error");
      }
    },
    [phoneNumber],
  );

  const confirmOtp = useCallback(async (code: string) => {
    const verificationId = verificationIdRef.current;
    if (!verificationId) {
      setError("OTP session expired. Please request a new OTP.");
      setOtpState("error");
      return;
    }

    setOtpState("verifying");
    setError(null);

    try {
      await reauthenticateWithPhone(verificationId, code);
      setOtpState("verified");
    } catch (err: unknown) {
      logger.error("Payment OTP confirm failed", { err });
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
      setOtpState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setOtpState("idle");
    setError(null);
    verificationIdRef.current = null;
  }, []);

  return { otpState, error, requestOtp, confirmOtp, reset };
}
