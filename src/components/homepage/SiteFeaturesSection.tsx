"use client";

import { THEME_CONSTANTS } from "@/constants";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: "secure-payment",
    icon: "🔒",
    title: "Secure Payments",
    description: "Multiple payment options with encrypted transactions",
  },
  {
    id: "easy-returns",
    icon: "↩️",
    title: "Easy Returns",
    description: "7-day hassle-free return policy on all products",
  },
  {
    id: "quality-check",
    icon: "✓",
    title: "Quality Check",
    description: "Every item verified before shipment",
  },
  {
    id: "customer-support",
    icon: "💬",
    title: "24/7 Support",
    description: "Round-the-clock customer service via chat and phone",
  },
  {
    id: "seller-protection",
    icon: "🛡️",
    title: "Seller Protection",
    description: "Safe and secure platform for sellers to grow business",
  },
  {
    id: "buyer-guarantee",
    icon: "⭐",
    title: "Buyer Guarantee",
    description: "Money-back guarantee if item not as described",
  },
];

export function SiteFeaturesSection() {
  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            Why Shop With Us?
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} max-w-2xl mx-auto`}
          >
            Your satisfaction is our priority. We provide a seamless shopping
            experience with unmatched features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
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
