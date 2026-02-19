/**
 * Category Products Page
 *
 * Route: /categories/[slug]
 * Displays all published products belonging to a specific category.
 * Reuses ProductGrid and ProductSortBar from Phase 1.
 */

"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProductGrid,
  ProductSortBar,
  PRODUCT_SORT_VALUES,
  Spinner,
} from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useApiQuery } from "@/hooks";
import type { CategoryDocument, ProductDocument } from "@/db/schema";
import type { ProductSortValue } from "@/components";

const { themed, typography, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

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
  const [sort, setSort] = useState<ProductSortValue>(
    PRODUCT_SORT_VALUES.NEWEST,
  );
  const [page, setPage] = useState(1);

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
    const filters = `status==published,category==${category.id}`;
    return `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${encodeURIComponent(filters)}&sorts=${encodeURIComponent(sort)}&page=${String(page)}&pageSize=${String(PAGE_SIZE)}`;
  }, [category, sort, page]);

  const { data: prodData, isLoading: prodLoading } =
    useApiQuery<ProductsResponse>({
      queryKey: [
        "products",
        "by-category",
        category?.id ?? "",
        sort,
        String(page),
      ],
      queryFn: () => fetch(productsUrl!).then((r) => r.json()),
      enabled: !!productsUrl,
    });

  const products = useMemo(() => prodData?.data ?? [], [prodData]);
  const totalProducts = prodData?.meta?.total ?? 0;

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
      <ProductSortBar
        total={totalProducts}
        showing={products.length}
        sort={sort}
        onSortChange={(v) => {
          setSort(v as ProductSortValue);
          setPage(1);
        }}
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
      {totalProducts > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.BACK}
          </button>
          <span className={`px-4 py-2 text-sm ${themed.textSecondary}`}>
            {UI_LABELS.ACTIONS.NEXT === "Next" ? `Page ${page}` : `${page}`}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={products.length < PAGE_SIZE}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.NEXT}
          </button>
        </div>
      )}
    </main>
  );
}
