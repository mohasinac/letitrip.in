"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import { Star, Heart, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Heading,
  Main,
  Nav,
  Text,
  Tooltip,
  Span,
  Button,
  HorizontalScroller,
  SortDropdown,
  Spinner,
  TablePagination,
  ActiveFilterChips,
  DataTable,
} from "@mohasinac/appkit/ui";
import { usePendingTable } from "@mohasinac/appkit/react";
import { CategoryProductsView as AppkitCategoryProductsView } from "@mohasinac/appkit/features/categories";
import {
  MediaImage,
  PRODUCT_SORT_VALUES,
  Search,
  TextLink,
  InteractiveProductCard,
} from "@/components";
import type { ActiveFilter } from "@mohasinac/appkit/ui";
import type { ProductSortValue } from "@/components";
import { RangeFilter } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction, addToCartAction } from "@/actions";
import { useCategoryDetail } from "@mohasinac/appkit/features/categories";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";

const { themed, flex, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

interface Props {
  slug: string;
  initialCategory?: CategoryItem;
  initialChildren?: CategoryItem[];
}

function CategoryProductsContent({
  slug,
  initialCategory,
  initialChildren,
}: Props) {
  const t = useTranslations("categories");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const table = useUrlTable({
    defaults: {
      pageSize: String(PAGE_SIZE),
      sort: PRODUCT_SORT_VALUES.NEWEST,
      tab: "products",
    },
  });

  const sort = (table.get("sort") ||
    PRODUCT_SORT_VALUES.NEWEST) as ProductSortValue;
  const page = table.getNumber("page", 1);
  const activeTab = table.get("tab") || "products";

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["minPrice", "maxPrice"]);

  const {
    category,
    children,
    isLoading: catLoading,
  } = useCategoryDetail(slug, {
    initialCategory,
    initialChildren,
  });

  const { products, totalProducts, totalPages, prodLoading } =
    useCategoryProducts(slug, {
      sort,
      page,
      pageSize: PAGE_SIZE,
      minPrice: table.get("minPrice") || undefined,
      maxPrice: table.get("maxPrice") || undefined,
      search: table.get("q") || undefined,
      cacheKey: table.params.toString(),
    });

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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    const minPrice = table.get("minPrice");
    const maxPrice = table.get("maxPrice");
    if (minPrice || maxPrice) {
      const label =
        minPrice && maxPrice
          ? `\u20B9${minPrice} \u2013 \u20B9${maxPrice}`
          : minPrice
            ? `\u20B9${minPrice}+`
            : `Up to \u20B9${maxPrice}`;
      filters.push({ key: "minPrice", label: t("filterPrice"), value: label });
    }
    const q = table.get("q");
    if (q) filters.push({ key: "q", label: tActions("search"), value: q });
    return filters;
  }, [table, t, tActions]);

  const handleClearFilter = useCallback(
    (key: string) => {
      if (key === "minPrice") table.setMany({ minPrice: "", maxPrice: "" });
      else table.set(key, "");
    },
    [table],
  );

  const handleBulkAddToCart = useCallback(async () => {
    const selected = products.filter((p) => selectedIds.includes(p.id));
    const results = await Promise.allSettled(
      selected.map((p) =>
        addToCartAction({
          productId: p.id,
          productTitle: p.title,
          productImage: p.images?.[0] ?? "",
          price: p.price,
          currency: p.currency || "INR",
          quantity: 1,
          sellerId: p.sellerId ?? "",
          sellerName: p.sellerName ?? "",
        }),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkAddToCartSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkAddToCartPartial", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkAddToCartFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, products, showSuccess, showError, tActions]);

  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => addToWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkAddToWishlistSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkAddToWishlistPartial", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkAddToWishlistFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  if (catLoading) {
    return (
      <div className={`${flex.center} min-h-[60vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div
        className={`${THEME_CONSTANTS.page.container["2xl"]} py-20 text-center ${spacing.stack}`}
      >
        <Text size="lg" weight="medium">
          {t("noCategories")}
        </Text>
        <TextLink
          href={ROUTES.PUBLIC.CATEGORIES}
          className="text-sm text-primary hover:underline"
        >
          {t("backToCategories")}
        </TextLink>
      </div>
    );
  }

  return (
    <AppkitCategoryProductsView
      slug={slug}
      category={category as any}
      children={children as any}
      total={totalProducts}
      isLoading={prodLoading}
      renderBreadcrumbs={() => (
        <Nav
          aria-label="Breadcrumb"
          className={`text-sm ${themed.textSecondary} mb-4`}
        >
          <TextLink
            href={ROUTES.PUBLIC.CATEGORIES}
            className="hover:text-primary"
          >
            {t("title")}
          </TextLink>
          {category.ancestors?.map((ancestor) => (
            <Span key={ancestor.id}>
              <Span className="mx-2">/</Span>
              <TextLink
                href={`${ROUTES.PUBLIC.CATEGORIES}/${ancestor.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-primary"
              >
                {ancestor.name}
              </TextLink>
            </Span>
          ))}
          <Span className="mx-2">/</Span>
          <Span className={themed.textPrimary}>{category.name}</Span>
        </Nav>
      )}
      renderChildCategories={() =>
        children.length > 0 ? (
          <HorizontalScroller
            items={children}
            keyExtractor={(cat: CategoryItem) => cat.id}
            renderItem={(child: CategoryItem) => (
              <TextLink
                href={`${ROUTES.PUBLIC.CATEGORIES}/${child.slug}`}
                variant="inherit"
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors no-underline ${themed.border} hover:border-primary ${themed.bgSecondary} hover:bg-primary/5 dark:hover:bg-primary/10 ${themed.textPrimary}`}
              >
                {child.display?.icon && (
                  <Span className="text-lg">{child.display.icon}</Span>
                )}
                <Span className="text-sm font-medium whitespace-nowrap">
                  {child.name}
                </Span>
              </TextLink>
            )}
            showArrows
            showFadeEdges
            gap={8}
            className="py-1"
          />
        ) : null
      }
      renderSearch={() => (
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("searchProducts", { name: category.name })}
          onClear={() => table.set("q", "")}
        />
      )}
      renderSort={() => (
        <SortDropdown
          value={sort}
          onChange={(v) => table.set("sort", v)}
          options={sortOptions}
        />
      )}
      renderViewToggle={() => (
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
      )}
      renderFilters={() => (
        <RangeFilter
          title={t("filterPrice")}
          minValue={pendingTable.get("minPrice")}
          maxValue={pendingTable.get("maxPrice")}
          onMinChange={(v) => pendingTable.set("minPrice", v)}
          onMaxChange={(v) => pendingTable.set("maxPrice", v)}
          prefix="\u20B9"
          showSlider
          minBound={0}
          maxBound={500000}
          step={500}
          defaultCollapsed={false}
        />
      )}
      renderActiveFilters={() =>
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={handleClearFilter}
            onClearAll={onFilterClear}
          />
        ) : null
      }
      renderProducts={(loading) => (
        <DataTable
          data={products}
          keyExtractor={(item) => item.id}
          loading={loading}
          externalPagination
          columns={[
            { key: "title", header: tProducts("colTitle") },
            { key: "price", header: tProducts("colPrice") },
            { key: "category", header: tProducts("filterCategory") },
            { key: "status", header: tProducts("colStatus") },
          ]}
          showViewToggle
          showTableView={false}
          viewMode={(table.get("view") || "grid") as "table" | "grid" | "list"}
          onViewModeChange={(m) => table.set("view", m)}
          labels={{
            gridView: tActions("gridView"),
            listView: tActions("listView"),
          }}
          emptyState={
            <div className={`${flex.centerCol} py-16 text-center`}>
              <Text size="lg" weight="medium">
                {t("noProductsIn", { name: category.name })}
              </Text>
              <TextLink
                href={ROUTES.PUBLIC.CATEGORIES}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {t("backToCategories")}
              </TextLink>
            </div>
          }
          mobileCardRender={(item) => (
            <InteractiveProductCard
              product={item as any}
              variant={
                (table.get("view") || "grid") === "list" ? "list" : "grid"
              }
              selectable={!!user}
              isSelected={selectedIds.includes(item.id)}
              onSelect={(id, sel) =>
                setSelectedIds((prev) =>
                  sel ? [...prev, id] : prev.filter((x) => x !== id),
                )
              }
            />
          )}
        />
      )}
      renderPagination={() =>
        totalPages > 1 ? (
          <TablePagination
            compact
            total={totalProducts}
            currentPage={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => table.set("page", String(p))}
          />
        ) : null
      }
    />
  );
}

export function CategoryProductsView(props: Props) {
  return (
    <Suspense>
      <CategoryProductsContent {...props} />
    </Suspense>
  );
}
