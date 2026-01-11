"use client";

import { toast } from "@/components/admin/Toast";
import { ProductCard } from "@/components/cards/ProductCard";
import { CategoryFeaturedSellers } from "@/components/category/CategoryFeaturedSellers";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { CategoryStats } from "@/components/category/CategoryStats";
import { SimilarCategories } from "@/components/category/SimilarCategories";
import { SubcategoryGrid } from "@/components/category/SubcategoryGrid";
import { AdvancedPagination } from "@/components/common/AdvancedPagination";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Price } from "@/components/common/values/Price";
import { FormSelect } from "@/components/forms/FormSelect";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { useCart } from "@/hooks/useCart";
import { useLoadingState } from "@/hooks/useLoadingState";
import { useIsMobile } from "@/hooks/useMobile";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { notFound } from "@/lib/error-redirects";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { Filter, Grid as GridIcon, List, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function CategoryDetailContent({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  // URL-based filter management
  const { filters, updateFilter, resetFilters } = useUrlFilters();

  // Get page params from URL
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortDirection = (searchParams.get("sortDirection") || "desc") as
    | "asc"
    | "desc";

  const [category, setCategory] = useState<CategoryFE | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<CategoryFE[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryFE[]>([]);
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const {
    isLoading: loading,
    error,
    execute: executeCategoryLoad,
  } = useLoadingState({
    onLoadError: (error) => {
      logError(error, { component: "CategoryDetail.loadCategory", slug });
      router.push(notFound.category(slug, error));
    },
  });
  const { isLoading: productsLoading, execute: executeProductsLoad } =
    useLoadingState({
      onLoadError: (error) => {
        logError(error, { component: "CategoryDetail.loadProducts", slug });
      },
    });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, sortField, sortDirection, filters, page, pageSize]);

  const loadCategory = () =>
    executeCategoryLoad(async () => {
      // Load category details
      const categoryData = await categoriesService.getBySlug(slug);
      setCategory(categoryData);

      // Load breadcrumb using parent hierarchy
      const breadcrumbData = await categoriesService.getBreadcrumb(
        categoryData.id
      );
      setBreadcrumb(breadcrumbData);

      // Load subcategories
      const subcatsResponse = await categoriesService.list({
        parentId: categoryData.id,
        isActive: true,
      });
      setSubcategories(subcatsResponse.data);
    });

  const loadProducts = () => {
    if (!category) return;

    executeProductsLoad(async () => {
      const response = await productsService.list({
        categoryId: category.id,
        ...filters,
        sortBy: sortField as any,
        limit: pageSize,
        page,
      });
      setProducts(response.data || []);
      setTotalProducts(response.count || response.data?.length || 0);
    });
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
          shopName: product.shopId,
        };
      }

      await addItem(productId, 1, undefined, productDetails);
      toast.success(`${productDetails.name} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Category not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/categories")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Browse all categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Category Header */}
        <CategoryHeader
          id={category.id}
          name={category.name}
          slug={category.slug}
          description={category.description}
          image={category.image}
          productCount={category.productCount}
          parentCategory={
            breadcrumb.length > 0
              ? {
                  id: breadcrumb[breadcrumb.length - 1].id,
                  name: breadcrumb[breadcrumb.length - 1].name,
                  slug: breadcrumb[breadcrumb.length - 1].slug,
                }
              : null
          }
        />

        {/* Category Stats */}
        <CategoryStats
          productCount={category.productCount}
          sellerCount={0}
          priceRange={{ min: 0, max: 999999 }}
          popularBrands={[]}
        />

        {/* Products Section */}
        <div className="pb-12 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Products
            </h2>
          </div>

          {/* Sort & Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Sort */}
              <div className="flex-1 flex gap-2">
                <FormSelect
                  id="sort-by"
                  value={sortField}
                  onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set("sortField", e.target.value);
                    router.push(`?${params.toString()}`);
                  }}
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
                  value={sortDirection}
                  onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set("sortDirection", e.target.value);
                    router.push(`?${params.toString()}`);
                  }}
                  options={[
                    { value: "desc", label: "High to Low" },
                    { value: "asc", label: "Low to High" },
                  ]}
                  compact
                />

                {/* View Toggle */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Toggle (Mobile) */}
              {isMobile && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="bg-white text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar - Always Visible */}
            {!isMobile && (
              <UnifiedFilterSidebar
                sections={PRODUCT_FILTERS}
                values={filters}
                onChange={updateFilter}
                onApply={(pendingValues) => {
                  if (pendingValues) {
                    Object.entries(pendingValues).forEach(([key, value]) => {
                      updateFilter(key, value);
                    });
                  }
                }}
                onReset={resetFilters}
                isOpen={true}
                onClose={() => {}}
                searchable={true}
                mobile={false}
                resultCount={totalProducts}
                isLoading={productsLoading}
              />
            )}

            {/* Mobile Filter Drawer */}
            {isMobile && (
              <UnifiedFilterSidebar
                sections={PRODUCT_FILTERS}
                values={filters}
                onChange={updateFilter}
                onApply={(pendingValues) => {
                  if (pendingValues) {
                    Object.entries(pendingValues).forEach(([key, value]) => {
                      updateFilter(key, value);
                    });
                  }
                  setShowFilters(false);
                }}
                onReset={resetFilters}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                searchable={true}
                mobile={true}
                resultCount={totalProducts}
                isLoading={productsLoading}
              />
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {Object.keys(filters).length > 0
                      ? "No products found matching your filters"
                      : "No products found in this category"}
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
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
                              <td className="px-6 py-4 text-right space-x-2">
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {!productsLoading && products.length > 0 && (
                    <div className="mt-8">
                      <AdvancedPagination
                        currentPage={page}
                        pageSize={pageSize}
                        totalItems={totalProducts}
                        totalPages={Math.ceil(totalProducts / pageSize)}
                        onPageChange={(newPage) => {
                          const params = new URLSearchParams(
                            window.location.search
                          );
                          params.set("page", newPage.toString());
                          router.push(`?${params.toString()}`);
                        }}
                        onPageSizeChange={(newSize) => {
                          const params = new URLSearchParams(
                            window.location.search
                          );
                          params.set("page", "1");
                          params.set("pageSize", newSize.toString());
                          router.push(`?${params.toString()}`);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <div className="mt-12 mb-8">
            <SubcategoryGrid
              subcategories={subcategories}
              parentSlug={category.slug}
            />
          </div>
        )}

        {/* Featured Sellers */}
        <CategoryFeaturedSellers
          categoryId={category.id}
          categorySlug={category.slug}
          sellers={[]}
        />

        {/* Similar Categories Section (sibling categories at same tree level) */}
        {category && (
          <div className="mt-8 mb-8">
            <SimilarCategories
              categorySlug={category.slug}
              categoryName={category.name}
              limit={12}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CategoryDetailContent params={params} />
    </Suspense>
  );
}
