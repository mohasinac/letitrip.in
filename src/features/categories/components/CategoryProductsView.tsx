"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  Button,
  DataTable,
  FilterFacetSection,
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
} from "@/components";
import type { ActiveFilter, ProductSortValue } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useUrlTable } from "@/hooks";
import { useCategoryDetail } from "../hooks/useCategoryDetail";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import type { CategoryDocument } from "@/db/schema";

const { themed, flex, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

const PRICE_BUCKET_KEYS = [
  { value: "0-500", labelKey: "priceUnder500" },
  { value: "500-2000", labelKey: "price500to2000" },
  { value: "2000-10000", labelKey: "price2000to10000" },
  { value: "10000+", labelKey: "priceOver10000" },
] as const;

interface Props {
  slug: string;
}

export function CategoryProductsView({ slug }: Props) {
  const t = useTranslations("categories");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");

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
  const priceRange = table.get("priceRange");
  const activeTab = table.get("tab") || "products";

  // ── Staged filter state ──────────────────────────────────────────────
  const [stagedPriceRange, setStagedPriceRange] = useState<string[]>(
    priceRange ? [priceRange] : [],
  );

  useEffect(() => {
    setStagedPriceRange(priceRange ? [priceRange] : []);
  }, [priceRange]);

  const handleFilterApply = useCallback(() => {
    table.set("priceRange", stagedPriceRange[0] ?? "");
  }, [stagedPriceRange, table]);

  const handleFilterClearAll = useCallback(() => {
    setStagedPriceRange([]);
    table.setMany({ priceRange: "", q: "" });
  }, [table]);

  /* ---- Fetch category + children ---- */
  const { category, children, isLoading: catLoading } = useCategoryDetail(slug);

  /* ---- Fetch products ---- */
  const { products, totalProducts, totalPages, prodLoading } =
    useCategoryProducts(slug, {
      sort,
      page,
      pageSize: PAGE_SIZE,
      priceRange,
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
    if (priceRange) {
      const bucket = PRICE_BUCKET_KEYS.find((b) => b.value === priceRange);
      filters.push({
        key: "priceRange",
        label: t("filterPrice"),
        value: bucket ? t(bucket.labelKey) : priceRange,
      });
    }
    const q = table.get("q");
    if (q) {
      filters.push({ key: "q", label: tActions("search"), value: q });
    }
    return filters;
  }, [priceRange, table, t, tProducts]);

  const handleClearFilter = useCallback(
    (key: string) => {
      if (key === "priceRange") setStagedPriceRange([]);
      table.set(key, "");
    },
    [table],
  );

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
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <Text size="lg" weight="medium">
          {t("noCategories")}
        </Text>
        <TextLink
          href={ROUTES.PUBLIC.CATEGORIES}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {t("backToCategories")}
        </TextLink>
      </div>
    );
  }

  const priceBucketOptions = PRICE_BUCKET_KEYS.map((b) => ({
    value: b.value,
    label: t(b.labelKey),
  }));

  return (
    <Main
      className={`${THEME_CONSTANTS.page.container["2xl"]} py-6 sm:py-10 space-y-6`}
    >
      {/* ═══════════════ Category Hero ═══════════════ */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        {/* Category image */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-64 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {category.display?.coverImage ? (
            <MediaImage
              src={category.display.coverImage}
              alt={category.name}
              size="card"
            />
          ) : (
            <div
              className={`${flex.center} w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20`}
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
              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
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
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors no-underline ${themed.border} hover:border-indigo-500 ${themed.bgSecondary} hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${themed.textPrimary}`}
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
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {t("title")}
              </TextLink>
              {category.ancestors?.map((ancestor) => (
                <Span key={ancestor.id}>
                  <Span className="mx-2">/</Span>
                  <TextLink
                    href={`${ROUTES.PUBLIC.CATEGORIES}/${ancestor.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
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
                <FilterFacetSection
                  title={t("filterPrice")}
                  options={priceBucketOptions}
                  selected={stagedPriceRange}
                  onChange={setStagedPriceRange}
                  selectionMode="single"
                  searchable={false}
                />
              }
              filterActiveCount={activeFilters.length}
              onFilterApply={handleFilterApply}
              onFilterClear={handleFilterClearAll}
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
                    onClearAll={handleFilterClearAll}
                  />
                ) : undefined
              }
              paginationSlot={
                totalPages > 1 ? (
                  <TablePagination
                    total={totalProducts}
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={PAGE_SIZE}
                    onPageChange={table.setPage}
                    onPageSizeChange={(n) => table.set("pageSize", String(n))}
                    pageSizeOptions={[12, 24, 48]}
                  />
                ) : undefined
              }
            >
              <DataTable
                data={products}
                keyExtractor={(item) => item.id}
                loading={prodLoading}
                columns={[
                  { key: "title", header: tProducts("colTitle") },
                  { key: "price", header: tProducts("colPrice") },
                  { key: "category", header: tProducts("filterCategory") },
                  { key: "status", header: tProducts("colStatus") },
                ]}
                showViewToggle
                viewMode={
                  (table.get("view") || "grid") as "table" | "grid" | "list"
                }
                onViewModeChange={(m) => table.set("view", m)}
                emptyState={
                  <div className={`${flex.centerCol} py-16 text-center`}>
                    <Text size="lg" weight="medium">
                      {t("noProductsIn", { name: category.name })}
                    </Text>
                    <TextLink
                      href={ROUTES.PUBLIC.CATEGORIES}
                      className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
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
