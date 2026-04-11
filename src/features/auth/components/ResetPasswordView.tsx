"use client";

import { Spinner } from "@mohasinac/appkit/ui";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ResetPasswordView as AppkitResetPasswordView } from "@mohasinac/appkit/features/auth";
import { ROUTES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useResetPassword } from "@/hooks";
import { TextLink } from "@/components";

function ResetPasswordContent() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError(t("resetPassword.invalidOrMissingToken"));
  }, [token, t]);

  const { mutate: resetPassword, isPending: isLoading } = useResetPassword({
    onSuccess: () => setSuccess(t("resetPassword.successMessage")),
    onError: (err) =>
      setError(err.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  return (
    <AppkitResetPasswordView
      oobCode={token}
      isLoading={isLoading}
      error={error}
      success={success}
      labels={{
        title: t("resetPassword.pageTitle"),
        description: t("resetPassword.subtitleShort"),
        passwordLabel: t("resetPassword.newPassword"),
        confirmPasswordLabel: t("resetPassword.confirmNewPassword"),
        confirmPasswordPlaceholder: t(
          "resetPassword.confirmNewPasswordPlaceholder",
        ),
        submitLabel: t("resetPassword.resetPassword"),
        submittingLabel: t("resetPassword.resetting"),
        passwordMismatch: t("resetPassword.passwordsNoMatch"),
      }}
      onSubmit={async (_oobCode, newPassword) => {
        setError(null);
        await resetPassword({ token, newPassword });
      }}
      renderLoginLink={() => (
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

export function ResetPasswordView() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
