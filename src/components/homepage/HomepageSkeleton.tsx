"use client";

import { THEME_CONSTANTS } from "@/constants";

/** Full-page skeleton shown while homepage data is loading. */
export function HomepageSkeleton() {
  const { skeleton, spacing, borderRadius } = THEME_CONSTANTS;

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Carousel skeleton */}
      <div
        className={`${skeleton.card} w-full`}
        style={{ height: "28rem" }}
        aria-hidden="true"
      />

      {/* Trust Features skeleton — 4 cards */}
      <section
        className={`${spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`${skeleton.card} flex flex-col items-center gap-3 p-6`}
              style={{ height: "9rem" }}
            />
          ))}
        </div>
      </section>

      {/* Top Categories skeleton — 6 cards */}
      <section
        className={`${spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className={`${skeleton.heading} w-48 mx-auto mb-6`} />
        <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`${skeleton.card}`}
              style={{ height: "8rem" }}
            />
          ))}
        </div>
      </section>

      {/* Featured Products skeleton — 5 cards */}
      <section
        className={`${spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className={`${skeleton.heading} w-52`} />
          <div className={`${skeleton.text} w-24`} />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className={`${skeleton.image} w-full`}
                style={{ paddingBottom: "100%" }}
              />
              <div className={`${skeleton.text} w-3/4`} />
              <div className={`${skeleton.text} w-1/2`} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Auctions skeleton — 5 cards */}
      <section
        className={`${spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className={`${skeleton.heading} w-56`} />
          <div className={`${skeleton.text} w-24`} />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className={`${skeleton.image} w-full`}
                style={{ paddingBottom: "100%" }}
              />
              <div className={`${skeleton.text} w-3/4`} />
              <div className={`${skeleton.text} w-1/2`} />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter skeleton */}
      <section
        className={`${spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div
          className={`${skeleton.card} ${borderRadius["2xl"]} max-w-2xl mx-auto`}
          style={{ height: "16rem" }}
        />
      </section>
    </div>
  );
}
