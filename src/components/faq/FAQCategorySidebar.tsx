"use client";
import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants/theme";

export const FAQ_CATEGORIES = {
  general: {
    label: "General",
    icon: "ℹ️",
    description: "About our platform, services, and policies",
  },
  products: {
    label: "Products & Auctions",
    icon: "🛍️",
    description: "Product listings, auctions, bidding, and quality",
  },
  shipping: {
    label: "Shipping & Delivery",
    icon: "🚚",
    description: "Delivery times, tracking, shipping options, and COD",
  },
  returns: {
    label: "Returns & Refunds",
    icon: "🔄",
    description: "Return policy, refund process, and timelines",
  },
  payment: {
    label: "Payment & Coupons",
    icon: "💳",
    description: "Payment methods, COD deposit, coupons, and pricing",
  },
  account: {
    label: "Account & Security",
    icon: "👤",
    description: "Registration, login, verification, and profile",
  },
  sellers: {
    label: "For Sellers",
    icon: "🏪",
    description: "Selling guidelines, fees, payouts, and dashboard",
  },
} as const;

export type FAQCategoryKey = keyof typeof FAQ_CATEGORIES;

interface FAQCategorySidebarProps {
  selectedCategory: FAQCategoryKey | "all";
  onCategorySelect: (category: FAQCategoryKey | "all") => void;
  categoryCounts: Record<FAQCategoryKey, number>;
}

export function FAQCategorySidebar({
  selectedCategory,
  onCategorySelect,
  categoryCounts,
}: FAQCategorySidebarProps) {
  const totalCount = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div
      className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.spacing.padding.lg} sticky top-4 h-fit`}
    >
      {/* Title */}
      <h2
        className={`${THEME_CONSTANTS.typography.h3} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
      >
        Categories
      </h2>

      {/* All FAQs */}
      <button
        onClick={() => onCategorySelect("all")}
        className={`w-full text-left ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} mb-2 transition-colors ${
          selectedCategory === "all"
            ? `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} font-medium`
            : `${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.bgTertiary}`
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <span className={THEME_CONSTANTS.typography.body}>All FAQs</span>
          </div>
          <span
            className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {totalCount}
          </span>
        </div>
      </button>

      {/* Category List */}
      <div className="pt-3 mt-2 border-t ${THEME_CONSTANTS.themed.border}">
        {Object.entries(FAQ_CATEGORIES).map(([key, category]) => {
          const isSelected = selectedCategory === key;
          const count = categoryCounts[key as FAQCategoryKey] || 0;

          return (
            <button
              key={key}
              onClick={() => onCategorySelect(key as FAQCategoryKey)}
              className={`w-full text-left ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} mb-2 transition-colors ${
                isSelected
                  ? `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} font-medium`
                  : `${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.bgTertiary}`
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className={THEME_CONSTANTS.typography.body}>
                    {category.label}
                  </span>
                </div>
                <span
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  {count}
                </span>
              </div>
              {isSelected && (
                <p
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary} ml-11`}
                >
                  {category.description}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Contact Support CTA */}
      <div className="pt-6 border-t ${THEME_CONSTANTS.themed.border}">
        <p
          className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary} mb-3`}
        >
          Still have questions?
        </p>
        <Link
          href="/contact"
          className={`block text-center ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
