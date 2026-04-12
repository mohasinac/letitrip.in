"use client";

/**
 * CheckoutVerifyModal
 *
 * Unified verification modal — replaces the previous split between
 * CheckoutOtpModal (Firebase Phone Auth, payment gate) and
 * ConsentOtpModal (email HMAC, third-party consent gate).
 *
 * ONE OTP is sent per checkout, serving dual purpose:
 *   • Identity / payment verification
 *   • Third-party shipping consent (when applicable)
 *
 * Mode auto-selection:
 *   • SMS  — default when the shipping address phone == buyer's registered phone
 *   • Email — default when phones differ (third-party address)
 *
 * The buyer can switch between modes before sending.
 */

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Label, Text, Button, Row } from "@mohasinac/appkit/ui";
import { SideDrawer, TextLink, Input } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useCheckoutVerifyOtp } from "../hooks/useCheckoutVerifyOtp";

const { spacing, flex } = THEME_CONSTANTS;

interface CheckoutVerifyModalProps {
  isOpen: boolean;
  /** ID of the shipping address being verified. */
  addressId: string;
  /** Phone on the selected shipping address. */
  addressPhone: string;
  /** Buyer's Firebase-registered phone — null if not set. */
  buyerPhone: string | null;
  /** Display name of the address recipient (for third-party messaging). */
  recipientName: string;
  /** Called once verification is complete and the consent doc has been written. */
  onVerified: () => void;
  onClose: () => void;
}

export function CheckoutVerifyModal({
  isOpen,
  addressId,
  addressPhone,
  buyerPhone,
  recipientName,
  onVerified,
  onClose,
}: CheckoutVerifyModalProps) {
  const t = useTranslations("checkout");
  const recaptchaId = useId().replace(/:/g, "recaptcha");
  const [code, setCode] = useState("");

  const {
    state,
    mode,
    canUseSms,
    error,
    maskedTarget,
    switchMode,
    sendOtp,
    confirmOtp,
    reset,
  } = useCheckoutVerifyOtp({ addressId, addressPhone, buyerPhone });

  // Reset when modal opens / closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCode("");
    }
  }, [isOpen, reset]);

  // Fire callback once fully verified
  useEffect(() => {
    if (state === "verified") {
      onVerified();
    }
  }, [state, onVerified]);

  const handleSend = () => sendOtp(recaptchaId);

  const handleVerify = () => {
    if (code.length === 6) confirmOtp(code);
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const isSending = state === "sending";
  const isVerifying = state === "verifying" || state === "granting";
  const codeSent =
    state === "code_sent" || (state === "error" && !!maskedTarget);
  const hasNoPhone = !buyerPhone;

  // Resolve user-friendly error text
  const friendlyError = (() => {
    if (!error) return null;
    const keys: Record<string, string> = {
      no_phone: t("otpNoPhone"),
      invalid_code: t("otpErrorInvalid"),
      expired_code: t("otpErrorExpired"),
      phone_mismatch: t("otpErrorMismatch"),
      daily_limit: t("otpErrorDailyLimit"),
      consentOtpRateLimit: t("consentOtpRateLimit"),
      consentOtpErrorSendFailed: t("consentOtpErrorSendFailed"),
      consentOtpErrorInvalid: t("consentOtpErrorInvalid"),
      consentOtpErrorExpired: t("consentOtpErrorExpired"),
      consentOtpErrorMaxAttempts: t("consentOtpErrorMaxAttempts"),
    };
    return keys[error] ?? error;
  })();

  // Whether the address belongs to someone else
  function normalizePhone(s: string) {
    return s.replace(/[^0-9]/g, "").slice(-10);
  }
  const isThirdParty =
    !!buyerPhone && normalizePhone(addressPhone) !== normalizePhone(buyerPhone);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("verifyModalTitle")}
      mode="edit"
    >
      {/* Invisible reCAPTCHA anchor (SMS path) */}
      <div id={recaptchaId} />

      <div className={spacing.stack}>
        {hasNoPhone && mode === "sms" ? (
          /* ── No phone registered — prompt profile settings ──────── */
          <div className="text-center space-y-3">
            <Text variant="secondary">{t("otpNoPhone")}</Text>
            <Text size="sm" variant="secondary">
              {t("otpAddPhone")}
            </Text>
            <TextLink href={ROUTES.USER.SETTINGS}>
              {t("otpGoToProfile")}
            </TextLink>
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchMode("email")}
            >
              {t("verifyUseEmailInstead")}
            </Button>
          </div>
        ) : !codeSent ? (
          /* ── Step 1: explain & send ─────────────────────────────── */
          <div className={spacing.stack}>
            {/* Context copy */}
            {isThirdParty ? (
              <Text variant="secondary">
                {t("verifyThirdPartyDesc", { recipientName })}
              </Text>
            ) : (
              <Text variant="secondary">{t("verifyOwnDesc")}</Text>
            )}

            {/* Delivery target */}
            {maskedTarget && (
              <Text size="sm" className="font-mono font-semibold">
                {mode === "sms"
                  ? t("verifyTargetPhone", { phone: maskedTarget })
                  : t("verifyTargetEmail", { email: maskedTarget })}
              </Text>
            )}

            {friendlyError && (
              <Text size="sm" className="text-red-600 dark:text-red-400">
                {friendlyError}
              </Text>
            )}

            {/* Mode toggle links */}
            <Row wrap gap="sm" className="gap-x-4 gap-y-1">
              {mode === "sms" && (
                <Button
                  variant="ghost"
                  onClick={() => switchMode("email")}
                  className="text-xs text-primary hover:underline p-0 h-auto"
                >
                  {t("verifyUseEmailInstead")}
                </Button>
              )}
              {mode === "email" && canUseSms && (
                <Button
                  variant="ghost"
                  onClick={() => switchMode("sms")}
                  className="text-xs text-primary hover:underline p-0 h-auto"
                >
                  {t("verifyUseSmsInstead")}
                </Button>
              )}
            </Row>

            <div className={`${flex.start} gap-2`}>
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                {t("consentOtpCancelBtn")}
              </Button>
              <Button
                variant="primary"
                isLoading={isSending}
                onClick={handleSend}
              >
                {mode === "sms"
                  ? t("verifySendSmsBtn")
                  : t("verifySendEmailBtn")}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Step 2: enter code ─────────────────────────────────── */
          <div className={spacing.stack}>
            <Text variant="secondary">
              {mode === "sms"
                ? t("verifySentDescPhone", { phone: maskedTarget ?? "" })
                : t("verifySentDescEmail", { email: maskedTarget ?? "" })}
            </Text>

            <div>
              <Label className="block text-sm font-medium mb-1.5">
                {t("verifyCodeLabel")}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
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
                  {t("verifyConfirmBtn")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}
