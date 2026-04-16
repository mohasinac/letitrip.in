/**
 * LoginForm — thin wrapper around appkit LoginForm.
 * Wires letitrip auth hooks, routing and translations.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { LoginForm as AppkitLoginForm } from "@mohasinac/appkit/features/auth";
import { ROUTES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/SessionContext";
import { useLogin, useGoogleLogin } from "@mohasinac/appkit/features/auth";
import { AuthSocialButtons } from "./AuthSocialButtons";
import { TextLink } from "@/components";

export function LoginForm() {
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

  const { mutate: login, isPending: loginLoading } = useLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError((err as Error).message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const { mutate: googleLogin, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError((err as Error).message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  useEffect(() => {
    if (!authLoading && user) router.push(callbackUrl);
  }, [user, authLoading, router, callbackUrl]);

  if (authLoading || user) return null;

  return (
    <AppkitLoginForm
      isLoading={loginLoading || (googleLoading ?? false)}
      error={error}
      labels={{
        title: t("login.title"),
        emailLabel: t("shared.emailAddress"),
        emailPlaceholder: t("shared.emailPlaceholder"),
        passwordLabel: t("shared.password"),
        passwordPlaceholder: t("shared.passwordPlaceholder"),
        rememberMe: t("login.rememberMe"),
        submitLabel: t("login.signIn"),
        submittingLabel: t("login.signingIn"),
      }}
      onSubmit={async ({ email, password }) => {
        setError(null);
        await login({ email, password });
      }}
      renderCreateAccountLink={() => (
        <TextLink
          href={ROUTES.AUTH.REGISTER}
          className="font-medium text-primary hover:text-primary/80"
        >
          {t("login.createAccountLink")}
        </TextLink>
      )}
      renderForgotPasswordLink={() => (
        <TextLink
          href={ROUTES.AUTH.FORGOT_PASSWORD}
          className="font-medium text-primary hover:text-primary/80"
        >
          {t("login.forgotPasswordLink")}
        </TextLink>
      )}
      renderSocialButtons={() => (
        <AuthSocialButtons
          onGoogle={async () => {
            setError(null);
            await googleLogin();
          }}
          disabled={loginLoading || (googleLoading ?? false)}
        />
      )}
    />
  );
}

