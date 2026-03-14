"use client";

import {
  Pagination,
  EmptyState,
  ProductGrid,
  ProductSortBar,
} from "@/components";
import { useTranslations } from "next-intl";
import type { ProductSortValue } from "@/components";
import type { ProductDocument } from "@/db/schema";
import type { ViewMode } from "@/components";

const PAGE_SIZE = 24;

type ProductCardData = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
  | "availableQuantity"
>;

interface SearchResultsSectionProps {
  products: ProductCardData[];
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
  variant = "grid",
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
          products={products}
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
