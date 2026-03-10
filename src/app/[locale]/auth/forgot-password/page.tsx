import { getTranslations } from "next-intl/server";
import { ForgotPasswordView } from "@/features/auth";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgotPassword");
  return {
    title: `${t("pageTitle")} — ${SITE_CONFIG.brand.name}`,
    robots: { index: false },
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
