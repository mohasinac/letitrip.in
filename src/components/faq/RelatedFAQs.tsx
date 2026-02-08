"use client";

import { THEME_CONSTANTS } from "@/constants/theme";
import Link from "next/link";
import type { FAQDocument } from "@/db/schema/faqs";

interface RelatedFAQsProps {
  relatedFAQs: FAQDocument[];
}

export function RelatedFAQs({ relatedFAQs }: RelatedFAQsProps) {
  if (!relatedFAQs || relatedFAQs.length === 0) {
    return null;
  }

  return (
    <div
      className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.borderRadius.xl}`}
    >
      <h3
        className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
      >
        Related Questions
      </h3>

      <div className="space-y-3">
        {relatedFAQs.map((faq) => (
          <Link
            key={faq.id}
            href={`/faqs#${faq.id}`}
            className={`block ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} ${THEME_CONSTANTS.themed.bgPrimary} hover:${THEME_CONSTANTS.themed.bgSecondary} transition-colors group`}
          >
            <div className="flex items-start gap-3">
              {/* Question Icon */}
              <svg
                className={`w-5 h-5 ${THEME_CONSTANTS.themed.textSecondary} flex-shrink-0 mt-0.5`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              {/* Question Text */}
              <p
                className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textPrimary} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
              >
                {faq.question}
              </p>

              {/* Arrow Icon */}
              <svg
                className={`w-4 h-4 ${THEME_CONSTANTS.themed.textSecondary} flex-shrink-0 mt-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
