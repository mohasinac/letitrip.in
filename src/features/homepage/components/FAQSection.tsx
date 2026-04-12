"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ROUTES, FAQ_CATEGORIES } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import { useFaqList } from "@mohasinac/appkit/features/faq";
import { FAQSection as AppkitFAQSection } from "@mohasinac/appkit/features/homepage";
import type { FAQItem, FAQTab } from "@mohasinac/appkit/features/homepage";

export function FAQSection() {
  const t = useTranslations("faq");
  const [activeCategory, setActiveCategory] =
    useState<FAQCategoryKey>("general");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const { faqs, total } = useFaqList({
    category: activeCategory,
    showOnHomepage: true,
    sorts: "-priority,order",
    page: 1,
    pageSize: 10,
  });

  const hasMore = total > faqs.length;
  const tabs: FAQTab[] = (
    Object.entries(FAQ_CATEGORIES) as [
      FAQCategoryKey,
      (typeof FAQ_CATEGORIES)[FAQCategoryKey],
    ][]
  ).map(([key, cat]) => ({
    value: key,
    label: cat.label,
    icon: cat.icon,
  }));

  const items: FAQItem[] = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: typeof faq.answer === "string" ? faq.answer : faq.answer.text,
  }));

  return (
    <AppkitFAQSection
      title={t("title")}
      subtitle={t("subtitle")}
      tabs={tabs}
      activeTab={activeCategory}
      onTabChange={(v) => {
        setActiveCategory(v as FAQCategoryKey);
        setOpenFaqId(null);
      }}
      items={items}
      viewMoreHref={ROUTES.PUBLIC.FAQS}
      viewMoreLabel={t("viewAllFaqs")}
      hasMore={hasMore}
      moreCount={total - faqs.length}
      renderTabs={() => (
        <SectionTabs
          inline
          value={activeCategory}
          onChange={(v) => {
            setActiveCategory(v as FAQCategoryKey);
            setOpenFaqId(null);
          }}
          tabs={tabs as SectionTab[]}
          className="border-b border-zinc-200 dark:border-slate-700"
        />
      )}
    />
  );
}
