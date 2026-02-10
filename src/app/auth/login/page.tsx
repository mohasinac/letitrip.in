/**
 * Login Page
 *
 * Comprehensive login interface with multiple authentication methods:
 * - Email + Password
 * - Google OAuth
 * - Apple OAuth
 *
 * Features:
 * - Form validation
 * - Loading states
 * - Error handling
 * - Redirect to callback URL after login
 * - Remember me option
 * - Link to registration
 *
 * Note: Phone login removed - phone is only used in user profile for verification
 */

"use client";

import { useState, FormEvent, Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Button, Alert, Spinner } from "@/components";
import {
  UI_LABELS,
  ERROR_MESSAGES,
  ROUTES,
  THEME_CONSTANTS,
} from "@/constants";
import { useAuth, useLogin, useGoogleLogin, useAppleLogin } from "@/hooks";

function LoginForm() {
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

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push(callbackUrl);
    }
  }, [user, authLoading, router, callbackUrl]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      await login({
        email: formData.email,
        password: formData.password,
      });
    },
    [formData.email, formData.password, login],
  );

  const handleGoogleLogin = useCallback(async () => {
    setError(null);
    await googleLogin();
  }, [googleLogin]);

  const handleAppleLogin = useCallback(async () => {
    setError(null);
    await appleLogin();
  }, [appleLogin]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-8 sm:py-12 w-full">
      <div className={`max-w-md w-full ${THEME_CONSTANTS.spacing.stack}`}>
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
          </div>
          <h1
            className={`mt-6 text-center text-3xl font-extrabold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {UI_LABELS.AUTH.LOGIN.TITLE}
          </h1>
          <p
            className={`mt-2 text-center text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            Or{" "}
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {UI_LABELS.AUTH.LOGIN.CREATE_ACCOUNT_LINK}
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
        <form
          className={`mt-8 ${THEME_CONSTANTS.spacing.stack}`}
          onSubmit={handleSubmit}
        >
          <div className={THEME_CONSTANTS.spacing.stack}>
            <Input
              id="email"
              name="email"
              type="email"
              label={UI_LABELS.AUTH.SHARED.EMAIL_ADDRESS}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              autoComplete="username"
              placeholder={UI_LABELS.AUTH.SHARED.EMAIL_PLACEHOLDER}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label={UI_LABELS.AUTH.SHARED.PASSWORD}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              autoComplete="current-password"
              placeholder={UI_LABELS.AUTH.SHARED.PASSWORD_PLACEHOLDER}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${THEME_CONSTANTS.themed.border} rounded`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                {UI_LABELS.AUTH.LOGIN.REMEMBER_ME}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {UI_LABELS.AUTH.LOGIN.FORGOT_PASSWORD_LINK}
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
            {loading
              ? UI_LABELS.AUTH.LOGIN.SIGNING_IN
              : UI_LABELS.AUTH.LOGIN.SIGN_IN}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div
              className={`w-full border-t ${THEME_CONSTANTS.themed.border}`}
            ></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className={`px-2 ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textMuted}`}
            >
              {UI_LABELS.AUTH.LOGIN.OR_CONTINUE_WITH}
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {UI_LABELS.AUTH.LOGIN.GOOGLE}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleAppleLogin}
            disabled={loading}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {UI_LABELS.AUTH.LOGIN.APPLE}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
