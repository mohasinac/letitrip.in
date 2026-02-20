"use client";

import { ProductGrid, ProductSortBar } from "@/components/products";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { ProductSortValue } from "@/components/products";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;
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
  onPrevPage: () => void;
  onNextPage: () => void;
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
  onPrevPage,
  onNextPage,
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className={`text-lg font-medium ${themed.textPrimary}`}>
            {LABELS.NO_RESULTS}
          </p>
          {urlQ && (
            <p className={`mt-2 text-sm ${themed.textSecondary}`}>
              {LABELS.NO_RESULTS_SUBTITLE(urlQ)}
            </p>
          )}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={urlPage === 1}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.BACK}
          </button>
          <span className={`px-4 py-2 text-sm ${themed.textSecondary}`}>
            {urlPage} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={urlPage >= totalPages}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.NEXT}
          </button>
        </div>
      )}
    </>
  );
}
