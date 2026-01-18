"use client";

import type { CategoryFE } from "@/types/frontend/category.types";
import type { ProductFE } from "@/types/frontend/product.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { SearchResultsProps as LibrarySearchResultsProps } from "@letitrip/react-library";
import {
  CategoryCard,
  EmptyState,
  SearchResults as LibrarySearchResults,
  ProductCard,
  ShopCard,
} from "@letitrip/react-library";
import { Loader2 } from "lucide-react";

export interface SearchResultsProps
  extends Omit<
    LibrarySearchResultsProps<any>,
    | "renderProduct"
    | "renderShop"
    | "renderCategory"
    | "emptyState"
    | "loadingIcon"
  > {
  products?: ProductFE[];
  shops?: ShopCardFE[];
  categories?: CategoryFE[];
}

/**
 * SearchResults Component (Next.js Wrapper)
 *
 * Display search results with pagination and empty states.
 * Integrates library SearchResults with card components.
 */
export function SearchResults({
  products,
  shops,
  categories,
  query,
  ...props
}: SearchResultsProps) {
  return (
    <LibrarySearchResults
      {...props}
      products={products}
      shops={shops}
      categories={categories}
      query={query}
      renderProduct={(product) => <ProductCard {...product} compact />}
      renderShop={(shop) => <ShopCard {...shop} />}
      renderCategory={(category) => <CategoryCard {...category} compact />}
      emptyState={
        <EmptyState
          icon="🔍"
          title="No results found"
          description={`We couldn't find anything matching "${query}". Try different keywords or check the spelling.`}
          action={{
            label: "Clear search",
            onClick: () => (window.location.href = "/search"),
          }}
        />
      }
      loadingIcon={<Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
    />
  );
}
