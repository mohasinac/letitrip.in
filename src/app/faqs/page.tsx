import type { Metadata } from "next";
import { Suspense } from "react";
import {
  THEME_CONSTANTS,
  generateMetadata as genMetadata,
  SEO_CONFIG,
} from "@/constants";
import { FAQPageContent } from "@/components/faq";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.faqs.title,
  description: SEO_CONFIG.pages.faqs.description,
  keywords: [...SEO_CONFIG.pages.faqs.keywords],
  path: "/faqs",
});

export default function FAQPage() {
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
      <FAQPageContent initialCategory="all" />
    </Suspense>
  );
}
