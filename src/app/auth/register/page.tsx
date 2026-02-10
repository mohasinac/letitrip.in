/**
 * Registration Page
 *
 * Refactored to use API client, hooks, and reusable components
 */

"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Alert,
  Checkbox,
  Spinner,
  FormField,
  PasswordStrengthIndicator,
} from "@/components";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  THEME_CONSTANTS,
  UI_LABELS,
} from "@/constants";
import { useAuth, useRegister, useGoogleLogin, useAppleLogin } from "@/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    acceptTerms: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { mutate: register, isLoading: registerLoading } = useRegister({
    onSuccess: () => {
      setMessage({
        type: "success",
        text: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
      });
      setTimeout(() => router.push(ROUTES.USER.PROFILE), 1000);
    },
    onError: (err) =>
      setMessage({
        type: "error",
        text: err.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      }),
  });

  const { mutate: googleRegister, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(ROUTES.USER.PROFILE),
    onError: (err) =>
      setMessage({
        type: "error",
        text: err.message || UI_LABELS.AUTH.REGISTER.GOOGLE_REGISTER_FAILED,
      }),
  });

  const { mutate: appleRegister, isLoading: appleLoading } = useAppleLogin({
    onSuccess: () => router.push(ROUTES.USER.PROFILE),
    onError: (err) =>
      setMessage({
        type: "error",
        text: err.message || UI_LABELS.AUTH.REGISTER.APPLE_REGISTER_FAILED,
      }),
  });

  const isLoading = registerLoading || googleLoading || appleLoading;

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push(ROUTES.USER.PROFILE);
    }
  }, [user, authLoading, router]);

  // All hooks MUST be called before any conditional returns
  const handleBlur = useCallback(
    (field: string) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [],
  );

  const handleGoogleRegister = useCallback(async () => {
    setMessage(null);
    await googleRegister();
  }, [googleRegister]);

  const handleAppleRegister = useCallback(async () => {
    setMessage(null);
    await appleRegister();
  }, [appleRegister]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  // Don't render register form if user is authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: UI_LABELS.AUTH.REGISTER.PASSWORDS_NO_MATCH,
      });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT,
      });
      return;
    }

    if (!formData.acceptTerms) {
      setMessage({
        type: "error",
        text: UI_LABELS.AUTH.REGISTER.MUST_ACCEPT_TERMS,
      });
      return;
    }

    if (!formData.email) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      });
      return;
    }

    await register({
      email: formData.email.trim(),
      password: formData.password,
      displayName: formData.displayName.trim() || undefined,
    });
  };

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
            {UI_LABELS.AUTH.REGISTER.TITLE}
          </h1>
          <p
            className={`mt-2 text-center text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {UI_LABELS.AUTH.REGISTER.OR}{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {UI_LABELS.AUTH.REGISTER.SIGN_IN_LINK}
            </Link>
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className={`mt-8 ${THEME_CONSTANTS.spacing.stack}`}
        >
          <div className={THEME_CONSTANTS.spacing.stack}>
            {/* Display Name */}
            <FormField
              label={UI_LABELS.AUTH.REGISTER.DISPLAY_NAME_LABEL}
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={(value) =>
                setFormData({ ...formData, displayName: value })
              }
              onBlur={handleBlur("displayName")}
              touched={touched.displayName}
              disabled={isLoading}
              placeholder={UI_LABELS.AUTH.REGISTER.DISPLAY_NAME_PLACEHOLDER}
            />

            {/* Email Address */}
            <FormField
              label={UI_LABELS.AUTH.SHARED.EMAIL_ADDRESS}
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              onBlur={handleBlur("email")}
              touched={touched.email}
              disabled={isLoading}
              placeholder={UI_LABELS.AUTH.SHARED.EMAIL_PLACEHOLDER}
              required
            />

            {/* Password */}
            <FormField
              label={UI_LABELS.AUTH.SHARED.PASSWORD}
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              onBlur={handleBlur("password")}
              touched={touched.password}
              disabled={isLoading}
              placeholder={UI_LABELS.AUTH.SHARED.PASSWORD_PLACEHOLDER}
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}

            {/* Confirm Password */}
            <FormField
              label={UI_LABELS.AUTH.REGISTER.CONFIRM_PASSWORD}
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData({ ...formData, confirmPassword: value })
              }
              onBlur={handleBlur("confirmPassword")}
              touched={touched.confirmPassword}
              error={
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? UI_LABELS.AUTH.REGISTER.PASSWORDS_NO_MATCH
                  : undefined
              }
              disabled={isLoading}
              placeholder={UI_LABELS.AUTH.SHARED.PASSWORD_PLACEHOLDER}
              required
            />

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
              />
              <label
                htmlFor="acceptTerms"
                className={`ml-2 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {UI_LABELS.AUTH.REGISTER.ACCEPT_TERMS}{" "}
                <Link
                  href={ROUTES.PUBLIC.TERMS}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {UI_LABELS.AUTH.REGISTER.TERMS_OF_SERVICE}
                </Link>{" "}
                {UI_LABELS.AUTH.REGISTER.AND}{" "}
                <Link
                  href={ROUTES.PUBLIC.PRIVACY}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {UI_LABELS.AUTH.REGISTER.PRIVACY_POLICY}
                </Link>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !formData.acceptTerms}
          >
            {isLoading
              ? UI_LABELS.AUTH.REGISTER.CREATING_ACCOUNT
              : UI_LABELS.AUTH.REGISTER.CREATE_ACCOUNT}
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

        {/* Social Registration Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={isLoading}
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
            onClick={handleAppleRegister}
            disabled={isLoading}
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
