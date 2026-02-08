"use client";

import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { Button } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

interface WelcomeSectionData {
  h1: string;
  subtitle: string;
  description: string; // Rich text HTML
  showCTA: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export function WelcomeSection() {
  const { data, isLoading } = useApiQuery<{ section: WelcomeSectionData }>({
    queryKey: ["homepage-section", "welcome"],
    queryFn: () =>
      fetch(
        `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?type=welcome&enabled=true`,
      ).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div
          className={`${THEME_CONSTANTS.container["2xl"]} mx-auto text-center`}
        >
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 max-w-3xl mx-auto" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 max-w-2xl mx-auto" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-4xl mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!data?.section) {
    return null;
  }

  const section = data.section;

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div
        className={`${THEME_CONSTANTS.container["2xl"]} mx-auto text-center`}
      >
        {/* H1 Heading */}
        <h1
          className={`${THEME_CONSTANTS.typography.h1} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
        >
          {section.h1}
        </h1>

        {/* Subtitle */}
        {section.subtitle && (
          <p
            className={`${THEME_CONSTANTS.typography.body} text-lg ${THEME_CONSTANTS.themed.textSecondary} mb-8`}
          >
            {section.subtitle}
          </p>
        )}

        {/* Rich Text Description */}
        {section.description && (
          <div
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} max-w-4xl mx-auto mb-8 prose prose-lg dark:prose-invert`}
            dangerouslySetInnerHTML={{ __html: section.description }}
          />
        )}

        {/* CTA Button */}
        {section.showCTA && section.ctaText && section.ctaLink && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = section.ctaLink!)}
            >
              {section.ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
