"use client";

import { THEME_CONSTANTS } from "@/constants";
import { Section } from "@/components";

/** Full-page skeleton shown while homepage data is loading. */
export function HomepageSkeleton() {
  const { skeleton, flex, homepage } = THEME_CONSTANTS;

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Carousel skeleton */}
      <div
        className={`${skeleton.card} w-full ${homepage.heroSkeletonH}`}
        aria-hidden="true"
      />

      {/* Trust Features skeleton — 4 cards */}
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgPrimary}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`${skeleton.card} flex flex-col items-center gap-3 p-6 ${homepage.trustCardH}`}
            />
          ))}
        </div>
      </Section>

      {/* Top Categories skeleton — 6 cards */}
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgSecondary}`}>
        <div className={`${skeleton.heading} w-48 mx-auto mb-6`} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${skeleton.card} ${homepage.categoryTileH}`} />
          ))}
        </div>
      </Section>

      {/* Featured Products skeleton — 5 cards */}
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgPrimary}`}>
        <div className={`${flex.between} mb-6`}>
          <div className={`${skeleton.heading} w-52`} />
          <div className={`${skeleton.text} w-24`} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`${skeleton.image} w-full pb-[100%]`} />
              <div className={`${skeleton.text} w-3/4`} />
              <div className={`${skeleton.text} w-1/2`} />
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Auctions skeleton — 5 cards */}
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgSecondary}`}>
        <div className={`${flex.between} mb-6`}>
          <div className={`${skeleton.heading} w-56`} />
          <div className={`${skeleton.text} w-24`} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`${skeleton.image} w-full pb-[100%]`} />
              <div className={`${skeleton.text} w-3/4`} />
              <div className={`${skeleton.text} w-1/2`} />
            </div>
          ))}
        </div>
      </Section>

      {/* Newsletter skeleton */}
      <Section className={`p-8 ${THEME_CONSTANTS.themed.bgPrimary}`}>
        <div
          className={`${skeleton.card} rounded-2xl max-w-2xl mx-auto ${homepage.newsletterH}`}
        />
      </Section>
    </div>
  );
}
