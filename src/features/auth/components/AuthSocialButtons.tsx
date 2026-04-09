/**
 * AuthSocialButtons — shared Google + Apple sign-in button pair with OR divider.
 * Used by LoginForm and RegisterForm.
 */

"use client";

import { SocialAuthButtons } from "@mohasinac/appkit/features/auth";
import { useTranslations } from "next-intl";

interface AuthSocialButtonsProps {
  onGoogle: () => void;
  disabled?: boolean;
}

export function AuthSocialButtons({
  onGoogle,
  disabled,
}: AuthSocialButtonsProps) {
  const t = useTranslations("auth");
  return (
    <SocialAuthButtons
      onGoogle={onGoogle}
      disabled={disabled}
      dividerLabel={t("login.orContinueWith")}
      googleLabel={t("login.google")}
    />
  );
}
