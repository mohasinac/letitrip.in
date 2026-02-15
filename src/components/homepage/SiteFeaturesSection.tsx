"use client";

import { THEME_CONSTANTS, SITE_FEATURES, UI_LABELS } from "@/constants";

export function SiteFeaturesSection() {
  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {UI_LABELS.HOMEPAGE.FEATURES.TITLE}
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
          >
            {UI_LABELS.HOMEPAGE.FEATURES.SUBTITLE}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SITE_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={`${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.spacing.padding.lg} text-center hover:shadow-lg transition-all group`}
            >
              {/* Icon */}
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2`}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
