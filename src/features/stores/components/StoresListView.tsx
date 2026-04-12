"use client";

import { useCallback, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Container,
  Grid,
  Heading,
  Text,
  ViewToggle,
  ListingLayout,
  SortDropdown,
  TablePagination,
  Button,
} from "@mohasinac/appkit/ui";
import { StoresListView as AppkitStoresListView } from "@mohasinac/appkit/features/stores";
import { EmptyState, Search } from "@/components";
import type { ViewMode } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { StoreCard } from "@/components";
import { useStores } from "../hooks";
import { useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import type { StoreListItem } from "../types";

const PAGE_SIZE = 24;

interface StoresSieveResult {
  items: StoreListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface StoresListViewProps {
  initialData?: StoresSieveResult;
}

const STORE_SORT_OPTIONS_KEYS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
  { value: "storeName", key: "sortNameAZ" },
  { value: "-storeName", key: "sortNameZA" },
  { value: "-productCount", key: "sortMostProducts" },
] as const;

export function StoresListView({ initialData }: StoresListViewProps = {}) {
  const t = useTranslations("storesPage");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { query, table } = useStores({ initialData });

  const { data, isLoading, error } = query;
  const stores = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const sortParam = table.get("sorts") || "-createdAt";
  const viewMode = (table.get("view") || "grid") as ViewMode;

  const sortOptions = useMemo(
    () =>
      STORE_SORT_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
  );

  const handleClearFilters = useCallback(() => {
    table.clear(["q"]);
  }, [table]);

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
              value={table.get("q")}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
              onClear={() => table.set("q", "")}
            />
          }
          viewToggleSlot={
            <ViewToggle
              value={viewMode}
              onChange={(m) => table.set("view", m)}
            />
          }
          sortSlot={
            <SortDropdown
              value={sortParam}
              onChange={(v) => table.set("sorts", v)}
              options={sortOptions}
            />
          }
          toolbarPaginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={table.setPage}
                compact
              />
            ) : undefined
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
          {!isLoading && error ? (
            <EmptyState
              title={t("error.title")}
              description={t("error.description")}
            />
          ) : !isLoading && stores.length === 0 ? (
            <EmptyState
              icon={<Store className="w-16 h-16" />}
              title={table.get("q") ? t("emptySearch.title") : t("empty.title")}
              description={
                table.get("q")
                  ? t("emptySearch.description")
                  : t("empty.description")
              }
              actionLabel={table.get("q") ? tActions("clearAll") : undefined}
              onAction={table.get("q") ? handleClearFilters : undefined}
            />
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-4">
              {isLoading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700 h-24"
                    />
                  ))
                : stores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      selectable={!!user}
                      selected={selectedIds.includes(store.ownerId)}
                      onSelect={(id, sel) =>
                        setSelectedIds((prev) =>
                          sel ? [...prev, id] : prev.filter((x) => x !== id),
                        )
                      }
                    />
                  ))}
            </div>
          ) : (
            <>
              {isLoading ? (
                <Grid cols={4} gap="lg">
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700 aspect-[4/3]"
                    />
                  ))}
                </Grid>
              ) : (
                <AppkitStoresListView
                  stores={stores as any}
                  total={total}
                  currentPage={page}
                  totalPages={totalPages}
                  labels={{
                    products: t("products"),
                    reviews: t("reviews"),
                    sold: t("sold"),
                    empty: t("empty.description"),
                  }}
                  slots={{
                    renderCard: (store: StoreListItem) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        selectable={!!user}
                        selected={selectedIds.includes(store.ownerId)}
                        onSelect={(id, sel) =>
                          setSelectedIds((prev) =>
                            sel ? [...prev, id] : prev.filter((x) => x !== id),
                          )
                        }
                      />
                    ),
                  }}
                />
              )}
            </>
          )}
        </ListingLayout>
      </Container>
    </div>
  );
}
