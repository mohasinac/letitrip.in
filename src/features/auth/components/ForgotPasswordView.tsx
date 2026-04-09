"use client";

/**
 * ForgotPasswordView — Feature component for forgot password flow.
 * Extracted from auth/forgot-password/page.tsx (Rule 10 — page thickness limit).
 */

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AuthStatusPanel } from "@mohasinac/appkit/features/auth";
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
        <Card className="max-w-md w-full p-6 sm:p-8 text-center">
          <AuthStatusPanel
            tone="success"
            title={t("forgotPassword.checkEmail")}
            message={t("forgotPassword.resetLinkSentTo", { email })}
            actions={
              <div className={THEME_CONSTANTS.spacing.stackSmall}>
                <Text variant="secondary" size="sm" className="mb-2 block">
                  {t("forgotPassword.linkExpires")}
                </Text>
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
            }
          />
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
