import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { THEME_CONSTANTS } from "@/constants";
import { FAQPageContent } from "@/features/faq";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <div className={`animate-pulse ${THEME_CONSTANTS.spacing.stack}`}>
            <div
              className={`h-32 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl}`}
            />
            <div
              className={`h-16 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl}`}
            />
            <div
              className={`h-96 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl}`}
            />
          </div>
        </div>
      }
    >
      <FAQPageContent initialCategory="all" />
    </Suspense>
  );
}
