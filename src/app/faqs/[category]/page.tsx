import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FAQ_CATEGORIES, ROUTES, THEME_CONSTANTS } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { FAQPageContent } from "@/components/faq";

interface Props {
  params: { category: string };
}

export function generateStaticParams() {
  return Object.keys(FAQ_CATEGORIES).map((category) => ({ category }));
}

export default function FAQCategoryPage({ params }: Props) {
  const { category } = params;

  if (!(category in FAQ_CATEGORIES)) {
    redirect(ROUTES.PUBLIC.FAQS);
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
