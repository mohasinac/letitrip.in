"use client";

import { Pagination } from "@mohasinac/appkit/ui";
import { EmptyState, ProductGrid, ProductSortBar } from "@/components";
import { useTranslations } from "next-intl";
import type { ProductSortValue } from "@/components";
import type { SearchProductItem } from "@mohasinac/appkit/features/search";
import type { ViewMode } from "@/components";

const PAGE_SIZE = 24;

// Local type distinct from ProductGrid's internal ProductCardData to avoid TS2719
type SearchProductData = SearchProductItem & {
  video?: string;
  featured?: boolean;
  availableQuantity?: number;
  images?: string[];
};

interface SearchResultsSectionProps {
  products: SearchProductData[];
  total: number;
  totalPages: number;
  urlQ: string;
  urlSort: ProductSortValue;
  urlPage: number;
  isLoading: boolean;
  variant?: ViewMode;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
}

export function SearchResultsSection({
  products,
  total,
  totalPages,
  urlQ,
  urlSort,
  urlPage,
  isLoading,
  variant = "card",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onSortChange,
  onPageChange,
}: SearchResultsSectionProps) {
  const t = useTranslations("search");
  return (
    <>
      <ProductSortBar
        total={total}
        showing={products.length}
        sort={urlSort}
        onSortChange={onSortChange}
      />

      {isLoading ? (
        <ProductGrid products={[]} loading skeletonCount={PAGE_SIZE} />
      ) : products.length === 0 ? (
        <EmptyState
          title={t("noResultsTitle")}
          description={urlQ ? t("noResultsSubtitle", { q: urlQ }) : undefined}
        />
      ) : (
        <ProductGrid
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products={products as any[]}
          variant={variant}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
        />
      )}

      {total > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination
            currentPage={urlPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
