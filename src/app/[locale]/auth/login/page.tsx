import { Spinner } from "@mohasinac/appkit/ui";
/**
 * Login Page
 *
 * Thin page — all form logic lives in LoginForm (src/features/auth).
 * Wrapped in Suspense because LoginForm uses useSearchParams().
 */

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/features/auth";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: `${t("title")} — ${SITE_CONFIG.brand.name}`,
    robots: { index: false },
  };
}

export default function LoginPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
