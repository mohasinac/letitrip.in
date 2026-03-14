"use client";

/**
 * ForgotPasswordView — Feature component for forgot password flow.
 * Extracted from auth/forgot-password/page.tsx (Rule 10 — page thickness limit).
 */

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  Button,
  Alert,
  FormField,
  FormGroup,
  Heading,
  Text,
  TextLink,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useForgotPassword } from "@/hooks";

const { flex, page } = THEME_CONSTANTS;

export function ForgotPasswordView() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: forgotPassword, isPending: isLoading } = useForgotPassword({
    onSuccess: () => setSuccess(true),
    onError: (err) =>
      setError(err.message || t("forgotPassword.failedSendEmail")),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await forgotPassword({ email: email.trim() });
  };

  if (success) {
    return (
      <div className={`${flex.center} ${page.authPad} w-full`}>
        <Card className="max-w-md w-full p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mb-4 text-green-500 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              {t("forgotPassword.checkEmail")}
            </Heading>
            <Text variant="secondary" className="mb-6">
              {t("forgotPassword.resetLinkSentTo", { email })}
            </Text>
            <Text variant="secondary" size="sm" className="mb-6 block">
              {t("forgotPassword.linkExpires")}
            </Text>
          </div>

          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="w-full"
            >
              {t("forgotPassword.returnToLogin")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setTouched(false);
              }}
              className="w-full"
            >
              {t("forgotPassword.sendAnotherEmail")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${flex.center} ${page.authPad} w-full`}>
      <Card className="max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <Heading level={4} className="mb-2">
            {t("forgotPassword.pageTitle")}
          </Heading>
          <Text variant="secondary">{t("forgotPassword.subtitle")}</Text>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={THEME_CONSTANTS.spacing.stack}>
          <FormGroup>
            <FormField
              label={t("shared.emailAddress")}
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched(true)}
              touched={touched}
              placeholder={t("shared.emailPlaceholder")}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading
              ? t("forgotPassword.sending")
              : t("forgotPassword.sendResetEmail")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text variant="secondary" size="sm">
            {t("forgotPassword.rememberPassword")}{" "}
            <TextLink
              href={ROUTES.AUTH.LOGIN}
              className="text-primary hover:underline"
            >
              {t("forgotPassword.signInLink")}
            </TextLink>
          </Text>
        </div>
      </Card>
    </div>
  );
}
