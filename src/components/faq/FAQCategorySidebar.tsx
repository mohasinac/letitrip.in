"use client";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, FAQ_CATEGORIES, ROUTES } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { Heading, Span, Text, TextLink } from "@/components";

// Re-export for backward compatibility — consumers that imported from this file continue to work.
export { FAQ_CATEGORIES } from "@/constants";
export type { FAQCategoryKey } from "@/constants";

const { flex } = THEME_CONSTANTS;

interface FAQCategorySidebarProps {
  selectedCategory: FAQCategoryKey | "all";
  /** Called after navigation for any local state sync. Navigation is handled by the Link href. */
  onCategorySelect?: (category: FAQCategoryKey | "all") => void;
  categoryCounts: Record<FAQCategoryKey, number>;
}

export function FAQCategorySidebar({
  selectedCategory,
  onCategorySelect,
  categoryCounts,
}: FAQCategorySidebarProps) {
  const t = useTranslations("faq");
  const totalCount = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div
      className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.spacing.padding.lg} sticky top-4 h-fit`}
    >
      {/* Title */}
      <Heading
        level={2}
        className={`${THEME_CONSTANTS.typography.h3} ${THEME_CONSTANTS.themed.textPrimary} mb-6`}
      >
        {t("categories")}
      </Heading>

      {/* All FAQs */}
      <TextLink
        href={ROUTES.PUBLIC.FAQS}
        onClick={() => onCategorySelect?.("all")}
        className={`block w-full text-left ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} mb-3 transition-colors ${
          selectedCategory === "all"
            ? `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} font-medium`
            : `${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.bgTertiary}`
        }`}
      >
        <div className={flex.between}>
          <div className="flex items-center gap-3">
            <Span className="text-2xl">📚</Span>
            <Span className={THEME_CONSTANTS.typography.body}>{t("allFaqs")}</Span>
          </div>
          <Span
            className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {totalCount}
          </Span>
        </div>
      </TextLink>

      {/* Category List */}
      <div className={`pt-6 mt-4 border-t ${THEME_CONSTANTS.themed.border}`}>
        {Object.entries(FAQ_CATEGORIES).map(([key, category]) => {
          const isSelected = selectedCategory === key;
          const count = categoryCounts[key as FAQCategoryKey] || 0;

          return (
            <TextLink
              key={key}
              href={ROUTES.PUBLIC.FAQ_CATEGORY(key)}
              onClick={() => onCategorySelect?.(key as FAQCategoryKey)}
              className={`block w-full text-left ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} mb-3 transition-colors ${
                isSelected
                  ? `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} font-medium`
                  : `${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.bgTertiary}`
              }`}
            >
              <div className={`${flex.between} mb-1`}>
                <div className="flex items-center gap-3">
                  <Span className="text-2xl">{category.icon}</Span>
                  <Span className={THEME_CONSTANTS.typography.body}>
                    {t(`category.${key}`)}
                  </Span>
                </div>
                <Span
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  {count}
                </Span>
              </div>
              {isSelected && (
                <Text
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary} ml-11`}
                >
                  {t(`categoryDescription.${key}`)}
                </Text>
              )}
            </TextLink>
          );
        })}
      </div>

      {/* Contact Support CTA */}
      <div className={`pt-6 border-t ${THEME_CONSTANTS.themed.border}`}>
        <Text
          className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary} mb-3`}
        >
          {t("stillHaveQuestions")}
        </Text>
        <TextLink
          href={ROUTES.PUBLIC.CONTACT}
          className={`block text-center ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
        >
          {t("contactSupport")}
        </TextLink>
      </div>
    </div>
  );
}
