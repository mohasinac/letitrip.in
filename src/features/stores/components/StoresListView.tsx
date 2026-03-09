"use client";

import { useCallback, useMemo } from "react";
import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  EmptyState,
  Heading,
  ListingLayout,
  Search,
  SortDropdown,
  TablePagination,
  Text,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { StoreCard } from "@/components";
import { useStores } from "../hooks";
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
  const { query, table } = useStores({ initialData });

  const { data, isLoading, error } = query;
  const stores = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const sortParam = table.get("sorts") || "-createdAt";

  const sortOptions = useMemo(
    () =>
      STORE_SORT_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
  );

  const handleClearFilters = useCallback(() => {
    table.clear(["q"]);
  }, [table]);

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
              value={table.get("q")}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
              onClear={() => table.set("q", "")}
            />
          }
          sortSlot={
            <SortDropdown
              value={sortParam}
              onChange={(v) => table.set("sorts", v)}
              options={sortOptions}
            />
          }
          paginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={table.setPage}
                onPageSizeChange={(n) => table.set("pageSize", String(n))}
                pageSizeOptions={[12, 24, 48]}
              />
            ) : undefined
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
          ) : (
            <div className={THEME_CONSTANTS.grid.cols4}>
              {isLoading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700 aspect-[4/3]"
                    />
                  ))
                : stores.map((store) => (
                    <StoreCard key={store.uid} store={store} />
                  ))}
            </div>
          )}
        </ListingLayout>
      </div>
    </div>
  );
}
