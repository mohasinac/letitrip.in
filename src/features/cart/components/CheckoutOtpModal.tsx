"use client";

/**
 * CheckoutOtpModal
 *
 * Shown before any order is placed (COD or online).
 * Sends a Firebase phone OTP to the user's registered number and waits for
 * a valid 6-digit code before firing onVerified().
 *
 * If the user has no phone number on their account a prompt is shown with a
 * link to profile settings instead.
 */

import React, { useEffect, useId, useState } from "react";
import { Input } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";
import * as AppkitCartFeature from "@mohasinac/appkit/features/cart";
import { Label, Text, Button } from "@mohasinac/appkit/ui";
import { SideDrawer, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { usePaymentOtp } from "../hooks/usePaymentOtp";

const { spacing, flex } = THEME_CONSTANTS;

interface CheckoutOtpModalProps {
  isOpen: boolean;
  phoneNumber: string | null;
  onVerified: () => void;
  onClose: () => void;
}

type ModalContainerContext = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const AppkitCheckoutOtpModal = (
  AppkitCartFeature as {
    CheckoutOtpModal?: React.ComponentType<{
      isOpen: boolean;
      title?: string;
      onClose: () => void;
      renderContainer: (context: ModalContainerContext) => React.ReactNode;
      renderBody: () => React.ReactNode;
    }>;
  }
).CheckoutOtpModal;

/** Masks all but the last 4 digits of a phone number. */
function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4);
}

export function CheckoutOtpModal({
  isOpen,
  phoneNumber,
  onVerified,
  onClose,
}: CheckoutOtpModalProps) {
  const t = useTranslations("checkout");
  const recaptchaId = useId().replace(/:/g, "recaptcha");
  const [code, setCode] = useState("");

  const { otpState, error, requestOtp, confirmOtp, reset } =
    usePaymentOtp(phoneNumber);

  // Reset internal state whenever the modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCode("");
    }
  }, [isOpen, reset]);

  // Fire callback once OTP is verified
  useEffect(() => {
    if (otpState === "verified") {
      onVerified();
    }
  }, [otpState, onVerified]);

  const handleSend = () => {
    requestOtp(recaptchaId);
  };

  const handleVerify = () => {
    if (code.length === 6) {
      confirmOtp(code);
    }
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
  };

  const hasNoPhone = !phoneNumber;
  const isSending = otpState === "sending";
  const isVerifying = otpState === "verifying";
  const friendlyError = (() => {
    if (!error) return null;
    switch (error) {
      case "no_phone":
        return null; // handled by hasNoPhone branch
      case "invalid_code":
        return t("otpErrorInvalid");
      case "expired_code":
        return t("otpErrorExpired");
      case "phone_mismatch":
        return t("otpErrorMismatch");
      case "daily_limit":
        return t("otpErrorDailyLimit");
      default:
        return error;
    }
  })();

  const modalBody = (
    <>
      <div id={recaptchaId} />

      <div className={spacing.stack}>
        {hasNoPhone ? (
          <div className="text-center space-y-3">
            <Text variant="secondary">{t("otpNoPhone")}</Text>
            <Text size="sm" variant="secondary">
              {t("otpAddPhone")}
            </Text>
            <TextLink href={ROUTES.USER.SETTINGS}>
              {t("otpGoToProfile")}
            </TextLink>
          </div>
        ) : otpState === "idle" ||
          (otpState === "error" && !verificationSent(error)) ? (
          <div className={spacing.stack}>
            <Text variant="secondary">{t("otpModalDesc")}</Text>
            <Text size="sm" className="font-mono font-semibold">
              {maskPhone(phoneNumber)}
            </Text>
            {friendlyError && (
              <Text size="sm" className="text-red-600 dark:text-red-400">
                {friendlyError}
              </Text>
            )}
            <div className={`${flex.start} gap-2`}>
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                {t("otpCancelBtn")}
              </Button>
              <Button
                variant="primary"
                isLoading={isSending}
                onClick={handleSend}
              >
                {t("otpSendBtn")}
              </Button>
            </div>
          </div>
        ) : (
          <div className={spacing.stack}>
            <Text variant="secondary">
              {t("otpSentDesc", { phone: maskPhone(phoneNumber) })}
            </Text>

            <div className="space-y-1">
              <Label
                htmlFor="otp-code-input"
                className="block text-sm font-medium"
              >
                {t("otpInputLabel")}
              </Label>
              <Input
                id="otp-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={handleCodeInput}
                placeholder={t("otpInputPlaceholder")}
                className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary"
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
                onClick={handleSend}
                disabled={isSending || isVerifying}
              >
                {isSending ? t("otpSending") : t("otpResendBtn")}
              </Button>
              <Button
                variant="primary"
                isLoading={isVerifying}
                disabled={code.length !== 6}
                onClick={handleVerify}
              >
                {t("otpVerifyBtn")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (AppkitCheckoutOtpModal) {
    return (
      <AppkitCheckoutOtpModal
        isOpen={isOpen}
        title={t("otpModalTitle")}
        onClose={onClose}
        renderContainer={({
          isOpen: open,
          onClose: close,
          title,
          children,
        }) => (
          <SideDrawer
            isOpen={open}
            onClose={close}
            title={title ?? t("otpModalTitle")}
            mode="edit"
          >
            {children}
          </SideDrawer>
        )}
        renderBody={() => modalBody}
      />
    );
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("otpModalTitle")}
      mode="edit"
    >
      {modalBody}
    </SideDrawer>
  );
}

/** True if the error indicates OTP was already sent (code_sent or re-send scenario). */
function verificationSent(error: string | null): boolean {
  return error === "invalid_code" || error === "expired_code";
}

