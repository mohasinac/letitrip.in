/**
 * LoginForm — full login form including email/password fields,
 * social sign-in options, and auth redirect logic.
 *
 * Wrapped in Suspense by the page because it uses useSearchParams().
 */

"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  FormGroup,
  Heading,
  Input,
  Label,
  Span,
  Spinner,
  Text,
  TextLink,
} from "@/components";
import { ERROR_MESSAGES, ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useLogin, useGoogleLogin } from "@/hooks";
import { AuthSocialButtons } from "./AuthSocialButtons";

const { themed, spacing, flex, page } = THEME_CONSTANTS;

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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: login, isPending: loginLoading } = useLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError(err.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const { mutate: googleLogin, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError(err.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const loading = loginLoading || googleLoading;

  useEffect(() => {
    if (!authLoading && user) router.push(callbackUrl);
  }, [user, authLoading, router, callbackUrl]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      await login({ email: formData.email, password: formData.password });
    },
    [formData.email, formData.password, login],
  );

  const handleGoogle = useCallback(async () => {
    setError(null);
    await googleLogin();
  }, [googleLogin]);

  if (authLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className={`${flex.center} ${page.authPad} w-full`}>
      <div className={`max-w-md w-full ${spacing.stack}`}>
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 bg-primary rounded-2xl ${flex.center} shadow-lg`}
            >
              <Span className="text-white text-2xl font-bold">L</Span>
            </div>
          </div>
          <Heading
            level={1}
            className={`mt-6 text-center text-3xl font-extrabold ${themed.textPrimary}`}
          >
            {t("login.title")}
          </Heading>
          <Text
            size="sm"
            className={`mt-2 text-center ${themed.textSecondary}`}
          >
            {t("login.or")}{" "}
            <TextLink
              href={ROUTES.AUTH.REGISTER}
              className="font-medium text-primary hover:text-primary/80"
            >
              {t("login.createAccountLink")}
            </TextLink>
          </Text>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form className={`mt-8 ${spacing.stack}`} onSubmit={handleSubmit}>
          <div className={spacing.stack}>
            <FormGroup columns={1}>
              <Input
                id="email"
                name="email"
                type="email"
                label={t("shared.emailAddress")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="username"
                placeholder={t("shared.emailPlaceholder")}
              />
              <Input
                id="password"
                name="password"
                type="password"
                label={t("shared.password")}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                autoComplete="current-password"
                placeholder={t("shared.passwordPlaceholder")}
              />
            </FormGroup>
          </div>

          <div className={flex.between}>
            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              <Label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${themed.textPrimary}`}
              >
                {t("login.rememberMe")}
              </Label>
            </div>
            <div className="text-sm">
              <TextLink
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="font-medium text-primary hover:text-primary/80"
              >
                {t("login.forgotPasswordLink")}
              </TextLink>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? t("login.signingIn") : t("login.signIn")}
          </Button>
        </form>

        <AuthSocialButtons onGoogle={handleGoogle} disabled={loading} />
      </div>
    </div>
  );
}
