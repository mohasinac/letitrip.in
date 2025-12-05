"use client";

import { useState } from "react";
import { Loader2, Grid, List, Filter as FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormSelect } from "@/components/forms/FormSelect";
import { ProductCard } from "@/components/cards/ProductCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { Price } from "@/components/common/values/Price";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  ProductFilters,
  ProductFilterValues,
} from "@/components/filters/ProductFilters";
import type { ProductCardFE } from "@/types/frontend/product.types";

export interface ShopProductsProps {
  products: ProductCardFE[];
  loading?: boolean;
  shopName: string;
  shopId: string;
  shopSlug: string;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onFiltersChange?: (filters: ProductFilterValues) => void;
  onAddToCart?: (productId: string, productDetails?: any) => void;
  availableBrands?: string[];
  className?: string;
}

/**
 * ShopProducts Component
 *
 * Displays shop products with filtering, sorting, and view options.
 * Extracted from shop detail page for reusability.
 *
 * Features:
 * - Product grid/list view toggle
 * - Sort by price/date/rating/popularity
 * - Filters sidebar (price, category, stock, brand, rating)
 * - Add to cart functionality
 * - Responsive layout
 * - Empty state handling
 *
 * @example
 * ```tsx
 * <ShopProducts
 *   products={products}
 *   shopName="My Shop"
 *   shopId="shop123"
 *   shopSlug="my-shop"
 *   onSortChange={handleSort}
 *   onFiltersChange={handleFilters}
 *   onAddToCart={handleAddToCart}
 * />
 * ```
 */
export function ShopProducts({
  products,
  loading = false,
  shopName,
  shopId,
  shopSlug,
  onSortChange,
  onFiltersChange,
  onAddToCart,
  availableBrands = [],
  className = "",
}: ShopProductsProps) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<ProductFilterValues>({});

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value, sortOrder);
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    onSortChange?.(sortBy, value);
  };

  const handleFiltersChange = (newFilters: ProductFilterValues) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange?.(filters);
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
        shopId,
        shopName,
      });
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Filters Sidebar */}
      <aside
        className={`lg:w-64 flex-shrink-0 ${
          showFilters ? "block" : "hidden lg:block"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-20">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            availableBrands={availableBrands}
          />
        </div>
      </aside>

      {/* Products Section */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Sort & Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Sort & View */}
            <div className="flex-1 flex gap-2">
              <FormSelect
                id="shop-sort-by"
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
                id="shop-sort-order"
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

              {/* Filter Toggle (Mobile) */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 bg-primary text-white rounded-lg"
              >
                <FilterIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="This shop hasn't listed any products yet"
          />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {products.length} product
              {products.length !== 1 ? "s" : ""}
            </div>
            {view === "grid" ? (
              <CardGrid>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice || undefined}
                    image={product.images?.[0] || ""}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    shopName={shopName}
                    shopSlug={shopSlug}
                    shopId={shopId}
                    inStock={product.stockCount > 0}
                    featured={product.featured}
                    condition={product.condition}
                    showShopName={false}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </CardGrid>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
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
                        onClick={() => router.push(`/products/${product.slug}`)}
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
                            ★ {product.rating.toFixed(1)} ({product.reviewCount}
                            )
                          </span>
                        )}
                        <span
                          className={
                            product.stockCount > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {product.stockCount > 0 ? "In Stock" : "Out of Stock"}
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
  );
}

export default ShopProducts;
