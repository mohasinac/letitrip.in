import { redirect } from "@/i18n/navigation";
import { Suspense } from "react";
import { FAQ_CATEGORIES, ROUTES, THEME_CONSTANTS } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { FAQPageContent } from "@/features/faq";

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export function generateStaticParams() {
  return Object.keys(FAQ_CATEGORIES).map((category) => ({ category }));
}

export default async function FAQCategoryPage({ params }: Props) {
  const { locale, category } = await params;

  if (!(category in FAQ_CATEGORIES)) {
    redirect({ href: ROUTES.PUBLIC.FAQS, locale });
  }

  return (
    <Suspense
      fallback={
        <div
          className={`${THEME_CONSTANTS.container["2xl"]} mx-auto ${THEME_CONSTANTS.spacing.padding.xl} py-12`}
        >
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
      <FAQPageContent initialCategory={category as FAQCategoryKey} />
    </Suspense>
  );
}
