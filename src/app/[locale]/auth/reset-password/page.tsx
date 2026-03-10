import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Spinner } from "@/components";
import { ResetPasswordView } from "@/features/auth";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return {
    title: `${t("pageTitle")} — ${SITE_CONFIG.brand.name}`,
    robots: { index: false },
  };
}

export default function ResetPasswordPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <ResetPasswordView />
    </Suspense>
  );
}
