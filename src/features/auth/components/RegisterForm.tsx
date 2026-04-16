"use client";

import { Spinner } from "@mohasinac/appkit/ui";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { RegisterForm as AppkitRegisterForm } from "@mohasinac/appkit/features/auth";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/SessionContext";
import { useRegister, useGoogleLogin } from "@mohasinac/appkit/features/auth";
import { PasswordStrengthIndicator, TextLink } from "@/components";
import { AuthSocialButtons } from "./AuthSocialButtons";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith("/")
      ? rawCallbackUrl
      : ROUTES.USER.PROFILE;
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { mutate: register, isPending: registerLoading } = useRegister({
    onSuccess: () => {
      setSuccess(SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS);
      setTimeout(() => router.push(callbackUrl), 1000);
    },
    onError: (err) => setError((err as Error).message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  const { mutate: googleRegister, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: () => setError(t("register.googleRegisterFailed")),
  });

  useEffect(() => {
    if (!authLoading && user) router.push(callbackUrl);
  }, [user, authLoading, router, callbackUrl]);

  if (authLoading)
    return <Spinner size="xl" variant="primary" className="mx-auto py-16" />;
  if (user) return null;

  return (
    <AppkitRegisterForm
      isLoading={registerLoading || (googleLoading ?? false)}
      error={error}
      success={success}
      labels={{
        title: t("register.title"),
        displayNameLabel: t("shared.fullName"),
        displayNamePlaceholder: t("shared.fullNamePlaceholder"),
        emailLabel: t("shared.emailAddress"),
        emailPlaceholder: t("shared.emailPlaceholder"),
        passwordLabel: t("shared.password"),
        passwordPlaceholder: t("shared.passwordPlaceholder"),
        confirmPasswordLabel: t("register.confirmPassword"),
        confirmPasswordPlaceholder: t("shared.passwordPlaceholder"),
        acceptTermsLabel: t("register.acceptTermsLabel"),
        submitLabel: t("register.createAccount"),
        submittingLabel: t("register.creating"),
        passwordMismatch: t("register.passwordsNoMatch"),
      }}
      onSubmit={async (values) => {
        setError(null);
        await register(values);
      }}
      renderPasswordStrength={(password) =>
        password ? <PasswordStrengthIndicator password={password} /> : null
      }
      renderLoginLink={() => (
        <TextLink
          href={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary hover:text-primary/80"
        >
          {t("register.signInLink")}
        </TextLink>
      )}
      renderTermsLink={() => (
        <TextLink
          href={ROUTES.PUBLIC.TERMS}
          className="font-medium text-primary hover:underline"
        >
          {t("register.termsLink")}
        </TextLink>
      )}
      renderSocialButtons={() => (
        <AuthSocialButtons
          onGoogle={async () => {
            setError(null);
            await googleRegister();
          }}
          disabled={registerLoading || (googleLoading ?? false)}
        />
      )}
    />
  );
}

