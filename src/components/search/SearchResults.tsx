"use client";

/**
 * SearchResults Component
 *
 * Display search results with pagination and empty states
 * Supports products, shops, and categories
 */

import { CategoryCard } from "@/components/cards/CategoryCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { ShopCard } from "@/components/cards/ShopCard";
import { EmptyState } from '@letitrip/react-library';
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ProductFE } from "@/types/frontend/product.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  products?: ProductFE[];
  shops?: ShopCardFE[];
  categories?: CategoryFE[];
  total: number;
  loading?: boolean;
  query: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onProductClick?: (product: ProductFE) => void;
  onShopClick?: (shop: ShopCardFE) => void;
  onCategoryClick?: (category: CategoryFE) => void;
  className?: string;
}

export function SearchResults({
  products = [],
  shops = [],
  categories = [],
  total,
  loading = false,
  query,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onProductClick,
  onShopClick,
  onCategoryClick,
  className = "",
}: SearchResultsProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasProducts = products.length > 0;
  const hasShops = shops.length > 0;
  const hasCategories = categories.length > 0;
  const hasResults = hasProducts || hasShops || hasCategories;

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasResults) {
    return (
      <div className={className}>
        <EmptyState
          icon="🔍"
          title="No results found"
          description={`We couldn't find anything matching "${query}". Try different keywords or check the spelling.`}
          action={{
            label: "Clear search",
            onClick: () => (window.location.href = "/search"),
          }}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
          <p className="text-gray-600 mt-1">
            Found {total} {total === 1 ? "result" : "results"} for "{query}"
          </p>
        </div>
      </div>

      {/* Categories */}
      {hasCategories && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Categories ({categories.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick?.(category)}
                className="cursor-pointer"
              >
                <CategoryCard {...category} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shops */}
      {hasShops && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shops ({shops.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onShopClick?.(shop)}
                className="cursor-pointer"
              >
                <ShopCard {...shop} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {hasProducts && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Products ({products.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick?.(product)}
                className="cursor-pointer"
              >
                <ProductCard {...product} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg border transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Results per page info */}
      <div className="text-center text-sm text-gray-500">
        Showing {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, total)} of {total} results
      </div>
    </div>
  );
}
