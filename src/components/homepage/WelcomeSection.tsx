"use client";

import { useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";
import { apiClient } from "@/lib/api-client";
import type {
  HomepageSectionDocument,
  WelcomeSectionConfig,
} from "@/db/schema";

export function WelcomeSection() {
  const router = useRouter();
  const { data, isLoading } = useApiQuery<HomepageSectionDocument[]>({
    queryKey: ["homepage-section", "welcome"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?type=welcome&enabled=true`,
      ),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="w-full text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 max-w-3xl mx-auto" />
            <div
              className={`h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
            />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-4xl mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!data?.[0]) {
    return null;
  }

  const section = data[0];
  const config = section.config as WelcomeSectionConfig;

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full text-center">
        {/* H1 Heading */}
        <h1
          className={`${THEME_CONSTANTS.typography.h1} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
        >
          {config.h1}
        </h1>

        {/* Subtitle */}
        {config.subtitle && (
          <p
            className={`${THEME_CONSTANTS.typography.body} text-lg ${THEME_CONSTANTS.themed.textSecondary} mb-8`}
          >
            {config.subtitle}
          </p>
        )}

        {/* Rich Text Description */}
        {config.description && (
          <div
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} max-w-4xl mx-auto mb-8 prose prose-lg dark:prose-invert`}
            dangerouslySetInnerHTML={{ __html: config.description }}
          />
        )}

        {/* CTA Button */}
        {config.showCTA && config.ctaText && config.ctaLink && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(config.ctaLink!)}
            >
              {config.ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
