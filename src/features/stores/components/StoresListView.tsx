"use client";

import { useTranslations } from "next-intl";
import {
  EmptyState,
  Spinner,
  TablePagination,
  Input,
  Heading,
  Text,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useStores } from "../hooks";
import { StoreCard } from "./StoreCard";

const { spacing } = THEME_CONSTANTS;

export function StoresListView() {
  const t = useTranslations("storesPage");
  const { query, table } = useStores();

  const { data, isLoading, error } = query;

  const stores = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 24);
  const totalPages = Math.ceil(total / pageSize) || 1;

  const isSearching = !!table.get("q");

  return (
    <div className={`${spacing.stack} max-w-screen-2xl mx-auto w-full`}>
      {/* Page header */}
      <div>
        <Heading level={1}>{t("title")}</Heading>
        <Text variant="secondary" className="mt-1">
          {t("subtitle")}
        </Text>
      </div>

      {/* Search bar */}
      <div className="max-w-md">
        <Input
          type="text"
          value={table.get("q") ?? ""}
          onChange={(e) => table.set("q", e.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {/* Error */}
      {!!error && !isLoading && (
        <EmptyState
          title={t("error.title")}
          description={t("error.description")}
        />
      )}

      {/* Empty */}
      {!isLoading && !error && stores.length === 0 && (
        <EmptyState
          title={isSearching ? t("emptySearch.title") : t("empty.title")}
          description={
            isSearching ? t("emptySearch.description") : t("empty.description")
          }
        />
      )}

      {/* Grid */}
      {!isLoading && !error && stores.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {stores.map((store) => (
              <StoreCard key={store.uid} store={store} />
            ))}
          </div>

          <TablePagination
            total={total}
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={(p) => table.setPage(p)}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
            pageSizeOptions={[12, 24, 48]}
          />
        </>
      )}
    </div>
  );
}
