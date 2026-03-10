import { getTranslations } from "next-intl/server";
import { VerifyEmailView } from "@/features/auth";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verifyEmail");
  return {
    title: `${t("verifyingTitle")} — ${SITE_CONFIG.brand.name}`,
    robots: { index: false },
  };
}

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
