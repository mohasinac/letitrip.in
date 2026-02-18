"use client";

import { useState } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { useMessage } from "@/hooks";
import { FAQHelpfulButtons } from "./FAQHelpfulButtons";
import type { FAQDocument } from "@/db/schema";

interface FAQAccordionProps {
  faqs: FAQDocument[];
  expandedByDefault?: boolean;
}

export function FAQAccordion({
  faqs,
  expandedByDefault = false,
}: FAQAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    expandedByDefault ? new Set(faqs.map((faq) => faq.id)) : new Set(),
  );
  const { showSuccess } = useMessage();

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
    showSuccess(UI_LABELS.ACTIONS.LINK_COPIED);
  };

  if (faqs.length === 0) {
    return (
      <div
        className={`${THEME_CONSTANTS.spacing.padding.xl} p-8 text-center ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl}`}
      >
        <p
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
        >
          No FAQs found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      {faqs.map((faq) => {
        const isExpanded = expandedIds.has(faq.id);

        return (
          <div
            key={faq.id}
            id={faq.id}
            className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.themed.border} border overflow-hidden transition-all`}
          >
            {/* Question Header */}
            <button
              onClick={() => toggleFAQ(faq.id)}
              className={`w-full text-left ${THEME_CONSTANTS.spacing.padding.lg} flex items-start justify-between gap-4 hover:${THEME_CONSTANTS.themed.bgTertiary} transition-colors`}
            >
              <div className="flex-1">
                <h3
                  className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  {faq.question}
                </h3>
                {faq.tags && faq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {faq.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.spacing.padding.sm} ${THEME_CONSTANTS.borderRadius.md} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.themed.textSecondary}`}
                      >
                        {tag}
                      </span>
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
            </button>

            {/* Answer Content */}
            {isExpanded && (
              <div
                className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.border} border-t`}
              >
                {/* Answer Text */}
                <div
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} mb-6 prose dark:prose-invert max-w-none`}
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof faq.answer === "string"
                        ? faq.answer
                        : faq.answer?.text || "",
                  }}
                />

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  {/* Share Link Button */}
                  <button
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
                    <span>Copy link</span>
                  </button>

                  {/* View Count */}
                  {faq.stats?.views && (
                    <span
                      className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
                    >
                      {faq.stats.views.toLocaleString()} views
                    </span>
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
