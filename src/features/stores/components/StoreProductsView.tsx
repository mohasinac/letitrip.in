"use client";

import {
  ViewToggle,
  Button,
  SortDropdown,
  Spinner,
  TablePagination,
  Tooltip,
  ActiveFilterChips,
  Row,
} from "@mohasinac/appkit/ui";

import { useCallback, useMemo, useState, Suspense } from "react";
import { PackageSearch, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { StoreProductsView as AppkitStoreProductsView } from "@mohasinac/appkit/features/stores";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import {
  EmptyState,
  ProductFilters,
  ProductGrid,
  PRODUCT_SORT_VALUES,
  Search,
} from "@/components";
import type { ViewMode, ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { addToWishlistAction, addToCartAction } from "@/actions";
import { useStoreProducts } from "../hooks";

const { flex } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

interface StoreProductsViewProps {
  storeSlug: string;
}

function StoreProductsContent({ storeSlug }: StoreProductsViewProps) {
  const t = useTranslations("storePage");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });

  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const viewMode = (table.get("view") || "card") as ViewMode;
  const categoryParam = table.get("category");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const pageParam = table.getNumber("page", 1);

  const sortOptions = useMemo(
    () => [
      { value: PRODUCT_SORT_VALUES.NEWEST, label: tProducts("sortNewest") },
      { value: PRODUCT_SORT_VALUES.OLDEST, label: tProducts("sortOldest") },
      {
        value: PRODUCT_SORT_VALUES.PRICE_LOW,
        label: tProducts("sortPriceLow"),
      },
      {
        value: PRODUCT_SORT_VALUES.PRICE_HIGH,
        label: tProducts("sortPriceHigh"),
      },
      { value: PRODUCT_SORT_VALUES.NAME_AZ, label: tProducts("sortNameAZ") },
      { value: PRODUCT_SORT_VALUES.NAME_ZA, label: tProducts("sortNameZA") },
    ],
    [tProducts],
  );

  const apiParams = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(pageParam));
    sp.set("pageSize", String(PAGE_SIZE));
    sp.set("sorts", sortParam);
    const filterParts: string[] = [];
    if (categoryParam) filterParts.push(`category==${categoryParam}`);
    if (minPriceParam) filterParts.push(`price>=${minPriceParam}`);
    if (maxPriceParam) filterParts.push(`price<=${maxPriceParam}`);
    if (filterParts.length > 0) sp.set("filters", filterParts.join(","));
    const q = table.get("q");
    if (q) sp.set("q", q);
    return sp.toString();
  }, [
    pageParam,
    sortParam,
    categoryParam,
    minPriceParam,
    maxPriceParam,
    table,
  ]);

  const {
    products: items,
    total,
    isLoading,
    error,
  } = useStoreProducts(storeSlug, apiParams);

  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;

  const allCategories = useMemo(() => {
    if (!items.length) return [];
    const cats = new Set(
      items
        .map(
          (p) =>
            (p as unknown as Record<string, unknown>).category as
              | string
              | undefined,
        )
        .filter(Boolean),
    );
    return [...cats].sort() as string[];
  }, [items]);

  const hasActiveFilters =
    Boolean(categoryParam) || Boolean(minPriceParam) || Boolean(maxPriceParam);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (categoryParam) {
      filters.push({
        key: "category",
        label: tProducts("filterCategory"),
        value: categoryParam,
      });
    }
    if (minPriceParam) {
      filters.push({
        key: "minPrice",
        label: tProducts("filterMinPrice"),
        value: tProducts("filterPriceValue", { value: minPriceParam }),
      });
    }
    if (maxPriceParam) {
      filters.push({
        key: "maxPrice",
        label: tProducts("filterMaxPrice"),
        value: tProducts("filterPriceValue", { value: maxPriceParam }),
      });
    }
    return filters;
  }, [categoryParam, minPriceParam, maxPriceParam, tProducts]);

  const clearFilters = () => table.clear(["category", "minPrice", "maxPrice"]);

  const handleBulkAddToCart = useCallback(async () => {
    const selected = items.filter((p) => selectedIds.includes((p as any).id));
    const results = await Promise.allSettled(
      selected.map((p: any) =>
        addToCartAction({
          productId: p.id,
          productTitle: p.title,
          productImage: p.images?.[0] ?? "",
          price: p.price,
          currency: p.currency || "INR",
          quantity: 1,
          sellerId: p.sellerId,
          sellerName: p.sellerName,
        }),
      ),
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
  }, [selectedIds, items, showSuccess, showError, tActions]);

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
    <AppkitStoreProductsView
      storeSlug={storeSlug}
      items={items as any}
      total={total}
      isLoading={isLoading}
      renderProducts={(_items, loading) => (
        <>
          {loading && (
            <div className={`${flex.hCenter} ${THEME_CONSTANTS.page.empty}`}>
              <Spinner />
            </div>
          )}
          {!!error && !loading && (
            <EmptyState
              title={t("error.title")}
              description={t("error.description")}
            />
          )}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon={<PackageSearch className="w-16 h-16" />}
              title={t("products.empty.title")}
              description={t("products.empty.description")}
              actionLabel={hasActiveFilters ? tActions("clearAll") : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          )}
          {!loading && !error && items.length > 0 && (
            <ProductGrid
              products={
                items as unknown as Parameters<
                  typeof ProductGrid
                >[0]["products"]
              }
              loading={false}
              variant={viewMode}
              selectable={!!user}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              skeletonCount={PAGE_SIZE}
            />
          )}
        </>
      )}
      renderSearch={() => (
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("products.searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      )}
      renderSort={() => (
        <SortDropdown
          value={sortParam}
          onChange={(v) => table.set("sort", v)}
          options={sortOptions}
        />
      )}
      renderFilters={() => (
        <ProductFilters
          table={table}
          categoryOptions={allCategories.map((c) => ({ value: c, label: c }))}
        />
      )}
      renderActiveFilters={() =>
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(key) => table.set(key, "")}
            onClearAll={clearFilters}
          />
        ) : null
      }
      renderViewToggle={() => (
        <Row gap="xs">
          <ViewToggle value={viewMode} onChange={(m) => table.set("view", m)} />
          <Tooltip label={tActions("selectionHint")} side="bottom">
            <Button
              type="button"
              variant="ghost"
              className={`w-7 h-7 rounded-full ${flex.center} text-zinc-400 hover:text-primary transition-colors p-0 min-h-0`}
              aria-label={tActions("selectionHint")}
            >
              <Info className="w-4 h-4" />
            </Button>
          </Tooltip>
        </Row>
      )}
      renderPagination={() =>
        totalPages > 1 ? (
          <TablePagination
            total={total}
            currentPage={pageParam}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={table.setPage}
            compact
          />
        ) : null
      }
    />
  );
}

export function StoreProductsView(props: StoreProductsViewProps) {
  return (
    <Suspense>
      <StoreProductsContent {...props} />
    </Suspense>
  );
}
