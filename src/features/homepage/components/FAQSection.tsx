"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  THEME_CONSTANTS,
  ROUTES,
  FAQ_CATEGORIES,
  getStaticFaqsByCategory,
  getStaticFaqCategoryCounts,
} from "@/constants";
import type { FAQCategoryKey, StaticFAQItem } from "@/constants";
import { Button, Heading, Section, Span, Text, TextLink } from "@/components";

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
    <Section className={`p-8 ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header — gradient heading */}
        <div className="text-center mb-8">
          <Heading
            level={2}
            variant="none"
            className="bg-gradient-to-r from-primary to-cobalt bg-clip-text text-transparent text-3xl md:text-4xl font-bold mb-3"
          >
            {t("title")}
          </Heading>
          <Text
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {t("subtitle")}
          </Text>
        </div>

        {/* Category Tabs — horizontal scroll, underline indicator */}
        <div
          role="tablist"
          aria-label={t("title")}
          className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-zinc-200 dark:border-slate-700 mb-8 -mx-8 px-8"
        >
          {(
            Object.entries(FAQ_CATEGORIES) as [
              FAQCategoryKey,
              (typeof FAQ_CATEGORIES)[FAQCategoryKey],
            ][]
          ).map(([key, category]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeCategory === key}
              onClick={() => handleCategoryChange(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-200 ${
                activeCategory === key
                  ? "border-primary-700 dark:border-primary text-primary-700 dark:text-primary"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-slate-600"
              }`}
            >
              <Span className="mr-1">{category.icon}</Span>
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={`${THEME_CONSTANTS.spacing.stack} max-w-5xl mx-auto`}>
          {faqs.length === 0 && (
            <Text
              className={`text-center py-8 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {tEmpty("noData")}
            </Text>
          )}
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`${THEME_CONSTANTS.themed.bgPrimary} rounded-2xl overflow-hidden transition-all border-l-4 ${
                  isOpen
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-transparent"
                }`}
              >
                {/* Question Button */}
                <Button
                  variant="ghost"
                  className={`w-full text-left p-6 ${flex.between} gap-4 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors`}
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <Span
                    className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium flex-1`}
                  >
                    {faq.question}
                  </Span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 ${THEME_CONSTANTS.themed.textSecondary} transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Answer — max-h CSS animated expand */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0">
                    <p
                      className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} rounded-md ${THEME_CONSTANTS.themed.bgTertiary} p-4`}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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
