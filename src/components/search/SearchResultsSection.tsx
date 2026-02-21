"use client";

import { Pagination, EmptyState } from "@/components/ui";
import { ProductGrid, ProductSortBar } from "@/components/products";
import { UI_LABELS } from "@/constants";
import type { ProductSortValue } from "@/components/products";
import type { ProductDocument } from "@/db/schema";

const LABELS = UI_LABELS.SEARCH_PAGE;

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

interface SearchResultsSectionProps {
  products: ProductCardData[];
  total: number;
  totalPages: number;
  urlQ: string;
  urlSort: ProductSortValue;
  urlPage: number;
  isLoading: boolean;
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
  onSortChange,
  onPageChange,
}: SearchResultsSectionProps) {
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
          title={LABELS.NO_RESULTS}
          description={urlQ ? LABELS.NO_RESULTS_SUBTITLE(urlQ) : undefined}
        />
      ) : (
        <ProductGrid products={products} />
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
