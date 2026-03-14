"use client";

/**
 * ConsentOtpModal
 *
 * Shown when the buyer selects a shipping address that belongs to a third party.
 * A 6-digit code is sent to the account-holder's email and must be entered to
 * confirm consent before checkout proceeds.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SideDrawer, Button, Text, Heading, Label, Input } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useAddressConsentOtp } from "../hooks/useAddressConsentOtp";

const { spacing, flex } = THEME_CONSTANTS;

interface ConsentOtpModalProps {
  isOpen: boolean;
  addressId: string;
  recipientName: string;
  /** Called when the OTP has been successfully verified. */
  onVerified: () => void;
  onClose: () => void;
}

export function ConsentOtpModal({
  isOpen,
  addressId,
  recipientName,
  onVerified,
  onClose,
}: ConsentOtpModalProps) {
  const t = useTranslations("checkout");
  const [code, setCode] = useState("");

  const { consentState, error, maskedEmail, sendCode, verifyCode, reset } =
    useAddressConsentOtp();

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCode("");
    }
  }, [isOpen, reset]);

  // Fire callback once verified
  useEffect(() => {
    if (consentState === "verified") {
      onVerified();
    }
  }, [consentState, onVerified]);

  const handleSend = () => sendCode(addressId);

  const handleVerify = () => {
    if (code.length === 6) verifyCode(addressId, code);
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const isSending = consentState === "sending";
  const isVerifying = consentState === "verifying";
  const codeSent =
    consentState === "code_sent" || (consentState === "error" && !!maskedEmail);

  // Resolve user-friendly error text
  const friendlyError = (() => {
    if (!error) return null;
    const keys: Record<string, string> = {
      consentOtpRateLimit: t("consentOtpRateLimit"),
      consentOtpErrorSendFailed: t("consentOtpErrorSendFailed"),
      consentOtpErrorInvalid: t("consentOtpErrorInvalid"),
      consentOtpErrorExpired: t("consentOtpErrorExpired"),
      consentOtpErrorMaxAttempts: t("consentOtpErrorMaxAttempts"),
    };
    return keys[error] ?? error;
  })();

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("consentOtpModalTitle")}
      mode="edit"
    >
      <div className={spacing.stack}>
        {!codeSent ? (
          /* ── Step 1: explain & send ─────────────────────────────── */
          <div className={spacing.stack}>
            <Text variant="secondary">
              {t("consentOtpModalDesc", {
                email: maskedEmail ?? "your email",
                recipientName,
              })}
            </Text>
            {friendlyError && (
              <Text size="sm" className="text-red-600 dark:text-red-400">
                {friendlyError}
              </Text>
            )}
            <div className={`${flex.start} gap-2`}>
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                {t("consentOtpCancelBtn")}
              </Button>
              <Button
                variant="primary"
                isLoading={isSending}
                onClick={handleSend}
              >
                {t("consentOtpSendBtn")}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Step 2: enter code ─────────────────────────────────── */
          <div className={spacing.stack}>
            <Text variant="secondary">
              {t("consentOtpSentDesc", { email: maskedEmail ?? "" })}
            </Text>

            <div>
              <Label className="block text-sm font-medium mb-1.5">
                {t("consentOtpInputLabel")}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={handleCodeInput}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:bg-neutral-800 dark:border-neutral-600"
                autoFocus
              />
            </div>

            {friendlyError && (
              <Text size="sm" className="text-red-600 dark:text-red-400">
                {friendlyError}
              </Text>
            )}

            <div className={`${flex.between} gap-2`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSend}
                disabled={isSending || isVerifying}
              >
                {isSending ? t("consentOtpSending") : t("consentOtpResendBtn")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isVerifying}
                >
                  {t("consentOtpCancelBtn")}
                </Button>
                <Button
                  variant="primary"
                  disabled={code.length !== 6 || isVerifying}
                  isLoading={isVerifying}
                  onClick={handleVerify}
                >
                  {t("consentOtpVerifyBtn")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}
