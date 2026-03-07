"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  THEME_CONSTANTS,
  ROUTES,
  FAQ_CATEGORIES,
  getStaticFaqsByCategory,
  getStaticFaqCategoryCounts,
} from "@/constants";
import type { FAQCategoryKey, StaticFAQItem } from "@/constants";
import {
  Button,
  Heading,
  Section,
  Span,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  TextLink,
} from "@/components";

const { flex } = THEME_CONSTANTS;

export function FAQSection() {
  const t = useTranslations("faq");
  const tEmpty = useTranslations("empty");
  const tActions = useTranslations("actions");
  const [activeCategory, setActiveCategory] =
    useState<FAQCategoryKey>("general");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const categoryCounts = getStaticFaqCategoryCounts();
  const faqs: StaticFAQItem[] = getStaticFaqsByCategory(activeCategory, 10);
  const totalInCategory = categoryCounts[activeCategory] ?? 0;
  const hasMore = totalInCategory > faqs.length;

  const handleCategoryChange = (cat: FAQCategoryKey) => {
    setActiveCategory(cat);
    setOpenFaqId(null);
  };

  const toggleFaq = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <Section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-8">
          <Heading
            level={2}
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {t("title")}
          </Heading>
          <Text
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {t("subtitle")}
          </Text>
        </div>

        {/* Category Tabs — single horizontal scrollable row, nav-item style */}
        <Tabs
          variant="line"
          value={activeCategory}
          onChange={(v) => handleCategoryChange(v as FAQCategoryKey)}
        >
          <TabsList className="pb-1 mb-8">
            {(
              Object.entries(FAQ_CATEGORIES) as [
                FAQCategoryKey,
                (typeof FAQ_CATEGORIES)[FAQCategoryKey],
              ][]
            ).map(([key, category]) => (
              <TabsTrigger key={key} value={key}>
                <Span>{category.icon}</Span>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* FAQ Accordion */}
        <div className={`${THEME_CONSTANTS.spacing.stack} max-w-3xl mx-auto`}>
          {faqs.length === 0 && (
            <Text
              className={`text-center py-8 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {tEmpty("noData")}
            </Text>
          )}
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius["2xl"]} overflow-hidden transition-all`}
            >
              {/* Question Button */}
              <Button
                variant="ghost"
                className={`w-full text-left ${THEME_CONSTANTS.spacing.padding.lg} ${flex.between} gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                onClick={() => toggleFaq(faq.id)}
              >
                <Span
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium flex-1`}
                >
                  {faq.question}
                </Span>
                <svg
                  className={`w-5 h-5 ${THEME_CONSTANTS.themed.textSecondary} transition-transform ${
                    openFaqId === faq.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {/* Answer (Collapsible) */}
              {openFaqId === faq.id && (
                <div className={`${THEME_CONSTANTS.spacing.padding.lg} pt-0`}>
                  <div
                    className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.borderRadius.md} ${THEME_CONSTANTS.themed.bgTertiary} p-4`}
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More / View All Link */}
        <div className="text-center mt-8">
          <TextLink
            href={ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium ${THEME_CONSTANTS.accent.primary} transition-colors`}
          >
            {tActions("viewAllArrow")}
            {hasMore && (
              <Span className="bg-blue-500 dark:bg-blue-400 text-white text-xs px-2 py-0.5 rounded-full">
                +{totalInCategory - faqs.length}
              </Span>
            )}
          </TextLink>
        </div>
      </div>
    </Section>
  );
}
