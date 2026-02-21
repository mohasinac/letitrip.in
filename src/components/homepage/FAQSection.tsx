"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import {
  API_ENDPOINTS,
  THEME_CONSTANTS,
  ROUTES,
  UI_LABELS,
  FAQ_CATEGORIES,
} from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { apiClient } from "@/lib/api-client";
import type { FAQDocument } from "@/db/schema";

export function FAQSection() {
  const [activeCategory, setActiveCategory] =
    useState<FAQCategoryKey>("general");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const { data, isLoading } = useApiQuery<FAQDocument[]>({
    queryKey: ["faqs", "homepage", activeCategory],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.FAQS.LIST}?category=${activeCategory}&limit=6`,
      ),
  });

  const handleCategoryChange = (cat: FAQCategoryKey) => {
    setActiveCategory(cat);
    setOpenFaqId(null);
  };

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className="w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 max-w-xs mx-auto animate-pulse" />
          <div className={THEME_CONSTANTS.spacing.stack}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const faqs = data || [];

  const toggleFaq = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {UI_LABELS.FAQ.TITLE}
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {UI_LABELS.FAQ.SUBTITLE}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(
            Object.entries(FAQ_CATEGORIES) as [
              FAQCategoryKey,
              (typeof FAQ_CATEGORIES)[FAQCategoryKey],
            ][]
          ).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === key
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={`${THEME_CONSTANTS.spacing.stack} max-w-3xl mx-auto`}>
          {faqs.length === 0 && (
            <p
              className={`text-center py-8 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {UI_LABELS.EMPTY.NO_DATA}
            </p>
          )}
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden transition-all`}
            >
              {/* Question Button */}
              <button
                className={`w-full text-left ${THEME_CONSTANTS.spacing.padding.lg} flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                onClick={() => toggleFaq(faq.id)}
              >
                <span
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium flex-1`}
                >
                  {faq.question}
                </span>
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
              </button>

              {/* Answer (Collapsible) */}
              {openFaqId === faq.id && (
                <div className={`${THEME_CONSTANTS.spacing.padding.lg} pt-0`}>
                  <div
                    className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.borderRadius.md} ${THEME_CONSTANTS.themed.bgTertiary} p-4`}
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof faq.answer === "string"
                          ? faq.answer
                          : faq.answer?.text || "",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            href={ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)}
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline`}
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
        </div>
      </div>
    </section>
  );
}
