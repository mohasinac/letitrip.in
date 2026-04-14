"use client";

import { useTranslations } from "next-intl";
import { ERROR_MESSAGES } from "@/constants";
import { logger } from "@mohasinac/appkit/core";
import { useFaqVote, useMessage } from "@/hooks";
import { FAQHelpfulButtons as AppkitFAQHelpfulButtons } from "@mohasinac/appkit/features/faq";

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
  const t = useTranslations("faq");
  const tActions = useTranslations("actions");

  const mutation = useFaqVote();
  const { showError } = useMessage();

  return (
    <AppkitFAQHelpfulButtons
      faqId={faqId}
      initialHelpful={initialHelpful}
      initialNotHelpful={initialNotHelpful}
      onVote={async (input) => {
        await mutation.mutateAsync({
          faqId: input.faqId,
          vote: input.vote === "not-helpful" ? "not_helpful" : input.vote,
        });
      }}
      labels={{
        yes: tActions("yes"),
        no: tActions("no"),
        wasThisHelpful: t("wasThisHelpful"),
        thanksForFeedback: t("thanksForFeedback"),
        voteFailed: ERROR_MESSAGES.FAQ.VOTE_FAILED,
      }}
      onVoteError={(message, error) => {
        logger.error(message, error);
        showError(message);
      }}
    />
  );
}
