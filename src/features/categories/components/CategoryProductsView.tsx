"use client";

import { useMemo } from "react";
import {
  ActiveFilterChips,
  FilterDrawer,
  FilterFacetSection,
  Heading,
  Main,
  Nav,
  Pagination,
  PRODUCT_SORT_VALUES,
  ProductGrid,
  ProductSortBar,
  Span,
  Spinner,
  Text,
  TextLink,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import { useCategoryProducts } from "../hooks";
import type { ProductSortValue } from "@/components";

const { themed, typography, spacing, flex } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

const PRICE_BUCKETS = [
  { value: "0-500", label: "Under ₹500" },
  { value: "500-2000", label: "₹500 – ₹2,000" },
  { value: "2000-10000", label: "₹2,000 – ₹10,000" },
  { value: "10000+", label: "Over ₹10,000" },
];

interface Props {
  slug: string;
}

export function CategoryProductsView({ slug }: Props) {
  const t = useTranslations("categories");
  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });
  const sort = (table.get("sort") ||
    PRODUCT_SORT_VALUES.NEWEST) as ProductSortValue;
  const page = table.getNumber("page", 1);
  const priceRange = table.get("priceRange");

  const {
    category,
    products,
    totalProducts,
    totalPages,
    catLoading,
    prodLoading,
  } = useCategoryProducts(slug, {
    sort,
    page,
    pageSize: PAGE_SIZE,
    priceRange,
    cacheKey: table.params.toString(),
  });

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
      <div className={`${flex.center} min-h-[60vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

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

  return (
    <Main
      className={`${THEME_CONSTANTS.page.container["2xl"]} py-10 ${spacing.stack}`}
    >
      {/* Breadcrumb */}
      <Nav
        aria-label="Breadcrumb"
        className={`text-sm ${themed.textSecondary}`}
      >
        <TextLink
          href={ROUTES.PUBLIC.CATEGORIES}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {t("title")}
        </TextLink>
        <Span className="mx-2">/</Span>
        <Span className={themed.textPrimary}>{category.name}</Span>
      </Nav>

      {/* Category Header */}
      <div className="flex items-start gap-4">
        {category.display?.icon && (
          <Span className="text-4xl">{category.display.icon}</Span>
        )}
        <div>
          <Heading level={1}>{category.name}</Heading>
          {category.description && (
            <Text variant="secondary" className="mt-1">
              {category.description}
            </Text>
          )}
        </div>
      </div>

      {/* Filter + sort bar */}
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
    </Main>
  );
}
