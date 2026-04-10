"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, FAQ_CATEGORIES, SITE_CONFIG } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { useUrlTable } from "@/hooks";
import { Search, SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import {
  FAQPageContent as AppkitFAQPageContent,
  type FAQSortOption,
  type FAQCategoryItem,
} from "@mohasinac/appkit/features/faq";
import { FAQAccordion } from "./FAQAccordion";

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

export function FAQPageContent({
  initialCategory = "all",
}: FAQPageContentProps) {
  const t = useTranslations("faq");
  const tLoading = useTranslations("loading");
  const router = useRouter();
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
        sortLabel: t("sort"),
        sortHelpful: t("sortHelpful"),
        sortNewest: t("sortNewest"),
        sortAlphabetical: t("sortAlphabetical"),
        resultCount: (count) => t("resultCount", { count }),
        inCategory: (label) => t("inCategory", { category: label }),
        loading: tLoading("default"),
        contactTitle: t("contactTitle"),
        contactDescription: t("contactDescription"),
        contactEmailUs: t("contactEmailUs"),
        contactCallUs: t("contactCallUs"),
        contactForm: t("contactForm"),
        contactSubmitRequest: t("submitRequest"),
        contactTeam: t("contactTeam"),
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
        <SectionTabs
          inline
          value={selectedCategory}
          onChange={(v) => onSelect(v as FAQCategoryKey | "all")}
          tabs={
            [
              {
                value: "all",
                label: t("allFaqs"),
                icon: "📚",
                count: total,
              },
              ...CATEGORIES.map((cat) => ({
                value: cat.key,
                label: t(`category.${cat.key}`),
                icon: cat.icon,
                count: categoryCounts[cat.key as FAQCategoryKey] ?? 0,
              })),
            ] satisfies SectionTab[]
          }
        />
      )}
      renderAccordion={(faqs) => <FAQAccordion faqs={faqs as any} />}
    />
  );
}
