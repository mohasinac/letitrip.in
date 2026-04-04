"use client";

import { useCallback, useMemo, useState } from "react";
import { Star, Heart, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  Button,
  DataTable,
  Heading,
  HorizontalScroller,
  ListingLayout,
  Main,
  MediaImage,
  Nav,
  PRODUCT_SORT_VALUES,
  ProductCard,
  Search,
  SortDropdown,
  Span,
  Spinner,
  TablePagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Text,
  TextLink,
  Tooltip,
} from "@/components";
import type { ActiveFilter, ProductSortValue } from "@/components";
import { RangeFilter } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useUrlTable, usePendingTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction, addToCartAction } from "@/actions";
import { useCategoryDetail } from "../hooks/useCategoryDetail";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import type { CategoryDocument } from "@/db/schema";

const { themed, flex, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

interface Props {
  slug: string;
  initialCategory?: CategoryDocument;
  initialChildren?: CategoryDocument[];
}

export function CategoryProductsView({
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

  // ── Staged filter state ──────────────────────────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["minPrice", "maxPrice"]);

  /* ---- Fetch category + children ---- */
  const {
    category,
    children,
    isLoading: catLoading,
  } = useCategoryDetail(slug, {
    initialCategory,
    initialChildren,
  });

  /* ---- Fetch products ---- */
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

  /* ---- Sort options ---- */
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

  /* ---- Active filters ---- */
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    const minPrice = table.get("minPrice");
    const maxPrice = table.get("maxPrice");
    if (minPrice || maxPrice) {
      const label =
        minPrice && maxPrice
          ? `₹${minPrice} – ₹${maxPrice}`
          : minPrice
            ? `₹${minPrice}+`
            : `Up to ₹${maxPrice}`;
      filters.push({ key: "minPrice", label: t("filterPrice"), value: label });
    }
    const q = table.get("q");
    if (q) {
      filters.push({ key: "q", label: tActions("search"), value: q });
    }
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
          sellerId: p.sellerId,
          sellerName: p.sellerName,
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

  /* ---- Loading state ---- */
  if (catLoading) {
    return (
      <div className={`${flex.center} min-h-[60vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  /* ---- Not found state ---- */
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
    <Main
      className={`${THEME_CONSTANTS.page.container["2xl"]} py-6 sm:py-10 space-y-6`}
    >
      {/* ═══════════════ Category Hero ═══════════════ */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        {/* Category image */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-64 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-slate-800 flex-shrink-0">
          {category.display?.coverImage ? (
            <MediaImage
              src={category.display.coverImage}
              alt={category.name}
              size="card"
            />
          ) : (
            <div
              className={`${flex.center} w-full h-full bg-gradient-to-br from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-900/20`}
            >
              <Span className="text-6xl">{category.display?.icon ?? "🗂️"}</Span>
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className={`${flex.rowCenter} gap-3 flex-wrap`}>
            <Heading level={1} className="text-2xl sm:text-3xl lg:text-4xl">
              {category.name}
            </Heading>
            {/* Featured star */}
            {category.isFeatured && (
              <Star
                className="w-6 h-6 text-yellow-500 fill-yellow-500 flex-shrink-0"
                aria-label={t("featured")}
              />
            )}
            {/* Wishlist heart */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label={t("addToWishlist")}
            >
              <Heart className="w-5 h-5 text-zinc-400 hover:text-red-500 transition-colors" />
            </Button>
          </div>

          {category.description && (
            <Text variant="secondary" className="line-clamp-3">
              {category.description}
            </Text>
          )}

          <Text size="sm" variant="muted">
            {t("productsCount", {
              count: category.metrics?.totalProductCount ?? 0,
            })}
          </Text>
        </div>
      </div>

      {/* ═══════════════ Subcategory HorizontalScroller ═══════════════ */}
      {children.length > 0 && (
        <HorizontalScroller
          items={children}
          keyExtractor={(cat: CategoryDocument) => cat.id}
          renderItem={(child: CategoryDocument) => (
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
      )}

      {/* ═══════════════ Products / Auctions Tabs ═══════════════ */}
      <Tabs
        value={activeTab}
        onChange={(tab) => table.set("tab", tab)}
        variant="line"
      >
        <TabsList>
          <TabsTrigger value="products">{t("productsTab")}</TabsTrigger>
          <TabsTrigger value="auctions">{t("auctionsTab")}</TabsTrigger>
        </TabsList>

        {/* ──── Products tab content ──── */}
        <TabsContent value="products">
          <div className="pt-4">
            {/* Breadcrumb */}
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

            {/* ListingLayout — unified search/filter/sort/grid/pagination */}
            <ListingLayout
              searchSlot={
                <Search
                  value={table.get("q")}
                  onChange={(v) => table.set("q", v)}
                  placeholder={t("searchProducts", { name: category.name })}
                  onClear={() => table.set("q", "")}
                />
              }
              filterContent={
                <RangeFilter
                  title={t("filterPrice")}
                  minValue={pendingTable.get("minPrice")}
                  maxValue={pendingTable.get("maxPrice")}
                  onMinChange={(v) => pendingTable.set("minPrice", v)}
                  onMaxChange={(v) => pendingTable.set("maxPrice", v)}
                  prefix="₹"
                  showSlider
                  minBound={0}
                  maxBound={500000}
                  step={500}
                  defaultCollapsed={false}
                />
              }
              filterActiveCount={filterActiveCount}
              onFilterApply={onFilterApply}
              onFilterClear={onFilterClear}
              sortSlot={
                <SortDropdown
                  value={sort}
                  onChange={(v) => table.set("sort", v)}
                  options={sortOptions}
                />
              }
              activeFiltersSlot={
                activeFilters.length > 0 ? (
                  <ActiveFilterChips
                    filters={activeFilters}
                    onRemove={handleClearFilter}
                    onClearAll={onFilterClear}
                  />
                ) : undefined
              }
              selectedCount={selectedIds.length}
              onClearSelection={() => setSelectedIds([])}
              actionsSlot={
                <Tooltip content={tActions("selectionHint")} placement="bottom">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`w-7 h-7 rounded-full ${flex.center} text-zinc-400 hover:text-primary transition-colors p-0 min-h-0`}
                    aria-label={tActions("selectionHint")}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </Tooltip>
              }
              bulkActionItems={
                user
                  ? [
                      {
                        id: "bulk-cart",
                        label: tActions("bulkAddToCart", {
                          count: selectedIds.length,
                        }),
                        variant: "secondary",
                        onClick: handleBulkAddToCart,
                      },
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
              toolbarPaginationSlot={
                totalPages > 1 ? (
                  <TablePagination
                    compact
                    total={totalProducts}
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => table.set("page", String(p))}
                  />
                ) : undefined
              }
            >
              <DataTable
                data={products}
                keyExtractor={(item) => item.id}
                loading={prodLoading}
                externalPagination
                columns={[
                  { key: "title", header: tProducts("colTitle") },
                  { key: "price", header: tProducts("colPrice") },
                  { key: "category", header: tProducts("filterCategory") },
                  { key: "status", header: tProducts("colStatus") },
                ]}
                showViewToggle
                showTableView={false}
                viewMode={
                  (table.get("view") || "grid") as "table" | "grid" | "list"
                }
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
                  <ProductCard
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
            </ListingLayout>
          </div>
        </TabsContent>

        {/* ──── Auctions tab content ──── */}
        <TabsContent value="auctions">
          <div className={`${flex.centerCol} py-16 text-center`}>
            <Span className="text-5xl mb-4">🔨</Span>
            <Text size="lg" weight="medium">
              {t("noAuctionsIn", { name: category.name })}
            </Text>
          </div>
        </TabsContent>
      </Tabs>
    </Main>
  );
}
