"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { VerifyEmailView as AppkitVerifyEmailView } from "@mohasinac/appkit/features/auth";
import { ROUTES } from "@/constants";
import { useVerifyEmail } from "@/hooks";
import { Button, Spinner } from "@/components";

function VerifyEmailContent() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const { mutate: verifyEmail } = useVerifyEmail({
    onSuccess: () => setStatus("success"),
    onError: (err) => {
      setError(err.message || t("verifyEmail.checkFailed"));
      setStatus("error");
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmail({ token });
    } else {
      setError(t("verifyEmail.noToken"));
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AppkitVerifyEmailView
      status={status}
      error={error}
      labels={{
        loadingTitle: t("verifyEmail.verifyingTitle"),
        loadingDescription: t("verifyEmail.verifyingMessage"),
        successTitle: t("verifyEmail.success"),
        successDescription: t("verifyEmail.successMessage"),
        errorTitle: t("verifyEmail.failed"),
        errorDescription: t("verifyEmail.invalidTokenMessage"),
      }}
      renderContinueButton={() => (
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.USER.PROFILE)}
          className="w-full"
        >
          {t("verifyEmail.goToProfile")}
        </Button>
      )}
    />
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
