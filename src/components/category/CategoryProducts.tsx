"use client";

import { useState } from "react";
import { Loader2, Grid, List, Filter as FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormSelect } from "@letitrip/react-library";
import { ProductCard } from "@letitrip/react-library";
import { EmptyState } from '@letitrip/react-library';
import { Price } from "@letitrip/react-library";
import { OptimizedImage } from "@letitrip/react-library"
import { UnifiedFilterSidebar } from "@letitrip/react-library";
import { PRODUCT_FILTERS } from "@/constants/filters";
import type { ProductCardFE } from "@/types/frontend/product.types";

export interface CategoryProductsProps {
  products: ProductCardFE[];
  loading?: boolean;
  totalProducts: number;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onFiltersChange?: (filters: Record<string, any>) => void;
  onAddToCart?: (productId: string, productDetails?: any) => void;
  className?: string;
}

/**
 * CategoryProducts Component
 *
 * Displays category products with filtering, sorting, and view options.
 * Extracted from category detail page for reusability.
 *
 * Features:
 * - Product grid/list view toggle
 * - Sort by price/date/rating/popularity
 * - Filters sidebar (price, stock, condition, rating, brand)
 * - Add to cart functionality
 * - Responsive layout with mobile filter drawer
 * - Empty state handling
 *
 * @example
 * ```tsx
 * <CategoryProducts
 *   products={products}
 *   totalProducts={120}
 *   onSortChange={handleSort}
 *   onFiltersChange={handleFilters}
 *   onAddToCart={handleAddToCart}
 * />
 * ```
 */
export function CategoryProducts({
  products,
  loading = false,
  totalProducts,
  onSortChange,
  onFiltersChange,
  onAddToCart,
  className = "",
}: CategoryProductsProps) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value, sortOrder);
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    onSortChange?.(sortBy, value);
  };

  const handleFiltersChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = (pendingFilters?: Record<string, any>) => {
    const filtersToApply = pendingFilters || filters;
    onFiltersChange?.(filtersToApply);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      if (!onAddToCart) {
        toast.error("Add to cart not configured");
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      await onAddToCart(productId, {
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        shopId: product.shopId,
      });
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  return (
    <div className={`${className}`}>
      {/* Sort & Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sort */}
          <div className="flex-1 flex gap-2">
            <FormSelect
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value)}
              options={[
                { value: "createdAt", label: "Newest" },
                { value: "price", label: "Price" },
                { value: "rating", label: "Rating" },
                { value: "sales", label: "Popular" },
              ]}
              compact
            />

            <FormSelect
              id="sort-order"
              value={sortOrder}
              onChange={(e) =>
                handleSortOrderChange(e.target.value as "asc" | "desc")
              }
              options={[
                { value: "desc", label: "High to Low" },
                { value: "asc", label: "Low to High" },
              ]}
              compact
            />

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`px-3 py-2 ${
                  view === "grid"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`px-3 py-2 ${
                  view === "list"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <FilterIcon className="w-5 h-5" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="bg-white text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar - Always Visible */}
        <div className="hidden lg:block">
          <UnifiedFilterSidebar
            sections={PRODUCT_FILTERS}
            values={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            isOpen={true}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={totalProducts}
            isLoading={loading}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <UnifiedFilterSidebar
          sections={PRODUCT_FILTERS}
          values={filters}
          onChange={handleFiltersChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalProducts}
          isLoading={loading}
        />

        {/* Products Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div>
              <EmptyState
                title="No products found"
                description={
                  Object.keys(filters).length > 0
                    ? "Try adjusting your filters"
                    : "No products found in this category"
                }
              />
              {Object.keys(filters).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {products.length} of {totalProducts} product
                {totalProducts !== 1 ? "s" : ""}
              </div>
              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      originalPrice={product.originalPrice || undefined}
                      image={product.images?.[0] || ""}
                      images={product.images || []}
                      videos={product.videos || []}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      shopName={product.shopId}
                      shopSlug={product.shopId}
                      shopId={product.shopId}
                      inStock={product.stockCount > 0}
                      featured={product.featured}
                      condition={product.condition}
                      onAddToCart={handleAddToCart}
                      showShopName={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <OptimizedImage
                          src={product.images?.[0] || ""}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary cursor-pointer"
                          onClick={() =>
                            router.push(`/products/${product.slug}`)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            router.push(`/products/${product.slug}`)
                          }
                          role="link"
                          tabIndex={0}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {product.rating > 0 && (
                            <span>
                              ★ {product.rating.toFixed(1)} (
                              {product.reviewCount})
                            </span>
                          )}
                          <span
                            className={
                              product.stockCount > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {product.stockCount > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              <Price amount={product.price} />
                            </span>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className="ml-2 text-gray-500 dark:text-gray-400 line-through">
                                  <Price amount={product.originalPrice} />
                                </span>
                              )}
                          </div>
                          {product.stockCount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product.id)}
                              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryProducts;
