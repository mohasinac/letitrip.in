"use client";

import { useCallback, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import {
  PRODUCT_SORT_VALUES,
  Search,
  Span,
  ViewToggle,
  BulkActionBar,
  Button,
} from "@/components";
import {
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
  EmptyState,
  SwitchFilter,
} from "@/components";
import type { ActiveFilter, ViewMode } from "@/components";
import { Heading, Text, Main } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, usePendingTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import { useSearch } from "@mohasinac/feat-search";
import type { CategoryDocument } from "@/db/schema";
import type { ProductSortValue } from "@/components";
import { SearchResultsSection } from "./SearchResultsSection";

const { themed, spacing, page } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

interface SearchViewProps {
  initialCategories?: CategoryDocument[];
}

export function SearchView({ initialCategories }: SearchViewProps = {}) {
  const t = useTranslations("search");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable({
    defaults: { sort: PRODUCT_SORT_VALUES.NEWEST, pageSize: String(PAGE_SIZE) },
  });

  const urlQ = table.get("q");
  const urlCategory = table.get("category");
  const urlMinPrice = table.get("minPrice");
  const urlMaxPrice = table.get("maxPrice");
  const urlCondition = table.get("condition");
  const urlIsAuction = table.get("isAuction");
  const urlIsPreOrder = table.get("isPreOrder");
  const urlInStock = table.get("inStock");
  const urlSort =
    (table.get("sort") as ProductSortValue) || PRODUCT_SORT_VALUES.NEWEST;
  const urlPage = table.getNumber("page", 1);
  const viewMode = (table.get("view") || "grid") as ViewMode;

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    if (urlCategory) params.set("category", urlCategory);
    if (urlMinPrice) params.set("minPrice", urlMinPrice);
    if (urlMaxPrice) params.set("maxPrice", urlMaxPrice);
    if (urlCondition) params.set("condition", urlCondition);
    if (urlIsAuction) params.set("isAuction", urlIsAuction);
    if (urlIsPreOrder) params.set("isPreOrder", urlIsPreOrder);
    if (urlInStock) params.set("inStock", urlInStock);
    params.set("sort", urlSort);
    params.set("page", String(urlPage));
    params.set("pageSize", String(PAGE_SIZE));
    return params.toString();
  }, [
    urlQ,
    urlCategory,
    urlMinPrice,
    urlMaxPrice,
    urlCondition,
    urlIsAuction,
    urlIsPreOrder,
    urlInStock,
    urlSort,
    urlPage,
  ]);

  const { categories, items, total, totalPages, isLoading } = useSearch(
    searchParams,
    { initialCategories },
  );

  const topCategories = useMemo(
    () => categories.filter((c) => c.tier === 1),
    [categories],
  );

  const categoryOptions = useMemo(
    () => topCategories.map((c) => ({ value: c.id, label: c.name })),
    [topCategories],
  );

  const conditionOptions = useMemo(
    () => [
      { value: "new", label: t("conditionNew") },
      { value: "used", label: t("conditionUsed") },
      { value: "refurbished", label: t("conditionRefurbished") },
    ],
    [t],
  );

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "category",
      "minPrice",
      "maxPrice",
      "condition",
      "isAuction",
      "isPreOrder",
      "inStock",
    ]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const result: ActiveFilter[] = [];
    if (urlCategory) {
      result.push({
        key: "category",
        label: t("categoryFilter"),
        value:
          topCategories.find((c) => c.id === urlCategory)?.name ?? urlCategory,
      });
    }
    if (urlMinPrice || urlMaxPrice) {
      result.push({
        key: "price",
        label: t("priceRange"),
        value:
          urlMinPrice && urlMaxPrice
            ? `₹${urlMinPrice}–₹${urlMaxPrice}`
            : urlMinPrice
              ? `from ₹${urlMinPrice}`
              : `up to ₹${urlMaxPrice}`,
      });
    }
    if (urlCondition) {
      result.push({
        key: "condition",
        label: t("conditionFilter"),
        value:
          conditionOptions.find((o) => o.value === urlCondition)?.label ??
          urlCondition,
      });
    }
    if (urlIsAuction === "true") {
      result.push({
        key: "isAuction",
        label: t("auctionFilter"),
        value: t("auctionOnly"),
      });
    }
    if (urlIsPreOrder === "true") {
      result.push({
        key: "isPreOrder",
        label: t("preOrderFilter"),
        value: t("preOrderOnly"),
      });
    }
    if (urlInStock === "true") {
      result.push({
        key: "inStock",
        label: t("inStockFilter"),
        value: t("inStockOnly"),
      });
    }
    return result;
  }, [
    urlCategory,
    urlMinPrice,
    urlMaxPrice,
    urlCondition,
    urlIsAuction,
    urlIsPreOrder,
    urlInStock,
    topCategories,
    conditionOptions,
    t,
  ]);

  const handleSortChange = (sort: string) => table.set("sort", sort);

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

  const hasAnyFilter = !!(
    urlQ ||
    urlCategory ||
    urlMinPrice ||
    urlMaxPrice ||
    urlCondition ||
    urlIsAuction ||
    urlIsPreOrder ||
    urlInStock
  );

  return (
    <Main className={`${page.container["2xl"]} py-10 ${spacing.stack}`}>
      <div>
        <Heading level={1}>{t("title")}</Heading>
        <Text variant="secondary" className="mt-1">
          {t("subtitle")}
        </Text>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("searchInputPlaceholder")}
          className="w-full h-12"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={filterActiveCount}
          onApply={onFilterApply}
          onReset={onFilterClear}
        >
          <FilterFacetSection
            title={t("categoryFilter")}
            options={categoryOptions}
            selected={
              pendingTable.get("category") ? [pendingTable.get("category")] : []
            }
            onChange={(vals) => pendingTable.set("category", vals[0] ?? "")}
            searchable={categoryOptions.length > 6}
          />
          <FilterFacetSection
            title={t("conditionFilter")}
            options={conditionOptions}
            selected={
              pendingTable.get("condition")
                ? [pendingTable.get("condition")]
                : []
            }
            onChange={(vals) => pendingTable.set("condition", vals[0] ?? "")}
          />
          <SwitchFilter
            title={t("auctionFilter")}
            label={t("auctionOnly")}
            checked={pendingTable.get("isAuction") === "true"}
            onChange={(v) => pendingTable.set("isAuction", v ? "true" : "")}
          />
          <SwitchFilter
            title={t("preOrderFilter")}
            label={t("preOrderOnly")}
            checked={pendingTable.get("isPreOrder") === "true"}
            onChange={(v) => pendingTable.set("isPreOrder", v ? "true" : "")}
          />
          <SwitchFilter
            title={t("inStockFilter")}
            label={t("inStockOnly")}
            checked={pendingTable.get("inStock") === "true"}
            onChange={(v) => pendingTable.set("inStock", v ? "true" : "")}
          />
        </FilterDrawer>
        <ViewToggle value={viewMode} onChange={(m) => table.set("view", m)} />
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={(key) => {
            if (key === "price") {
              table.setMany({ minPrice: "", maxPrice: "" });
            } else {
              table.set(key, "");
            }
          }}
          onClearAll={onFilterClear}
        />
      </div>

      {hasAnyFilter ? (
        <>
          {selectedIds.length > 0 && user && (
            <BulkActionBar
              selectedCount={selectedIds.length}
              onClearSelection={() => setSelectedIds([])}
              actions={[
                {
                  id: "bulk-wishlist",
                  label: tActions("bulkAddToWishlist", {
                    count: selectedIds.length,
                  }),
                  variant: "primary",
                  onClick: handleBulkAddToWishlist,
                },
              ]}
            />
          )}
          <SearchResultsSection
            products={items}
            total={total}
            totalPages={totalPages}
            urlQ={urlQ}
            urlSort={urlSort}
            urlPage={urlPage}
            isLoading={isLoading}
            variant={viewMode}
            selectable={!!user}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onSortChange={handleSortChange}
            onPageChange={table.setPage}
          />
        </>
      ) : (
        <EmptyState
          icon={<SearchIcon className="w-16 h-16" />}
          title={t("emptyQuery")}
          description={t("subtitle")}
        />
      )}
    </Main>
  );
}
