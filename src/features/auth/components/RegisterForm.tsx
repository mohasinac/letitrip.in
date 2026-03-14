/**
 * RegisterForm — full registration form including email/password/name fields,
 * terms acceptance, social sign-up options, and auth redirect logic.
 */

"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  FormField,
  FormGroup,
  Heading,
  Label,
  PasswordStrengthIndicator,
  Span,
  Spinner,
  Text,
  TextLink,
} from "@/components";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  THEME_CONSTANTS,
} from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useRegister, useGoogleLogin } from "@/hooks";
import { AuthSocialButtons } from "./AuthSocialButtons";

const { themed, spacing, flex, page } = THEME_CONSTANTS;

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

  const { mutate: register, isPending: registerLoading } = useRegister({
    onSuccess: () => {
      setMessage({
        type: "success",
        text: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
      });
      setTimeout(() => router.push(callbackUrl), 1000);
    },
    onError: (err) =>
      setMessage({
        type: "error",
        text: err.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      }),
  });

  const { mutate: googleRegister, isLoading: googleLoading } = useGoogleLogin({
    onSuccess: () => router.push(callbackUrl),
    onError: (err) =>
      setMessage({
        type: "error",
        text: t("register.googleRegisterFailed"),
      }),
  });

  const isLoading = registerLoading || googleLoading;

  useEffect(() => {
    if (!authLoading && user) router.push(callbackUrl);
  }, [user, authLoading, router, callbackUrl]);

  const handleBlur = useCallback(
    (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true })),
    [],
  );

  const handleGoogle = useCallback(async () => {
    setMessage(null);
    await googleRegister();
  }, [googleRegister]);

  if (authLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: t("register.passwordsNoMatch") });
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
      setMessage({ type: "error", text: t("register.mustAcceptTerms") });
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
      acceptTerms: formData.acceptTerms,
    });
  };

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
            {t("register.title")}
          </Heading>
          <Text
            size="sm"
            className={`mt-2 text-center ${themed.textSecondary}`}
          >
            {t("register.or")}{" "}
            <TextLink
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-primary hover:text-primary/80"
            >
              {t("register.signInLink")}
            </TextLink>
          </Text>
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
              label={t("register.displayNameLabel")}
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={(value) =>
                setFormData({ ...formData, displayName: value })
              }
              onBlur={handleBlur("displayName")}
              touched={touched.displayName}
              disabled={isLoading}
              placeholder={t("register.displayNamePlaceholder")}
            />

            <FormField
              label={t("shared.emailAddress")}
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              onBlur={handleBlur("email")}
              touched={touched.email}
              disabled={isLoading}
              placeholder={t("shared.emailPlaceholder")}
              required
            />

            <FormField
              label={t("shared.password")}
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              onBlur={handleBlur("password")}
              touched={touched.password}
              disabled={isLoading}
              placeholder={t("shared.passwordPlaceholder")}
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}

            <FormField
              label={t("register.confirmPassword")}
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
                  ? t("register.passwordsNoMatch")
                  : undefined
              }
              disabled={isLoading}
              placeholder={t("shared.passwordPlaceholder")}
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
              <Label
                htmlFor="acceptTerms"
                className={`ml-2 text-sm ${themed.textSecondary}`}
              >
                {t("register.acceptTerms")}{" "}
                <TextLink
                  href={ROUTES.PUBLIC.TERMS}
                  className="text-primary hover:text-primary/80"
                >
                  {t("register.termsOfService")}
                </TextLink>{" "}
                {t("register.and")}{" "}
                <TextLink
                  href={ROUTES.PUBLIC.PRIVACY}
                  className="text-primary hover:text-primary/80"
                >
                  {t("register.privacyPolicy")}
                </TextLink>
              </Label>
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
              ? t("register.creatingAccount")
              : t("register.createAccount")}
          </Button>
        </form>

        <AuthSocialButtons onGoogle={handleGoogle} disabled={isLoading} />
      </div>
    </div>
  );
}
