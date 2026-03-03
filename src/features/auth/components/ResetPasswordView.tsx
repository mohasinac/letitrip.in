"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Card,
  Button,
  Alert,
  FormField,
  PasswordStrengthIndicator,
  Heading,
  Text,
  TextLink,
} from "@/components";
import { useResetPassword } from "@/hooks";
import { useTranslations } from "next-intl";
import {
  ERROR_MESSAGES,
  ROUTES,
  UI_PLACEHOLDERS,
  THEME_CONSTANTS,
} from "@/constants";

const { flex } = THEME_CONSTANTS;

export function ResetPasswordView() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [tokenError, setTokenError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(t("resetPassword.invalidOrMissingToken"));
    }
  }, [token, t]);

  const {
    mutate: resetPassword,
    isLoading,
    error,
  } = useResetPassword({
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setTokenError(t("resetPassword.invalidOrMissingToken"));
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return; // Error shown in FormField
    }

    await resetPassword({
      token,
      newPassword: passwords.newPassword,
    });
  };

  if (success) {
    return (
      <div className={`min-h-screen ${flex.center} px-4 py-8`}>
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-4 text-green-500">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Heading level={4} className="mb-2">
            {t("resetPassword.success")}
          </Heading>
          <Text className="text-gray-600 mb-6">
            {t("resetPassword.successMessage")}
          </Text>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="w-full"
          >
            {t("resetPassword.goToLogin")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${flex.center} px-4 py-8`}>
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Heading level={4} className="mb-2">
            {t("resetPassword.pageTitle")}
          </Heading>
          <Text className="text-gray-600">
            {t("resetPassword.subtitleShort")}
          </Text>
        </div>

        {(error || tokenError) && (
          <Alert variant="error" className="mb-4">
            {error?.message || tokenError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={THEME_CONSTANTS.spacing.stack}>
          <FormField
            label={t("resetPassword.newPassword")}
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={(value) =>
              setPasswords({ ...passwords, newPassword: value })
            }
            onBlur={handleBlur("newPassword")}
            touched={touched.newPassword}
            placeholder={UI_PLACEHOLDERS.PASSWORD}
            disabled={isLoading}
            required
          />

          {passwords.newPassword && (
            <PasswordStrengthIndicator password={passwords.newPassword} />
          )}

          <FormField
            label={t("resetPassword.confirmNewPassword")}
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={(value) =>
              setPasswords({ ...passwords, confirmPassword: value })
            }
            onBlur={handleBlur("confirmPassword")}
            touched={touched.confirmPassword}
            error={
              passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword
                ? t("resetPassword.passwordsNoMatch")
                : undefined
            }
            placeholder={t("resetPassword.confirmNewPasswordPlaceholder")}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={
              isLoading ||
              !passwords.newPassword ||
              !passwords.confirmPassword ||
              passwords.newPassword !== passwords.confirmPassword
            }
            className="w-full"
          >
            {isLoading
              ? t("resetPassword.resetting")
              : t("resetPassword.resetPassword")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text className="text-gray-600 text-sm">
            {t("forgotPassword.rememberPassword")}{" "}
            <TextLink
              href={ROUTES.AUTH.LOGIN}
              className="text-blue-600 hover:underline"
            >
              {t("forgotPassword.signInLink")}
            </TextLink>
          </Text>
        </div>
      </Card>
    </div>
  );
}
