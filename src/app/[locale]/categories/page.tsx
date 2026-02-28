/**
 * Categories Listing Page
 *
 * Route: /categories
 * Displays all active top-level categories as a browse grid.
 */

"use client";

import { useMemo, useState } from "react";
import { CategoryGrid, Spinner, Input } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useApiQuery } from "@/hooks";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

const { themed, typography, spacing } = THEME_CONSTANTS;

interface CategoriesApiResponse {
  data: CategoryDocument[];
  meta: { total: number };
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className={`text-sm ${themed.textSecondary}`}>{t("noCategories")}</p>
      </div>
    );
  }

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {t("title")}
          </h1>
          <p className={`mt-1 ${themed.textSecondary}`}>{t("subtitle")}</p>
        </div>

        {/* Search */}
        <div className="sm:w-64">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Total count */}
      {allCategories.length > 0 && (
        <p className={`text-sm ${themed.textSecondary}`}>
          {displayed.length !== allCategories.length
            ? t("filteredCategoriesCount", {
                shown: displayed.length,
                total: allCategories.length,
              })
            : t("allCategoriesCount", { count: allCategories.length })}
        </p>
      )}

      {/* Grid */}
      <CategoryGrid categories={displayed} />
    </main>
  );
}
