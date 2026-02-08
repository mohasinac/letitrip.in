"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
}

export function FAQSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const { data, isLoading } = useApiQuery<{ faqs: FAQ[] }>({
    queryKey: ["faqs", "homepage"],
    queryFn: () =>
      fetch(`${API_ENDPOINTS.FAQS.LIST}?featured=true&limit=6`).then((r) =>
        r.json(),
      ),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className={`${THEME_CONSTANTS.container.xl} mx-auto`}>
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

  const faqs = data?.faqs || [];

  if (faqs.length === 0) {
    return null;
  }

  const toggleFaq = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className={`${THEME_CONSTANTS.container.xl} mx-auto`}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            Frequently Asked Questions
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            Quick answers to common questions
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className={`${THEME_CONSTANTS.spacing.stack} max-w-3xl mx-auto`}>
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
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <button
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline`}
            onClick={() => (window.location.href = "/faqs")}
          >
            View All FAQs →
          </button>
        </div>
      </div>
    </section>
  );
}
