"use client";

/**
 * VerifyEmailView — Feature component for email verification flow.
 * Extracted from auth/verify-email/page.tsx (Rule 10 — page thickness limit).
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthStatusPanel } from "@mohasinac/appkit/features/auth";
import { Heading, Text } from "@mohasinac/appkit/ui";
import { Card, Button, Alert, Spinner } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useVerifyEmail } from "@/hooks";

const { flex } = THEME_CONSTANTS;

function VerifyEmailContent() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: verifyEmail, isPending: isLoading } = useVerifyEmail({
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
    <div className={`min-h-screen ${flex.center} px-4 py-8`}>
      <Card className="max-w-md w-full p-8 text-center">
        {isLoading && (
          <>
            <Spinner size="xl" variant="primary" className="mx-auto mb-4" />
            <Heading level={4} className="mb-2">
              {t("verifyEmail.verifyingTitle")}
            </Heading>
            <Text variant="secondary">{t("verifyEmail.verifyingMessage")}</Text>
          </>
        )}

        {isSuccess && (
          <AuthStatusPanel
            tone="success"
            title={t("verifyEmail.success")}
            message={t("verifyEmail.successMessage")}
            actions={
              <Button
                variant="primary"
                onClick={() => router.push(ROUTES.USER.PROFILE)}
                className="w-full"
              >
                {t("verifyEmail.goToProfile")}
              </Button>
            }
          />
        )}

        {error && !isLoading && !isSuccess && (
          <>
            <AuthStatusPanel tone="error" title={t("verifyEmail.failed")} />
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
            <Text variant="secondary" className="mb-6">
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
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
