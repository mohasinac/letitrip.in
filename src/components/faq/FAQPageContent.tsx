"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  THEME_CONSTANTS,
  API_ENDPOINTS,
  UI_LABELS,
  ROUTES,
  FAQ_CATEGORIES,
} from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { useApiQuery } from "@/hooks";
import {
  FAQCategorySidebar,
  FAQSearchBar,
  FAQSortDropdown,
  FAQAccordion,
  ContactCTA,
} from "@/components/faq";
import type { FAQSortOption } from "@/components/faq";
import type { FAQDocument } from "@/db/schema";

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
  const [sortOption, setSortOption] = useState<FAQSortOption>("helpful");

  // Fetch all FAQs
  const { data: faqsData, isLoading } = useApiQuery<{
    success: boolean;
    data: FAQDocument[];
  }>({
    queryKey: [API_ENDPOINTS.FAQS.LIST],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.FAQS.LIST}?isActive=true`);
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
  });

  const allFAQs = faqsData?.data || [];

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<FAQCategoryKey, number> = {
      general: 0,
      products: 0,
      shipping: 0,
      returns: 0,
      payment: 0,
      account: 0,
      sellers: 0,
    };

    allFAQs.forEach((faq) => {
      if (faq.category && faq.category in counts) {
        counts[faq.category as FAQCategoryKey]++;
      }
    });

    return counts;
  }, [allFAQs]);

  // Filter and sort FAQs
  const filteredAndSortedFAQs = useMemo(() => {
    let filtered = allFAQs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((faq) => {
        const answerText = typeof faq.answer === "string" ? faq.answer : "";
        return (
          faq.question.toLowerCase().includes(query) ||
          answerText.toLowerCase().includes(query) ||
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
        return bRatio - aRatio;
      });
    } else if (sortOption === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortOption === "alphabetical") {
      sorted.sort((a, b) => a.question.localeCompare(b.question));
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
    <div
      className={`${THEME_CONSTANTS.container["2xl"]} mx-auto ${THEME_CONSTANTS.spacing.padding.xl} py-12`}
    >
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1
          className={`${THEME_CONSTANTS.typography.h1} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
        >
          {UI_LABELS.FAQ.TITLE}
        </h1>
        <p
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
        >
          {UI_LABELS.FAQ.SUBTITLE}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <FAQSearchBar
          onSearch={setSearchQuery}
          placeholder={UI_LABELS.FAQ.SEARCH_PLACEHOLDER}
        />
      </div>

      {/* Main Content Grid */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 ${THEME_CONSTANTS.spacing.gap.lg}`}
      >
        {/* Sidebar (30% on desktop) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <FAQCategorySidebar
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Main Content (70% on desktop) */}
        <div className="lg:col-span-8 xl:col-span-9">
          {/* Sort & Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p
              className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {filteredAndSortedFAQs.length}{" "}
              {filteredAndSortedFAQs.length === 1
                ? UI_LABELS.FAQ.QUESTION_SINGULAR
                : UI_LABELS.FAQ.QUESTION_PLURAL}
              {selectedCategory !== "all" &&
                ` ${UI_LABELS.FAQ.IN_CATEGORY} ${FAQ_CATEGORIES[selectedCategory].label}`}
            </p>
            <FAQSortDropdown
              selectedSort={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className={THEME_CONSTANTS.spacing.stack}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-24 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} animate-pulse`}
                />
              ))}
            </div>
          )}

          {/* FAQ Accordion */}
          {!isLoading && <FAQAccordion faqs={filteredAndSortedFAQs} />}

          {/* Contact CTA */}
          {!isLoading && filteredAndSortedFAQs.length > 0 && (
            <div className="mt-12">
              <ContactCTA />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
