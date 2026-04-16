"use client";
import { Suspense } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, FAQ_CATEGORIES, SITE_CONFIG } from "@/constants";
import type { FAQCategoryKey } from "@/constants/faq";
import { useUrlTable } from "@/hooks";
import { useMessage } from "@/hooks";
import { formatNumber } from "@mohasinac/appkit/utils";


import {
  FAQPageContent as AppkitFAQPageContent,
  FAQAccordion,
  type FAQSortOption,
  type FAQCategoryItem,
} from "@mohasinac/appkit/features/faq";
import { Button, Div, Row, Span, TabStrip } from "@mohasinac/appkit/ui";
import { FAQHelpfulButtons } from "./FAQHelpfulButtons";

const CATEGORIES: FAQCategoryItem[] = Object.entries(FAQ_CATEGORIES).map(
  ([k, cat]) => ({
    key: k as FAQCategoryKey,
    label: cat.label,
    icon: cat.icon,
    description: cat.description,
  }),
);

interface FAQPageContentProps {
  initialCategory?: FAQCategoryKey | "all";
}

function FAQPageInner({ initialCategory = "all" }: FAQPageContentProps) {
  const t = useTranslations("faq");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const router = useRouter();
  const { showSuccess } = useMessage();
  const table = useUrlTable({ defaults: { sort: "helpful", q: "" } });
  const sortOption = (table.get("sort") || "helpful") as FAQSortOption;
  const searchQuery = table.get("q") || "";

  const handleCategorySelect = (category: FAQCategoryKey | "all") => {
    if (category === "all") {
      router.push(ROUTES.PUBLIC.FAQS);
    } else {
      router.push(ROUTES.PUBLIC.FAQ_CATEGORY(category));
    }
  };

  return (
    <AppkitFAQPageContent
      initialCategory={initialCategory}
      categories={CATEGORIES}
      routeHelpers={{
        allFaqsHref: ROUTES.PUBLIC.FAQS,
        faqCategoryHref: (cat) => ROUTES.PUBLIC.FAQ_CATEGORY(cat),
        contactHref: ROUTES.PUBLIC.CONTACT,
        navigateToCategory: handleCategorySelect,
      }}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        searchPlaceholder: t("searchPlaceholder"),
        categoriesTitle: t("categories"),
        allFaqs: t("allFaqs"),
        stillHaveQuestions: t("stillHaveQuestions"),
        contactSupport: t("contactSupport"),
        sortLabel: t("sort.label"),
        sortHelpful: t("sort.helpful"),
        sortNewest: t("sort.newest"),
        sortAlphabetical: t("sort.alphabetical"),
        resultCount: (count) => t("resultCount", { count }),
        inCategory: (label) => t("inCategory", { category: label }),
        loading: tLoading("default"),
        contactTitle: t("contact.title"),
        contactDescription: t("contact.description"),
        contactEmailUs: t("contact.emailUs"),
        contactCallUs: t("contact.callUs"),
        contactForm: t("contact.contactForm"),
        contactSubmitRequest: t("contact.submitRequest"),
        contactTeam: t("contact.contactTeam"),
      }}
      contact={{
        email: SITE_CONFIG.contact.email,
        phone: SITE_CONFIG.contact.phone,
      }}
      searchValue={searchQuery}
      onSearchChange={(v) => table.set("q", v)}
      sortOption={sortOption}
      onSortChange={(sort) => table.setSort(sort)}
      renderMobileCategoryTabs={({
        selectedCategory,
        total,
        categoryCounts,
        onSelect,
      }) => (
        <TabStrip
          activeKey={selectedCategory}
          onChange={(v) => onSelect(v as FAQCategoryKey | "all")}
          tabs={[
            { key: "all", label: t("allFaqs"), badge: total },
            ...CATEGORIES.map((cat) => ({
              key: cat.key,
              label: `${cat.icon ? `${cat.icon} ` : ""}${t(`category.${cat.key}`)}`,
              badge: categoryCounts[cat.key as FAQCategoryKey] ?? 0,
            })),
          ]}
        />
      )}
      renderAccordion={(faqs) => (
        <FAQAccordion
          faqs={faqs as any}
          renderExpandedFooter={(faq) => (
            <Div className="mt-6 border-t border-zinc-200 pt-6 dark:border-slate-700">
              <Row className="mb-6 items-center justify-between gap-4">
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
              </Row>

              <FAQHelpfulButtons
                faqId={faq.id}
                initialHelpful={faq.stats?.helpful || 0}
                initialNotHelpful={faq.stats?.notHelpful || 0}
              />
            </Div>
          )}
          labels={{
            noResults: t("noResults"),
          }}
        />
      )}
    />
  );
}

export function FAQPageContent(props: FAQPageContentProps) {
  return (
    <Suspense>
      <FAQPageInner {...props} />
    </Suspense>
  );
}

