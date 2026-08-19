"use client";

import { useTranslations } from "next-intl";
import { FAQPageContent, ROUTES, useUrlTable } from "@mohasinac/appkit";
import type { FAQCategory, FAQCategoryItem, FAQSortOption } from "@mohasinac/appkit";
import { FilterChipGroup } from "@mohasinac/appkit/ui";
import { useRouter } from "@/i18n/navigation";

export interface FAQPageClientProps {
  initialCategory?: FAQCategory | "all";
  categories: FAQCategoryItem[];
  contact: { email: string; phone: string };
}

export function FAQPageClient({ initialCategory = "all", categories, contact }: FAQPageClientProps) {
  const t = useTranslations("faq");
  const router = useRouter();
  const table = useUrlTable({});
  const search = table.get("q") ?? "";
  const sortOption = (table.get("sort") || "helpful") as FAQSortOption;

  const navigateToCategory = (category: FAQCategory | "all") => {
    router.push(
      category === "all" ? String(ROUTES.PUBLIC.FAQS) : String(ROUTES.PUBLIC.FAQ_CATEGORY(category)),
    );
  };

  return (
    <FAQPageContent
      initialCategory={initialCategory}
      categories={categories}
      routeHelpers={{
        allFaqsHref: String(ROUTES.PUBLIC.FAQS),
        faqCategoryHref: (category) => String(ROUTES.PUBLIC.FAQ_CATEGORY(category)),
        contactHref: String(ROUTES.PUBLIC.CONTACT),
        navigateToCategory,
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
        inCategory: (categoryLabel) => t("inCategory", { category: categoryLabel }),
        loading: t("loading"),
        contactTitle: t("contact.title"),
        contactDescription: t("contact.description"),
        contactEmailUs: t("contact.emailUs"),
        contactCallUs: t("contact.callUs"),
        contactForm: t("contact.contactForm"),
        contactSubmitRequest: t("contact.submitRequest"),
        contactTeam: t("contact.contactTeam"),
      }}
      contact={contact}
      searchValue={search}
      onSearchChange={(value) => table.set("q", value)}
      sortOption={sortOption}
      onSortChange={(sort) => table.set("sort", sort)}
      pageSize={100}
      renderMobileCategoryTabs={({ selectedCategory, onSelect }) => (
        <FilterChipGroup
          label={t("categories")}
          tabs={[
            { id: "all", label: t("allFaqs") },
            ...categories.map((c) => ({ id: c.key, label: c.label })),
          ]}
          value={selectedCategory}
          onChange={(id) => onSelect(id as FAQCategory | "all")}
          allId="all"
        />
      )}
    />
  );
}
