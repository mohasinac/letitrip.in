"use client";

/**
 * useAddressConsentOtp
 *
 * State machine for the email OTP consent flow that is required when the buyer
 * ships to a third-party address (someone else).
 *
 * Flow:
 *   1. sendCode(addressId)   → POST /api/checkout/consent-otp/send
 *                               state: idle → sending → code_sent | error
 *   2. verifyCode(code)      → POST /api/checkout/consent-otp/verify
 *                               state: code_sent → verifying → verified | error
 *
 * State machine:
 *   idle → sending → code_sent → verifying → verified | error
 */

import { useState, useCallback } from "react";
import { sendConsentOtpAction, verifyConsentOtpAction } from "@/actions";
import { logger } from "@mohasinac/appkit/core";

export type ConsentOtpState =
  | "idle"
  | "sending"
  | "code_sent"
  | "verifying"
  | "verified"
  | "error";

export interface UseAddressConsentOtpReturn {
  consentState: ConsentOtpState;
  error: string | null;
  maskedEmail: string | null;
  sendCode: (addressId: string) => Promise<void>;
  verifyCode: (addressId: string, code: string) => Promise<void>;
  reset: () => void;
}

export function useAddressConsentOtp(): UseAddressConsentOtpReturn {
  const [consentState, setConsentState] = useState<ConsentOtpState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const sendCode = useCallback(async (addressId: string) => {
    setConsentState("sending");
    setError(null);

    try {
      const result = await sendConsentOtpAction(addressId);
      setMaskedEmail(result.maskedEmail);
      setConsentState("code_sent");
    } catch (err: unknown) {
      logger.warn("Consent OTP send failed", { err });
      const msg =
        err instanceof Error ? err.message : "consentOtpErrorSendFailed";
      setError(msg);
      setConsentState("error");
    }
  }, []);

  const verifyCode = useCallback(async (addressId: string, code: string) => {
    setConsentState("verifying");
    setError(null);

    try {
      await verifyConsentOtpAction(addressId, code);
      setConsentState("verified");
    } catch (err: unknown) {
      logger.warn("Consent OTP verify failed", { err });
      const rawMsg = err instanceof Error ? err.message : "";
      const msg = rawMsg.toLowerCase().includes("expired")
        ? "consentOtpErrorExpired"
        : rawMsg.toLowerCase().includes("attempts")
          ? "consentOtpErrorMaxAttempts"
          : "consentOtpErrorInvalid";
      setError(msg);
      setConsentState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setConsentState("idle");
    setError(null);
    setMaskedEmail(null);
  }, []);

  return { consentState, error, maskedEmail, sendCode, verifyCode, reset };
}

