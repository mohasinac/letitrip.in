"use client";

import { useTranslations } from "next-intl";
import { useHomepageReviews } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Heading, Section, Text } from "@mohasinac/appkit/ui";
import { HorizontalScroller, TextLink } from "@/components";
import { ReviewCard } from "@/components";
import type { ReviewCardData } from "@/components";
import type { ReviewDocument } from "@/db/schema";

interface CustomerReviewsSectionProps {
  initialReviews?: ReviewDocument[];
}

export function CustomerReviewsSection({
  initialReviews,
}: CustomerReviewsSectionProps = {}) {
  const t = useTranslations("homepage");
  const { homepage, card } = THEME_CONSTANTS;
  const { dimensions } = card;

  const { data, isLoading } = useHomepageReviews({
    initialData: initialReviews as unknown as ReviewCardData[],
  });

  const reviews = data || [];

  if (isLoading) {
    return (
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgPrimary}`}>
        <div className="w-full max-w-7xl mx-auto">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs mx-auto`}
          />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${THEME_CONSTANTS.skeleton.card} ${homepage.reviewCardH} ${dimensions.railMinW} ${dimensions.railMaxW} flex-none`}
              />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <Section className={`py-12 ${THEME_CONSTANTS.themed.bgPrimary}`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Heading
            level={2}
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {t("whatOurCustomersSay")}
          </Heading>
          <Text
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {t("reviewsSubtitle")}
          </Text>
        </div>

        {/* Scrollable reviews */}
        <HorizontalScroller
          items={reviews}
          renderItem={(review) => (
            <ReviewCard
              key={review.id}
              review={review}
              className={homepage.reviewCardH}
            />
          )}
          perView={{ base: 1, sm: 2, md: 3, lg: 3, "2xl": 4 }}
          gap={24}
          autoScroll
          autoScrollInterval={4500}
          pauseOnHover
          snapToItems
          showArrows
        />

        {/* See all reviews link */}
        <div className="text-center mt-8">
          <TextLink
            href={ROUTES.PUBLIC.PRODUCTS}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            {t("seeAllReviews")}
          </TextLink>
        </div>
      </div>
    </Section>
  );
}
