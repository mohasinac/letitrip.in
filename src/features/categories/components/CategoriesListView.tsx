"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container, Grid, Heading, Text, Button } from "@mohasinac/appkit/ui";
import { CategoriesListView as AppkitCategoriesListView } from "@mohasinac/appkit/features/categories";
import { EmptyState, Search } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";
import { CategoryGrid } from "./CategoryGrid";
import { useCategoriesList } from "@mohasinac/appkit/features/categories";

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
        <AppkitCategoriesListView
          items={displayed}
          total={total}
          isLoading={isLoading}
          labels={{
            title: t("title"),
            subtitle:
              total > 0
                ? t("subtitleWithCount", { count: total })
                : t("subtitle"),
          }}
          renderSearch={() => (
            <Search
              value={search}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
              onClear={() => table.set("q", "")}
            />
          )}
          renderCategories={(_items, loading) => (
            <>
              {loading ? (
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
              {user && selectedIds.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleBulkAddToWishlist}
                  >
                    {tActions("bulkAddToWishlist", {
                      count: selectedIds.length,
                    })}
                  </Button>
                </div>
              )}
            </>
          )}
        />
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
