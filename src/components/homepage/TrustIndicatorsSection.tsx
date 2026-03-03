"use client";

import { THEME_CONSTANTS, TRUST_INDICATORS } from "@/constants";
import { Heading, Section, Text } from "@/components";

export function TrustIndicatorsSection() {
  return (
    <Section
      className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-8">
          {TRUST_INDICATORS.map((indicator, index) => (
            <div
              key={index}
              className={`text-center ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="text-4xl md:text-5xl mb-2 md:mb-3">
                {indicator.icon}
              </div>
              <Heading
                level={3}
                className={`${THEME_CONSTANTS.typography.h6} ${THEME_CONSTANTS.themed.textPrimary} mb-1 md:mb-2`}
              >
                {indicator.title}
              </Heading>
              <Text
                className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {indicator.description}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
