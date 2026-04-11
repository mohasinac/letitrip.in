"use client";

import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";
import { formatNumber } from "@/utils";
import { FAQHelpfulButtons } from "./FAQHelpfulButtons";
import type { FAQDocument } from "@/db/schema";
import { FAQAccordion as AppkitFAQAccordion } from "@mohasinac/appkit/features/faq";

import { Span, Text, Button } from "@mohasinac/appkit/ui";

interface FAQAccordionProps {
  faqs: FAQDocument[];
  expandedByDefault?: boolean;
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const t = useTranslations("faq");
  const tActions = useTranslations("actions");
  const { showSuccess } = useMessage();

  if (faqs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800/60">
        <Text className="text-zinc-600 dark:text-zinc-300">
          {t("noResults")}
        </Text>
      </div>
    );
  }

  return (
    <AppkitFAQAccordion
      faqs={faqs as any}
      renderExpandedFooter={(faq) => (
        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-slate-700">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/faqs#${faq.id}`;
                navigator.clipboard.writeText(url);
                showSuccess(tActions("linkCopied"));
              }}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              {t("copyLink")}
            </Button>

            {faq.stats?.views ? (
              <Span className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("views", { count: formatNumber(faq.stats.views) })}
              </Span>
            ) : null}
          </div>

          <FAQHelpfulButtons
            faqId={faq.id}
            initialHelpful={faq.stats?.helpful || 0}
            initialNotHelpful={faq.stats?.notHelpful || 0}
          />
        </div>
      )}
      labels={{
        noResults: t("noResults"),
      }}
    />
  );
}
