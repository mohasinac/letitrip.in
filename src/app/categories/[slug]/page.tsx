/**
 * Category Products Page
 *
 * Route: /categories/[slug]
 * Displays all published products belonging to a specific category.
 * Reuses ProductGrid and ProductSortBar from Phase 1.
 */

"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import {
  ProductGrid,
  ProductSortBar,
  Pagination,
  PRODUCT_SORT_VALUES,
  Spinner,
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useApiQuery, useUrlTable } from "@/hooks";
import type { CategoryDocument, ProductDocument } from "@/db/schema";
import type { ProductSortValue } from "@/components";

const { themed, typography, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

const PRICE_BUCKETS = [
  { value: "0-500", label: "Under ₹500" },
  { value: "500-2000", label: "₹500 – ₹2,000" },
  { value: "2000-10000", label: "₹2,000 – ₹10,000" },
  { value: "10000+", label: "Over ₹10,000" },
];

type ProductCardData = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
>;

interface ProductsResponse {
  data: ProductCardData[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface CategoriesResponse {
  data: CategoryDocument[];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CategoryProductsPage({ params }: Props) {
  const { slug } = use(params);
  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });
  const sort = (table.get("sort") ||
    PRODUCT_SORT_VALUES.NEWEST) as ProductSortValue;
  const page = table.getNumber("page", 1);
  const priceRange = table.get("priceRange");
  const [minPrice, maxPrice] = useMemo(() => {
    if (!priceRange) return ["", ""];
    if (priceRange.endsWith("+")) return [priceRange.replace("+", ""), ""];
    const parts = priceRange.split("-");
    return [parts[0] ?? "", parts[1] ?? ""];
  }, [priceRange]);

  /* ---- Fetch all categories (flat) to resolve slug → category doc ---- */
  const { data: catData, isLoading: catLoading } =
    useApiQuery<CategoriesResponse>({
      queryKey: ["categories", "flat"],
      queryFn: () =>
        fetch(`${API_ENDPOINTS.CATEGORIES.LIST}?flat=true`).then((r) =>
          r.json(),
        ),
    });

  const category = useMemo(
    () => (catData?.data ?? []).find((c) => c.slug === slug),
    [catData, slug],
  );

  /* ---- Fetch products filtered by category id ---- */
  const productsUrl = useMemo(() => {
    if (!category) return null;
    const filterParts = ["status==published", `category==${category.id}`];
    if (minPrice) filterParts.push(`price>=${minPrice}`);
    if (maxPrice) filterParts.push(`price<=${maxPrice}`);
    return `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${encodeURIComponent(filterParts.join(","))}&sorts=${encodeURIComponent(sort)}&page=${String(page)}&pageSize=${String(PAGE_SIZE)}`;
  }, [category, sort, page, minPrice, maxPrice]);

  const { data: prodData, isLoading: prodLoading } =
    useApiQuery<ProductsResponse>({
      queryKey: [
        "products",
        "by-category",
        category?.id ?? "",
        table.params.toString(),
      ],
      queryFn: () => fetch(productsUrl!).then((r) => r.json()),
      enabled: !!productsUrl,
    });

  const products = useMemo(() => prodData?.data ?? [], [prodData]);
  const totalProducts = prodData?.meta?.total ?? 0;
  const totalPages = prodData?.meta?.totalPages ?? 1;

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!priceRange) return [];
    return [
      {
        key: "priceRange",
        label: "Price",
        value:
          PRICE_BUCKETS.find((b) => b.value === priceRange)?.label ??
          priceRange,
      },
    ];
  }, [priceRange]);
  const activeFilterCount = activeFilters.length;

  /* -------------------------------------------------------------------- */

  if (catLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <p className={`text-lg font-medium ${themed.textPrimary}`}>
          {UI_LABELS.CATEGORIES_PAGE.NO_CATEGORIES}
        </p>
        <Link
          href={ROUTES.PUBLIC.CATEGORIES}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {UI_LABELS.CATEGORIES_PAGE.BACK_TO_CATEGORIES}
        </Link>
      </div>
    );
  }

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Breadcrumb */}
      <nav className={`text-sm ${themed.textSecondary}`}>
        <Link
          href={ROUTES.PUBLIC.CATEGORIES}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {UI_LABELS.CATEGORIES_PAGE.TITLE}
        </Link>
        <span className="mx-2">/</span>
        <span className={themed.textPrimary}>{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-start gap-4">
        {category.display?.icon && (
          <span className="text-4xl">{category.display.icon}</span>
        )}
        <div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {category.name}
          </h1>
          {category.description && (
            <p className={`mt-1 ${themed.textSecondary}`}>
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={activeFilterCount}
          onClearAll={() => table.set("priceRange", "")}
        >
          <FilterFacetSection
            title="Price Range"
            options={PRICE_BUCKETS}
            selected={priceRange ? [priceRange] : []}
            onChange={(vals) => table.set("priceRange", vals[0] ?? "")}
            searchable={false}
          />
        </FilterDrawer>
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={() => table.set("priceRange", "")}
          onClearAll={() => table.set("priceRange", "")}
        />
      </div>

      {/* Sort Bar */}
      <ProductSortBar
        total={totalProducts}
        showing={products.length}
        sort={sort}
        onSortChange={(v) => table.set("sort", v as string)}
      />

      {/* Product Grid */}
      {prodLoading ? (
        <ProductGrid products={[]} loading skeletonCount={PAGE_SIZE} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className={`text-lg font-medium ${themed.textPrimary}`}>
            {UI_LABELS.CATEGORIES_PAGE.NO_PRODUCTS_IN(category.name)}
          </p>
          <Link
            href={ROUTES.PUBLIC.CATEGORIES}
            className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {UI_LABELS.CATEGORIES_PAGE.BACK_TO_CATEGORIES}
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={table.setPage}
          />
        </div>
      )}
    </main>
  );
}
