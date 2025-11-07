/**
 * Example: Products Page with Filter Integration
 * Demonstrates how to integrate ProductFilters with FilterSidebar and useFilters hook
 */

"use client";

import React, { useEffect, useState } from "react";
import { FilterSidebar } from "@/components/common/FilterSidebar";
import { ProductFilters, type ProductFilterValues } from "@/components/filters";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import { CardGrid } from "@/components/cards/CardGrid";
import { useFilters } from "@/hooks/useFilters";
import { buildQueryFromFilters } from "@/lib/filter-helpers";

// Example type (replace with your actual Product type)
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters with useFilters hook
  const {
    filters,
    appliedFilters,
    updateFilters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters<ProductFilterValues>(
    {}, // Initial filters (empty = no filters)
    {
      syncWithUrl: true, // Sync with URL search params
      persist: true, // Persist to localStorage
      storageKey: "product-filters",
      onChange: (newFilters) => {
        // Fetch products when filters change
        fetchProducts(newFilters);
      },
    }
  );

  // Fetch products based on filters
  const fetchProducts = async (filterValues: ProductFilterValues) => {
    setLoading(true);
    try {
      // Build query from filters
      const query = buildQueryFromFilters(filterValues);

      // Call API with query params
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        params.set(key, String(value));
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(appliedFilters);
  }, []); // Only run once on mount

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside className="lg:w-80">
          <FilterSidebar>
            <ProductFilters
              filters={filters}
              onChange={updateFilters}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </FilterSidebar>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Active Filter Indicator */}
          {hasActiveFilters && (
            <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                  active
                </span>
                <span className="text-sm text-blue-700">
                  ({products.length} result{products.length !== 1 ? "s" : ""})
                </span>
              </div>
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <CardGrid>
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </CardGrid>
          ) : products.length > 0 ? (
            <CardGrid>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </CardGrid>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
