/**
 * RegisterForm — full registration form including email/password/name fields,
 * terms acceptance, social sign-up options, and auth redirect logic.
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
import { AuthSocialButtons } from "./AuthSocialButtons";

const { themed, spacing } = THEME_CONSTANTS;
const LABELS = UI_LABELS.AUTH;

export function RegisterForm() {
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
        text: err.message || LABELS.REGISTER.GOOGLE_REGISTER_FAILED,
      }),
  });

  const { mutate: appleRegister, isLoading: appleLoading } = useAppleLogin({
    onSuccess: () => router.push(ROUTES.USER.PROFILE),
    onError: (err) =>
      setMessage({
        type: "error",
        text: err.message || LABELS.REGISTER.APPLE_REGISTER_FAILED,
      }),
  });

  const isLoading = registerLoading || googleLoading || appleLoading;

  useEffect(() => {
    if (!authLoading && user) router.push(ROUTES.USER.PROFILE);
  }, [user, authLoading, router]);

  const handleBlur = useCallback(
    (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true })),
    [],
  );

  const handleGoogle = useCallback(async () => {
    setMessage(null);
    await googleRegister();
  }, [googleRegister]);

  const handleApple = useCallback(async () => {
    setMessage(null);
    await appleRegister();
  }, [appleRegister]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: LABELS.REGISTER.PASSWORDS_NO_MATCH });
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
      setMessage({ type: "error", text: LABELS.REGISTER.MUST_ACCEPT_TERMS });
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
            {LABELS.REGISTER.TITLE}
          </h1>
          <p className={`mt-2 text-center text-sm ${themed.textSecondary}`}>
            {LABELS.REGISTER.OR}{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {LABELS.REGISTER.SIGN_IN_LINK}
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
        <form onSubmit={handleSubmit} className={`mt-8 ${spacing.stack}`}>
          <div className={spacing.stack}>
            <FormField
              label={LABELS.REGISTER.DISPLAY_NAME_LABEL}
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={(value) =>
                setFormData({ ...formData, displayName: value })
              }
              onBlur={handleBlur("displayName")}
              touched={touched.displayName}
              disabled={isLoading}
              placeholder={LABELS.REGISTER.DISPLAY_NAME_PLACEHOLDER}
            />

            <FormField
              label={LABELS.SHARED.EMAIL_ADDRESS}
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              onBlur={handleBlur("email")}
              touched={touched.email}
              disabled={isLoading}
              placeholder={LABELS.SHARED.EMAIL_PLACEHOLDER}
              required
            />

            <FormField
              label={LABELS.SHARED.PASSWORD}
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              onBlur={handleBlur("password")}
              touched={touched.password}
              disabled={isLoading}
              placeholder={LABELS.SHARED.PASSWORD_PLACEHOLDER}
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}

            <FormField
              label={LABELS.REGISTER.CONFIRM_PASSWORD}
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
                  ? LABELS.REGISTER.PASSWORDS_NO_MATCH
                  : undefined
              }
              disabled={isLoading}
              placeholder={LABELS.SHARED.PASSWORD_PLACEHOLDER}
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
                className={`ml-2 text-sm ${themed.textSecondary}`}
              >
                {LABELS.REGISTER.ACCEPT_TERMS}{" "}
                <Link
                  href={ROUTES.PUBLIC.TERMS}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {LABELS.REGISTER.TERMS_OF_SERVICE}
                </Link>{" "}
                {LABELS.REGISTER.AND}{" "}
                <Link
                  href={ROUTES.PUBLIC.PRIVACY}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {LABELS.REGISTER.PRIVACY_POLICY}
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
              ? LABELS.REGISTER.CREATING_ACCOUNT
              : LABELS.REGISTER.CREATE_ACCOUNT}
          </Button>
        </form>

        <AuthSocialButtons
          onGoogle={handleGoogle}
          onApple={handleApple}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
