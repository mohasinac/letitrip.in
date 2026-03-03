/**
 * Categories Listing Page
 *
 * Route: /categories
 * Displays all active top-level categories as a browse grid.
 */

"use client";

import { useMemo } from "react";
import {
  CategoryGrid,
  Spinner,
  Search,
  Main,
  Heading,
  Text,
} from "@/components";
import { THEME_CONSTANTS, UI_PLACEHOLDERS } from "@/constants";
import { useTranslations } from "next-intl";
import { useApiQuery, useUrlTable } from "@/hooks";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

const { themed, typography, spacing, flex, page } = THEME_CONSTANTS;

interface CategoriesApiResponse {
  data: CategoryDocument[];
  meta: { total: number };
}

export default function CategoriesPage() {
  const table = useUrlTable();
  const search = table.get("q");
  const t = useTranslations("categories");

  const { data, isLoading, error } = useApiQuery<CategoriesApiResponse>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
  });

  const allCategories = useMemo(() => data?.data ?? [], [data]);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [allCategories, search]);

  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className={`${flex.center} min-h-[60vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${flex.center} min-h-[60vh]`}>
        <Text size="sm" variant="secondary">
          {t("noCategories")}
        </Text>
      </div>
    );
  }

  return (
    <Main className={`${page.container["2xl"]} py-10 ${spacing.stack}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Heading level={1} className={typography.h2}>
            {t("title")}
          </Heading>
          <Text className="mt-1" variant="secondary">
            {t("subtitle")}
          </Text>
        </div>

        {/* Search */}
        <div className="sm:w-64">
          <Search
            value={search}
            onChange={(v) => table.set("q", v)}
            placeholder={UI_PLACEHOLDERS.SEARCH}
            onClear={() => table.set("q", "")}
          />
        </div>
      </div>

      {/* Total count */}
      {allCategories.length > 0 && (
        <Text size="sm" variant="secondary">
          {displayed.length !== allCategories.length
            ? t("filteredCategoriesCount", {
                shown: displayed.length,
                total: allCategories.length,
              })
            : t("allCategoriesCount", { count: allCategories.length })}
        </Text>
      )}

      {/* Grid */}
      <CategoryGrid categories={displayed} />
    </Main>
  );
}
