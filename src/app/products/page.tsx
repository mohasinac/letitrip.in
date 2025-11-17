"use client";

import React, { useState, useEffect, Fragment, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid, List, Loader2, Filter } from "lucide-react";
import { ProductCard } from "@/components/cards/ProductCard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { shopsService } from "@/services/shops.service";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/components/admin/Toast";
import type { ProductCardFE } from "@/types/frontend/product.types";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState(PRODUCT_FILTERS);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filterValues, sortBy, sortOrder, currentPage, searchQuery]);

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
                  options: (categoriesData || []).map((cat) => ({
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
      console.error("Failed to load filter options:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.list({
        search: searchQuery || undefined,
        ...filterValues,
        sortBy: sortBy as any,
        page: currentPage,
        limit: itemsPerPage,
      } as any);

      const productsData = response.products || [];
      setProducts(productsData);
      setTotalCount(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setSearchQuery("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleAddToCart = async (
    productId: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    }
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Products
          </h1>
          <p className="text-gray-600">Browse our complete collection</p>
        </div>

        {/* Search & Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="sales">Popular</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={`px-3 py-2 ${
                    view === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView("table")}
                  className={`px-3 py-2 ${
                    view === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <UnifiedFilterSidebar
              sections={filterOptions}
              values={filterValues}
              onChange={(key, value) => {
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onApply={() => {
                setCurrentPage(1);
              }}
              onReset={handleResetFilters}
              isOpen={true}
              onClose={() => {}}
              searchable={true}
              mobile={false}
              resultCount={totalCount}
              isLoading={loading}
            />
          )}

          {/* Products Grid/Table */}
          <div className="flex-1">
            {/* Results Count */}
            {!loading && products.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} products
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">No products found</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
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
                        isFeatured={product.isFeatured}
                        condition={product.condition}
                        onAddToCart={handleAddToCart}
                        showShopName={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images?.[0] || ""}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.condition}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">
                                ₹{product.price.toLocaleString()}
                              </div>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  product.stockCount > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
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
                                  <span className="font-medium">
                                    {product.rating.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({product.reviewCount})
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() =>
                                  router.push(`/products/${product.slug}`)
                                }
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View
                              </button>
                              {product.stockCount > 0 && (
                                <button
                                  onClick={() => handleAddToCart(product.id)}
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Add to Cart
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and 2 pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                          );
                        })
                        .map((page, idx, arr) => {
                          // Add ellipsis
                          const showEllipsis =
                            idx > 0 && page - arr[idx - 1] > 1;
                          return (
                            <Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-3 py-2">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            </Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={filterOptions}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={() => {
              setCurrentPage(1);
              setShowFilters(false);
            }}
            onReset={handleResetFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalCount}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
