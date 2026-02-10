"use client";

import { useState } from "react";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
} from "@/constants";
import { logger } from "@/classes";
import { apiClient } from "@/lib/api-client";

interface FAQHelpfulButtonsProps {
  faqId: string;
  initialHelpful: number;
  initialNotHelpful: number;
}

export function FAQHelpfulButtons({
  faqId,
  initialHelpful,
  initialNotHelpful,
}: FAQHelpfulButtonsProps) {
  const [helpful, setHelpful] = useState(initialHelpful);
  const [notHelpful, setNotHelpful] = useState(initialNotHelpful);
  const [userVote, setUserVote] = useState<"helpful" | "not-helpful" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    if (isSubmitting || userVote) return;

    setIsSubmitting(true);

    try {
      await apiClient.post(`${API_ENDPOINTS.FAQS.BASE}/${faqId}/vote`, {
        isHelpful,
      });

      // Update local state
      if (isHelpful) {
        setHelpful((prev) => prev + 1);
        setUserVote("helpful");
      } else {
        setNotHelpful((prev) => prev + 1);
        setUserVote("not-helpful");
      }
    } catch (error) {
      logger.error(ERROR_MESSAGES.FAQ.VOTE_FAILED, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.borderRadius.lg}`}
    >
      <p
        className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary} mb-3`}
      >
        {userVote
          ? "Thanks for your feedback!"
          : UI_LABELS.FAQ.WAS_THIS_HELPFUL}
      </p>

      <div className="flex gap-3">
        {/* Helpful Button */}
        <button
          onClick={() => handleVote(true)}
          disabled={isSubmitting || userVote !== null}
          className={`flex-1 flex items-center justify-center gap-2 ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} transition-all ${
            userVote === "helpful"
              ? "bg-green-600 text-white"
              : userVote
                ? `${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.textSecondary} cursor-not-allowed opacity-50`
                : `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} hover:bg-green-50 dark:hover:bg-green-900/20`
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span className={`${THEME_CONSTANTS.typography.body} text-sm`}>
            {UI_LABELS.ACTIONS.YES}
          </span>
          <span
            className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            ({helpful})
          </span>
        </button>

        {/* Not Helpful Button */}
        <button
          onClick={() => handleVote(false)}
          disabled={isSubmitting || userVote !== null}
          className={`flex-1 flex items-center justify-center gap-2 ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} transition-all ${
            userVote === "not-helpful"
              ? "bg-red-600 text-white"
              : userVote
                ? `${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.textSecondary} cursor-not-allowed opacity-50`
                : `${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} hover:bg-red-50 dark:hover:bg-red-900/20`
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            />
          </svg>
          <span className={`${THEME_CONSTANTS.typography.body} text-sm`}>
            {UI_LABELS.ACTIONS.NO}
          </span>
          <span
            className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            ({notHelpful})
          </span>
        </button>
      </div>
    </div>
  );
}
