"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES, FAQ_CATEGORIES } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { useUrlTable } from "@/hooks";
import { Heading, Search, SectionTabs, Text } from "@/components";
import type { SectionTab } from "@/components";
import { FAQCategorySidebar } from "./FAQCategorySidebar";
import { FAQSortDropdown } from "./FAQSortDropdown";
import { FAQAccordion } from "./FAQAccordion";
import { ContactCTA } from "./ContactCTA";
import type { FAQSortOption } from "./FAQSortDropdown";
import { useFaqList } from "../hooks";

const { flex } = THEME_CONSTANTS;

interface FAQPageContentProps {
  initialCategory?: FAQCategoryKey | "all";
}

export function FAQPageContent({
  initialCategory = "all",
}: FAQPageContentProps) {
  const t = useTranslations("faq");
  const tLoading = useTranslations("loading");
  const router = useRouter();

  // Derive directly from the URL-sourced prop — no local state.
  // handleCategorySelect calls router.push, which updates the URL and causes
  // the page to re-render with the new initialCategory prop.
  const selectedCategory = initialCategory;
  const table = useUrlTable({ defaults: { sort: "helpful", q: "" } });
  const sortOption = (table.get("sort") || "helpful") as FAQSortOption;
  const searchQuery = table.get("q") || "";

  const sorts =
    sortOption === "helpful"
      ? "-stats.helpful,-priority,order"
      : sortOption === "alphabetical"
        ? "question"
        : "-createdAt";

  const { faqs, total, isLoading } = useFaqList({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
    sorts,
    page: 1,
    pageSize: 100,
  });

  const { faqs: allMatchingFaqs } = useFaqList({
    search: searchQuery.trim() || undefined,
    sorts: "-priority,order",
    page: 1,
    pageSize: 200,
  });

  const categoryCounts: Record<FAQCategoryKey, number> = {
    general: 0,
    orders_payment: 0,
    shipping_delivery: 0,
    returns_refunds: 0,
    product_information: 0,
    account_security: 0,
    technical_support: 0,
  };
  allMatchingFaqs.forEach((faq) => {
    if (faq.category in categoryCounts) {
      categoryCounts[faq.category as FAQCategoryKey] += 1;
    }
  });

  // Navigate to the category URL path on selection
  const handleCategorySelect = (category: FAQCategoryKey | "all") => {
    if (category === "all") {
      router.push(ROUTES.PUBLIC.FAQS);
    } else {
      router.push(ROUTES.PUBLIC.FAQ_CATEGORY(category));
    }
  };

  return (
    <div className="py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <Heading
          level={1}
          className={`${THEME_CONSTANTS.typography.h1} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
        >
          {t("title")}
        </Heading>
        <Text
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
        >
          {t("subtitle")}
        </Text>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <Search
          value={searchQuery}
          onChange={(v) => table.set("q", v)}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {/* Mobile category pill strip — hidden on large screens (sidebar takes over) */}
      <div className="lg:hidden mb-8">
        <SectionTabs
          inline
          value={selectedCategory}
          onChange={(v) => handleCategorySelect(v as FAQCategoryKey | "all")}
          tabs={
            [
              {
                value: "all",
                label: t("allFaqs"),
                icon: "📚",
                count: total,
              },
              ...Object.entries(FAQ_CATEGORIES).map(([k, cat]) => ({
                value: k,
                label: t(`category.${k}`),
                icon: cat.icon,
                count: categoryCounts[k as FAQCategoryKey] ?? 0,
              })),
            ] satisfies SectionTab[]
          }
        />
      </div>

      {/* Main Content Grid */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-8`}
      >
        {/* Sidebar (desktop only — 30% width) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <FAQCategorySidebar
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Main Content (full width on mobile, 70% on desktop) */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9">
          {/* Sort & Results Count */}
          <div className={`${flex.between} mb-8`}>
            <Text
              className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {t("resultCount", { count: total })}
              {selectedCategory !== "all" &&
                ` ${t("inCategory", { category: t(`category.${selectedCategory}`) })}`}
            </Text>
            <FAQSortDropdown
              selectedSort={sortOption}
              onSortChange={(sort) => table.setSort(sort)}
            />
          </div>

          {/* FAQ Accordion */}
          {isLoading ? (
            <Text className={THEME_CONSTANTS.themed.textSecondary}>
              {tLoading("default")}
            </Text>
          ) : (
            <FAQAccordion faqs={faqs} />
          )}

          {/* Contact CTA */}
          {faqs.length > 0 && (
            <div className="mt-12">
              <ContactCTA />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
