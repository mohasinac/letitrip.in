"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { COMPANY_NAME } from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRegister } from "@/contexts/LoginRegisterContext";
import { useI18n } from "@/lib/i18n/useI18n";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * LoginForm Component
 * Pure presentational component with form UI and state from context
 *
 * State is managed via:
 * - useLoginRegister context: form data, validation, submission
 * - useAuth context: authentication state and redirect logic
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [rememberMe, setRememberMe] = useState(false);

  // Get all login form state from context
  const {
    loginForm,
    loginPassword,
    loginLoading,
    loginError,
    handleLoginSubmit,
  } = useLoginRegister();

  // Prevent redirect loop: if already authenticated, redirect to home or specified page
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  // Wrap form submission with redirect logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await handleLoginSubmit(e);

    // Store remember me preference in localStorage
    if (rememberMe && !loginError) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    // Redirect after successful login
    if (!loginError) {
      const redirect = searchParams.get("redirect") || "/";
      setTimeout(() => {
        router.replace(redirect);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {COMPANY_NAME}
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("auth.login.subtitle")}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {loginError || "Login failed. Please try again."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <FormField
              label={t("auth.login.email")}
              required
              error={loginForm.errors.email}
            >
              <FormInput
                type="email"
                name="email"
                value={loginForm.formData.email}
                onChange={loginForm.handleChange}
                onBlur={loginForm.handleBlur}
                placeholder={t("auth.login.emailPlaceholder")}
                autoComplete="email"
              />
            </FormField>

            {/* Password with show/hide */}
            <div>
              <FormField
                label={t("auth.login.password")}
                required
                error={loginForm.errors.password}
              >
                <div className="relative">
                  <FormInput
                    type={loginPassword.showPassword ? "text" : "password"}
                    name="password"
                    value={loginForm.formData.password}
                    onChange={loginForm.handleChange}
                    onBlur={loginForm.handleBlur}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={loginPassword.togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label={
                      loginPassword.showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {loginPassword.showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <FormCheckbox
                id="remember-me"
                label={t("auth.login.rememberMe")}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                href="/forgot-password"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium py-2"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            {/* Submit Button - Mobile Optimized (48px min height) */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full min-h-[48px] py-3 px-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-gray-900 font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("common.loading")}
                </span>
              ) : (
                t("auth.login.signIn")
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("auth.login.orContinueWith")}
                </span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="mt-6">
            <GoogleSignInButton disabled={loginLoading} />
          </div>

          {/* Register Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("auth.login.noAccount")}
                </span>
              </div>
            </div>
          </div>

          {/* Register Link - Mobile Optimized */}
          <div className="mt-6">
            <Link
              href="/register"
              className="block w-full min-h-[48px] py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-yellow-500 hover:text-yellow-600 active:bg-yellow-50 dark:active:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all text-center"
            >
              {t("auth.login.createAccount")}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("auth.login.agreementText")}{" "}
          <Link href="/terms" className="text-yellow-600 hover:text-yellow-700">
            {t("auth.login.termsOfService")}
          </Link>{" "}
          {t("auth.login.and")}{" "}
          <Link
            href="/privacy"
            className="text-yellow-600 hover:text-yellow-700"
          >
            {t("auth.login.privacyPolicy")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
