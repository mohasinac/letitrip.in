import { Spinner } from "@mohasinac/appkit/ui";
/**
 * Register Page
 *
 * Thin page — all form logic lives in RegisterForm (src/features/auth).
 * Wrapped in Suspense because RegisterForm uses useSearchParams().
 */

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { RegisterForm } from "@/features/auth";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return {
    title: `${t("title")} — ${SITE_CONFIG.brand.name}`,
    robots: { index: false },
  };
}

export default function RegisterPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
