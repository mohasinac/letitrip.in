"use client";

/**
 * VerifyEmailView — Feature component for email verification flow.
 * Extracted from auth/verify-email/page.tsx (Rule 10 — page thickness limit).
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Button, Alert, Spinner, Heading, Text } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useVerifyEmail } from "@/hooks";

function VerifyEmailContent() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: verifyEmail, isLoading } = useVerifyEmail({
    onSuccess: () => setIsSuccess(true),
    onError: (err) => setError(err.message || t("verifyEmail.checkFailed")),
  });

  useEffect(() => {
    if (token) {
      verifyEmail({ token });
    } else {
      setError(t("verifyEmail.noToken"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full p-8 text-center">
        {isLoading && (
          <>
            <div className="mb-4 text-blue-500">
              <svg
                className="w-16 h-16 mx-auto animate-spin"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              {t("verifyEmail.verifyingTitle")}
            </Heading>
            <Text className="text-gray-600">
              {t("verifyEmail.verifyingMessage")}
            </Text>
          </>
        )}

        {isSuccess && (
          <>
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
              {t("verifyEmail.success")}
            </Heading>
            <Text className="text-gray-600 mb-6">
              {t("verifyEmail.successMessage")}
            </Text>
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.USER.PROFILE)}
              className="w-full"
            >
              {t("verifyEmail.goToProfile")}
            </Button>
          </>
        )}

        {error && !isLoading && !isSuccess && (
          <>
            <div className="mb-4 text-red-500">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              {t("verifyEmail.failed")}
            </Heading>
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
            <Text className="text-gray-600 mb-6">
              {t("verifyEmail.invalidTokenMessage")}
            </Text>
            <div className={THEME_CONSTANTS.spacing.stackSmall}>
              <Button
                variant="primary"
                onClick={() => router.push(ROUTES.USER.PROFILE)}
                className="w-full"
              >
                {t("verifyEmail.goToProfile")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push(ROUTES.HOME)}
                className="w-full"
              >
                {t("verifyEmail.goToHome")}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function VerifyEmailView() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
