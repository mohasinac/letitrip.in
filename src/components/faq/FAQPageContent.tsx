"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  ROUTES,
  FAQ_CATEGORIES,
  STATIC_FAQS,
  getStaticFaqCategoryCounts,
} from "@/constants";
import type { FAQCategoryKey, StaticFAQItem } from "@/constants";
import { useUrlTable } from "@/hooks";
import { Button, Heading, HorizontalScroller, Span, Text } from "@/components";
import { FAQCategorySidebar } from "./FAQCategorySidebar";
import { FAQSearchBar } from "./FAQSearchBar";
import { FAQSortDropdown } from "./FAQSortDropdown";
import { FAQAccordion } from "./FAQAccordion";
import { ContactCTA } from "./ContactCTA";
import type { FAQSortOption } from "./FAQSortDropdown";

const { flex } = THEME_CONSTANTS;

interface FAQPageContentProps {
  initialCategory?: FAQCategoryKey | "all";
}

export function FAQPageContent({
  initialCategory = "all",
}: FAQPageContentProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<
    FAQCategoryKey | "all"
  >(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const table = useUrlTable({ defaults: { sort: "helpful" } });
  const sortOption = (table.get("sort") || "helpful") as FAQSortOption;

  // Use static data — no API calls needed
  const allFAQs: StaticFAQItem[] = STATIC_FAQS;

  // Calculate category counts from static data
  const categoryCounts = useMemo(() => getStaticFaqCategoryCounts(), []);

  // Filter and sort FAQs
  const filteredAndSortedFAQs = useMemo(() => {
    let filtered = allFAQs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((faq) => {
        return (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    const sorted = [...filtered];
    if (sortOption === "helpful") {
      sorted.sort((a, b) => {
        const aRatio =
          (a.stats?.helpful || 0) /
          ((a.stats?.helpful || 0) + (a.stats?.notHelpful || 0) + 1);
        const bRatio =
          (b.stats?.helpful || 0) /
          ((b.stats?.helpful || 0) + (b.stats?.notHelpful || 0) + 1);
        return bRatio - aRatio || a.order - b.order;
      });
    } else if (sortOption === "alphabetical") {
      sorted.sort((a, b) => a.question.localeCompare(b.question));
    } else {
      // default: priority then order
      sorted.sort((a, b) => b.priority - a.priority || a.order - b.order);
    }

    return sorted;
  }, [allFAQs, selectedCategory, searchQuery, sortOption]);

  // Navigate to the category URL path on selection
  const handleCategorySelect = (category: FAQCategoryKey | "all") => {
    setSelectedCategory(category);
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
          {UI_LABELS.FAQ.TITLE}
        </Heading>
        <Text
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
        >
          {UI_LABELS.FAQ.SUBTITLE}
        </Text>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <FAQSearchBar
          onSearch={setSearchQuery}
          placeholder={UI_LABELS.FAQ.SEARCH_PLACEHOLDER}
        />
      </div>

      {/* Mobile category pill strip — hidden on large screens (sidebar takes over) */}
      <div className="lg:hidden mb-8">
        <HorizontalScroller
          items={[
            {
              key: "all" as const,
              label: "All FAQs",
              icon: "📚",
              count: categoryCounts
                ? Object.values(categoryCounts).reduce((s, c) => s + c, 0)
                : 0,
            },
            ...Object.entries(FAQ_CATEGORIES).map(([k, cat]) => ({
              key: k as FAQCategoryKey,
              label: cat.label,
              icon: cat.icon,
              count: categoryCounts[k as FAQCategoryKey] ?? 0,
            })),
          ]}
          renderItem={(pill) => {
            const isActive = selectedCategory === pill.key;
            return (
              <Button
                onClick={() =>
                  handleCategorySelect(pill.key as FAQCategoryKey | "all")
                }
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 border",
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : `${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.themed.border} hover:border-indigo-400`,
                ].join(" ")}
              >
                <Span>{pill.icon}</Span>
                <Span>{pill.label}</Span>
                <Span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {pill.count}
                </Span>
              </Button>
            );
          }}
          keyExtractor={(pill) => String(pill.key)}
          gap={8}
          autoScroll={false}
          showArrows={false}
          className="px-1"
        />
      </div>

      {/* Main Content Grid */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 ${THEME_CONSTANTS.spacing.gap.xl}`}
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
              {filteredAndSortedFAQs.length}{" "}
              {filteredAndSortedFAQs.length === 1
                ? UI_LABELS.FAQ.QUESTION_SINGULAR
                : UI_LABELS.FAQ.QUESTION_PLURAL}
              {selectedCategory !== "all" &&
                ` ${UI_LABELS.FAQ.IN_CATEGORY} ${FAQ_CATEGORIES[selectedCategory].label}`}
            </Text>
            <FAQSortDropdown
              selectedSort={sortOption}
              onSortChange={(sort) => table.setSort(sort)}
            />
          </div>

          {/* FAQ Accordion */}
          <FAQAccordion faqs={filteredAndSortedFAQs} />

          {/* Contact CTA */}
          {filteredAndSortedFAQs.length > 0 && (
            <div className="mt-12">
              <ContactCTA />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
