"use client";

import { toast } from "@/components/admin/Toast";
import { ProductCard } from "@/components/cards/ProductCard";
import { AdvancedPagination } from "@/components/common/AdvancedPagination";
import { EmptyStates } from "@/components/common/EmptyState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import OptimizedImage from "@/components/common/OptimizedImage";
import { ProductCardSkeletonGrid } from "@/components/common/skeletons/ProductCardSkeleton";
import { Price } from "@/components/common/values";
import { FormSelect } from "@/components/forms";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/useMobile";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { Filter, Grid, List, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function ProductsContent() {
  const router = useRouter();
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  // Use URL filters hook
  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters: resetUrlFilters,
    sort,
    setSort,
    page,
    setPage,
    limit,
    setLimit,
  } = useUrlFilters({
    initialFilters: {
      categoryId: "",
      shopId: "",
      minPrice: "",
      maxPrice: "",
      status: "",
      featured: "",
      search: "",
      view: "grid",
    },
    initialSort: { field: "createdAt", order: "desc" },
    initialPage: 1,
    initialLimit: 20,
  });

  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState(PRODUCT_FILTERS);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  // Extract view from filters
  const view = (filters.view as "grid" | "table") || "grid";

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load products when filters, sort, or page changes
  useEffect(() => {
    loadProducts();
  }, [filters, sort, page, limit]);

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, shopsData] = await Promise.all([
        categoriesService.list({ limit: 100, status: "active" }),
        shopsService.list({ limit: 100, isVerified: true }),
      ]);

      const updatedFilters = PRODUCT_FILTERS.map((section) => {
        if (section.title === "Categories") {
          return {
            ...section,
            fields: section.fields.map((field) => {
              if (field.key === "category_id") {
                return {
                  ...field,
                  options: (categoriesData?.data || []).map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                    count: cat.productCount || 0,
                  })),
                };
              }
              return field;
            }),
          };
        }

        if (section.title === "Shops") {
          return {
            ...section,
            fields: section.fields.map((field) => {
              if (field.key === "shop_id") {
                return {
                  ...field,
                  options: (shopsData.data || []).map((shop) => ({
                    label: shop.name,
                    value: shop.id,
                    count: shop.productCount || 0,
                  })),
                };
              }
              return field;
            }),
          };
        }

        return section;
      });

      setFilterOptions(updatedFilters);
    } catch (error) {
      logError(error as Error, {
        component: "ProductsPage.loadFilterOptions",
      });
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Build filter params
      const filterParams: any = {};
      if (filters.categoryId) filterParams.categoryId = filters.categoryId;
      if (filters.shopId) filterParams.shopId = filters.shopId;
      if (filters.minPrice) filterParams.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) filterParams.maxPrice = Number(filters.maxPrice);
      if (filters.status) filterParams.status = filters.status;
      if (filters.featured === "true") filterParams.featured = true;
      if (filters.search) filterParams.search = filters.search;

      // Get cursor for current page
      const startAfter = cursors[page - 1];

      const response = await productsService.list({
        ...filterParams,
        sortBy: sort?.field || "createdAt",
        sortOrder: sort?.order || "desc",
        startAfter: startAfter || undefined,
        limit,
      } as any);

      const productsData = response.data || [];
      setProducts(productsData);
      setTotalItems(response.pagination?.total || productsData.length);

      // Store cursor for next page
      if (response.pagination?.nextCursor && !cursors[page]) {
        setCursors((prev) => {
          const newCursors = [...prev];
          newCursors[page] = response.pagination.nextCursor;
          return newCursors;
        });
      }
    } catch (error) {
      logError(error as Error, {
        component: "ProductsPage.loadProducts",
        metadata: { page, filters },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = useCallback(() => {
    resetUrlFilters();
    updateFilter("view", "grid");
    setCursors([null]);
  }, [resetUrlFilters, updateFilter]);

  const handleAddToCart = useCallback(
    async (
      productId: string,
      productDetails?: {
        name: string;
        price: number;
        image: string;
        shopId: string;
        shopName: string;
      },
    ) => {
      try {
        if (!productDetails) {
          const product = products.find((p) => p.id === productId);
          if (!product) {
            throw new Error("Product not found");
          }
          productDetails = {
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
            shopId: product.shopId,
            shopName: product.shop?.name || "Unknown Shop",
          };
        }

        await addItem(productId, 1, undefined, productDetails);

        toast.success(`${productDetails.name} added to cart!`);
      } catch (error: any) {
        toast.error(error.message || "Failed to add to cart");
      }
    },
    [products, addItem],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our complete collection
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-1">
              <FormSelect
                id="sort-by"
                value={sort?.field || "createdAt"}
                onChange={(e) =>
                  setSort({
                    field: e.target.value,
                    order: sort?.order || "desc",
                  })
                }
                options={[
                  { value: "createdAt", label: "Newest" },
                  { value: "price", label: "Price" },
                  { value: "rating", label: "Rating" },
                  { value: "sales", label: "Popular" },
                ]}
                className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
              />

              <FormSelect
                id="sort-order"
                value={sort?.order || "desc"}
                onChange={(e) =>
                  setSort({
                    field: sort?.field || "createdAt",
                    order: e.target.value as "asc" | "desc",
                  })
                }
                options={[
                  { value: "desc", label: "High to Low" },
                  { value: "asc", label: "Low to High" },
                ]}
                className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
              />

              {/* View Toggle - Hidden on mobile */}
              <div className="hidden sm:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateFilter("view", "grid")}
                  className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                    view === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateFilter("view", "table")}
                  className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                    view === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? "Hide" : "Show"} Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 relative">
          {/* Filter Sidebar */}
          <UnifiedFilterSidebar
            sections={filterOptions}
            values={filters}
            onChange={(key, value) => updateFilter(key, value)}
            onApply={(pendingValues) => {
              if (pendingValues) updateFilters(pendingValues);
              setCursors([null]);
              if (isMobile) setShowFilters(false);
            }}
            onReset={handleResetFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={isMobile}
            resultCount={products.length}
            isLoading={loading}
          />

          {/* Products Grid/Table */}
          <div className="flex-1">
            {/* Results Count */}
            {!loading && products.length > 0 && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {products.length} products (Page {page})
              </div>
            )}

            {loading ? (
              <ProductCardSkeletonGrid count={view === "grid" ? 12 : 8} />
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <EmptyStates.NoProducts
                  action={{
                    label: "Clear filters",
                    onClick: handleResetFilters,
                  }}
                />
              </div>
            ) : (
              <>
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
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12">
                                  <OptimizedImage
                                    src={product.images?.[0] || ""}
                                    alt={product.name}
                                    fill
                                    className="rounded object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.condition}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 dark:text-white">
                                <Price amount={product.price} />
                              </div>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    <Price amount={product.originalPrice} />
                                  </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  product.stockCount > 0
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                }`}
                              >
                                {product.stockCount > 0
                                  ? `${product.stockCount} in stock`
                                  : "Out of stock"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {product.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {product.rating.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({product.reviewCount})
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <FavoriteButton
                                  itemId={product.id}
                                  itemType="product"
                                  initialIsFavorite={false}
                                  size="sm"
                                />
                                <button
                                  onClick={() =>
                                    router.push(`/products/${product.slug}`)
                                  }
                                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                >
                                  View
                                </button>
                                {product.stockCount > 0 && (
                                  <button
                                    onClick={() => handleAddToCart(product.id)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="mt-8">
                    <AdvancedPagination
                      currentPage={page}
                      totalPages={Math.ceil(totalItems / limit)}
                      pageSize={limit}
                      totalItems={totalItems}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        if (newPage === 1) setCursors([null]);
                      }}
                      onPageSizeChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                        setCursors([null]);
                      }}
                      showPageSizeSelector
                      showPageInput
                      showFirstLast
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
