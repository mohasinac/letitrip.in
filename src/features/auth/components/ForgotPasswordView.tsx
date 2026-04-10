"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ForgotPasswordView as AppkitForgotPasswordView } from "@mohasinac/appkit/features/auth";
import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useForgotPassword } from "@/hooks";
import { TextLink } from "@/components";

export function ForgotPasswordView() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { mutate: forgotPassword, isPending: isLoading } = useForgotPassword({
    onSuccess: () => setSuccess(t("forgotPassword.checkEmail")),
    onError: (err) =>
      setError(err.message || t("forgotPassword.failedSendEmail")),
  });

  return (
    <AppkitForgotPasswordView
      isLoading={isLoading}
      error={error}
      success={success}
      labels={{
        title: t("forgotPassword.pageTitle"),
        description: t("forgotPassword.subtitle"),
        emailLabel: t("shared.emailAddress"),
        emailPlaceholder: t("shared.emailPlaceholder"),
        submitLabel: t("forgotPassword.sendResetEmail"),
        submittingLabel: t("forgotPassword.sending"),
      }}
      onSubmit={async (email) => {
        setError(null);
        setSuccess(null);
        await forgotPassword({ email });
      }}
      renderBackLink={() => (
        <TextLink
          href={ROUTES.AUTH.LOGIN}
          className="text-primary hover:underline"
        >
          {t("forgotPassword.signInLink")}
        </TextLink>
      )}
    />
  );
}
