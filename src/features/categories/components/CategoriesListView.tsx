"use client";

/**
 * CategoriesListView
 *
 * Public-facing categories listing page using unified ListingLayout.
 * Supports search and displays categories in a responsive grid.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useCallback, useMemo, useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Container,
  EmptyState,
  Grid,
  Heading,
  ListingLayout,
  Search,
  Text,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import type { CategoryItem } from "@mohasinac/feat-categories";
import { CategoryGrid } from "./CategoryGrid";
import { useCategoriesList } from "../hooks/useCategoriesList";

interface CategoriesListContentProps {
  initialData?: CategoryItem[];
}

function CategoriesListContent({ initialData }: CategoriesListContentProps) {
  const t = useTranslations("categories");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable();
  const search = table.get("q");

  const { categories: data, isLoading } = useCategoriesList({ initialData });

  const allCategories = useMemo(
    () => (data ?? []).filter((c) => !c.isBrand),
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

  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => addToWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <Container size="full" className="py-8">
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
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActionItems={
            user
              ? [
                  {
                    id: "bulk-wishlist",
                    label: tActions("bulkAddToWishlist", {
                      count: selectedIds.length,
                    }),
                    variant: "primary",
                    onClick: handleBulkAddToWishlist,
                  },
                ]
              : undefined
          }
        >
          {isLoading ? (
            <Grid cols={4} gap="lg">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700 aspect-[4/3]"
                />
              ))}
            </Grid>
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
              <CategoryGrid
                categories={displayed}
                selectable={!!user}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </>
          )}
        </ListingLayout>
      </Container>
    </div>
  );
}

interface CategoriesListViewProps {
  initialData?: CategoryItem[];
}

export function CategoriesListView({
  initialData,
}: CategoriesListViewProps = {}) {
  return (
    <Suspense>
      <CategoriesListContent initialData={initialData} />
    </Suspense>
  );
}
