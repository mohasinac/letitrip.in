/**
 * LoginForm — full login form including email/password fields,
 * social sign-in options, and auth redirect logic.
 *
 * Wrapped in Suspense by the page because it uses useSearchParams().
 */

"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Button, Alert, Spinner, Checkbox } from "@/components";
import {
  UI_LABELS,
  ERROR_MESSAGES,
  ROUTES,
  THEME_CONSTANTS,
} from "@/constants";
import { useAuth, useLogin, useGoogleLogin, useAppleLogin } from "@/hooks";
import { AuthSocialButtons } from "./AuthSocialButtons";

const { themed, spacing } = THEME_CONSTANTS;
const LABELS = UI_LABELS.AUTH;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || ROUTES.USER.PROFILE;
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: login, isLoading: loginLoading } = useLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError(err.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const { mutate: googleLogin, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) => setError(err.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const { mutate: appleLogin, isLoading: appleLoading } = useAppleLogin({
    onSuccess: () => {},
    onError: (err) => setError(err.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED),
  });

  const loading = loginLoading || googleLoading || appleLoading;

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

  const handleApple = useCallback(async () => {
    setError(null);
    await appleLogin();
  }, [appleLogin]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center py-8 sm:py-12 w-full">
      <div className={`max-w-md w-full ${spacing.stack}`}>
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
          </div>
          <h1
            className={`mt-6 text-center text-3xl font-extrabold ${themed.textPrimary}`}
          >
            {LABELS.LOGIN.TITLE}
          </h1>
          <p className={`mt-2 text-center text-sm ${themed.textSecondary}`}>
            {LABELS.LOGIN.OR}{" "}
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {LABELS.LOGIN.CREATE_ACCOUNT_LINK}
            </Link>
          </p>
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
            <Input
              id="email"
              name="email"
              type="email"
              label={LABELS.SHARED.EMAIL_ADDRESS}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              autoComplete="username"
              placeholder={LABELS.SHARED.EMAIL_PLACEHOLDER}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label={LABELS.SHARED.PASSWORD}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              autoComplete="current-password"
              placeholder={LABELS.SHARED.PASSWORD_PLACEHOLDER}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${themed.textPrimary}`}
              >
                {LABELS.LOGIN.REMEMBER_ME}
              </label>
            </div>
            <div className="text-sm">
              <Link
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {LABELS.LOGIN.FORGOT_PASSWORD_LINK}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? LABELS.LOGIN.SIGNING_IN : LABELS.LOGIN.SIGN_IN}
          </Button>
        </form>

        <AuthSocialButtons
          onGoogle={handleGoogle}
          onApple={handleApple}
          disabled={loading}
        />
      </div>
    </div>
  );
}
