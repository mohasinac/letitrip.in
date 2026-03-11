"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, getLocalizedFaqText } from "@/constants";
import { useMessage } from "@/hooks";
import { formatNumber } from "@/utils";
import { FAQHelpfulButtons } from "./FAQHelpfulButtons";
import type { StaticFAQItem } from "@/constants";
import { Button, Heading, Span, Text } from "@/components";

interface FAQAccordionProps {
  faqs: StaticFAQItem[];
  locale?: string;
  expandedByDefault?: boolean;
}

export function FAQAccordion({
  faqs,
  locale = "en",
  expandedByDefault = false,
}: FAQAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    expandedByDefault
      ? new Set(faqs.map((faq: StaticFAQItem) => faq.id))
      : new Set(),
  );
  const t = useTranslations("faq");
  const tActions = useTranslations("actions");
  const { showSuccess } = useMessage();
  const { flex } = THEME_CONSTANTS;

  const toggleFAQ = (faqId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const copyLink = (faqId: string) => {
    const url = `${window.location.origin}/faqs#${faqId}`;
    navigator.clipboard.writeText(url);
    showSuccess(tActions("linkCopied"));
  };

  if (faqs.length === 0) {
    return (
      <div
        className={`p-8 text-center ${THEME_CONSTANTS.themed.bgSecondary} rounded-xl`}
      >
        <Text
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
        >
          {t("noResults")}
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {faqs.map((faq) => {
        const isExpanded = expandedIds.has(faq.id);
        const { question, answer } = getLocalizedFaqText(faq, locale);

        return (
          <div
            key={faq.id}
            id={faq.id}
            className={`${THEME_CONSTANTS.themed.bgSecondary} rounded-xl ${THEME_CONSTANTS.themed.border} border overflow-hidden transition-all`}
          >
            {/* Question Header */}
            <Button
              variant="ghost"
              onClick={() => toggleFAQ(faq.id)}
              className={`w-full text-left p-6 ${flex.betweenStart} gap-4 ${THEME_CONSTANTS.themed.hover} transition-colors`}
            >
              <div className="flex-1">
                <Heading
                  level={3}
                  className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
                >
                  {question}
                </Heading>
                {faq.tags && faq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {faq.tags.map((tag) => (
                      <Span
                        key={tag}
                        className={`${THEME_CONSTANTS.typography.xs} p-3 rounded-md ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.themed.textSecondary}`}
                      >
                        {tag}
                      </Span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expand/Collapse Icon */}
              <svg
                className={`w-6 h-6 ${THEME_CONSTANTS.themed.textSecondary} flex-shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            {/* Answer Content */}
            {isExpanded && (
              <div className={`p-6 ${THEME_CONSTANTS.themed.border} border-t`}>
                {/* Answer Text */}
                <p
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} mb-6`}
                >
                  {answer}
                </p>

                {/* Actions Row */}
                <div className={`${flex.between} gap-4 mb-6`}>
                  {/* Share Link Button */}
                  <Button
                    variant="ghost"
                    onClick={() => copyLink(faq.id)}
                    className={`flex items-center gap-2 ${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.textPrimary} transition-colors`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <Span>{t("copyLink")}</Span>
                  </Button>

                  {/* View Count */}
                  {faq.stats?.views && (
                    <Span
                      className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
                    >
                      {t("views", { count: formatNumber(faq.stats.views) })}
                    </Span>
                  )}
                </div>

                {/* Helpful Buttons */}
                <FAQHelpfulButtons
                  faqId={faq.id}
                  initialHelpful={faq.stats?.helpful || 0}
                  initialNotHelpful={faq.stats?.notHelpful || 0}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
