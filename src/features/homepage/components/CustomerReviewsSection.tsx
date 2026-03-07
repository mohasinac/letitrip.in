"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useHomepageReviews, useSwipe } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, Section, Text, TextLink } from "@/components";
import { ReviewCard } from "@/components";

export function CustomerReviewsSection() {
  const t = useTranslations("homepage");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading } = useHomepageReviews();

  const reviews = data || [];
  const totalGroups = Math.ceil(reviews.length / 3);

  const sectionRef = useRef<HTMLElement>(null);

  const goNext = () =>
    setCurrentIndex((p) => (p + 3 >= reviews.length ? 0 : p + 3));
  const goPrev = () =>
    setCurrentIndex((p) => (p === 0 ? Math.max(0, reviews.length - 3) : p - 3));

  useSwipe(sectionRef, { onSwipeLeft: goNext, onSwipeRight: goPrev });

  if (isLoading) {
    return (
      <Section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="w-full">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs mx-auto`}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${THEME_CONSTANTS.skeleton.card} h-48`}
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

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <Section
      ref={sectionRef}
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
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

        {/* Reviews Grid — 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 mb-8">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Navigation Dots */}
        {totalGroups > 1 && (
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(totalGroups)].map((_, i) => (
              <Button
                key={i}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 3) === i
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 w-2"
                }`}
                onClick={() => setCurrentIndex(i * 3)}
                aria-label={`Go to review group ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* See all reviews link */}
        <div className="text-center">
          <TextLink
            href={ROUTES.PUBLIC.PRODUCTS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {t("seeAllReviews")}
          </TextLink>
        </div>
      </div>
    </Section>
  );
}
