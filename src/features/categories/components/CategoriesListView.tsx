"use client";

/**
 * CategoriesListView
 *
 * Public-facing categories listing page using unified ListingLayout.
 * Supports search and displays categories in a responsive grid.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useMemo } from "react";
import { Grid3X3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState, Heading, ListingLayout, Search, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useApiQuery, useUrlTable } from "@/hooks";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";
import { CategoryGrid } from "./CategoryGrid";

interface CategoriesApiResponse {
  data: CategoryDocument[];
  meta: { total: number };
}

function CategoriesListContent() {
  const t = useTranslations("categories");
  const tActions = useTranslations("actions");
  const table = useUrlTable();
  const search = table.get("q");

  const { data, isLoading } = useApiQuery<CategoriesApiResponse>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
  });

  const allCategories = useMemo(
    () => (data?.data ?? []).filter((c) => !c.isBrand),
    [data],
  );
  const total = allCategories.length;

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [allCategories, search]);

  const hasSearch = Boolean(search);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <div className={`${THEME_CONSTANTS.page.container.full} py-8`}>
        <ListingLayout
          headerSlot={
            <div>
              <Heading level={1}>{t("title")}</Heading>
              <Text variant="secondary" className="mt-1">
                {total > 0
                  ? t("subtitleWithCount", { count: total })
                  : t("subtitle")}
              </Text>
            </div>
          }
          searchSlot={
            <Search
              value={search}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
              onClear={() => table.set("q", "")}
            />
          }
        >
          {isLoading ? (
            <div className={THEME_CONSTANTS.grid.cols4}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 aspect-[4/3]"
                />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState
              icon={<Grid3X3 className="w-16 h-16" />}
              title={t("noCategories")}
              description={t("noCategoriesSubtitle")}
              actionLabel={hasSearch ? tActions("clearAll") : undefined}
              onAction={hasSearch ? () => table.set("q", "") : undefined}
            />
          ) : (
            <>
              {hasSearch && displayed.length !== total && (
                <Text size="sm" variant="secondary" className="mb-4">
                  {t("filteredCategoriesCount", {
                    shown: displayed.length,
                    total,
                  })}
                </Text>
              )}
              <CategoryGrid categories={displayed} />
            </>
          )}
        </ListingLayout>
      </div>
    </div>
  );
}

export function CategoriesListView() {
  return (
    <Suspense>
      <CategoriesListContent />
    </Suspense>
  );
}
