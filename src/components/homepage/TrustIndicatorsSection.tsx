"use client";

import { THEME_CONSTANTS } from "@/constants";

interface TrustIndicator {
  icon: string;
  title: string;
  description: string;
}

const indicators: TrustIndicator[] = [
  {
    icon: "📦",
    title: "Wide Range",
    description: "10,000+ Products Across Categories",
  },
  {
    icon: "🚚",
    title: "Fast Shipping",
    description: "Delivery in 2-5 Business Days",
  },
  {
    icon: "✓",
    title: "Original Products",
    description: "100% Authentic & Verified",
  },
  {
    icon: "👥",
    title: "50,000+ Customers",
    description: "Trusted by Thousands Nationwide",
  },
];

export function TrustIndicatorsSection() {
  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className={`text-center ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="text-4xl md:text-5xl mb-2 md:mb-3">
                {indicator.icon}
              </div>
              <h3
                className={`${THEME_CONSTANTS.typography.h3} ${THEME_CONSTANTS.themed.textPrimary} mb-1 md:mb-2`}
              >
                {indicator.title}
              </h3>
              <p
                className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
