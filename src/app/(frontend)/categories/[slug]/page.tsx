"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import WishlistButton from "@/components/wishlist/WishlistButton";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/utils/product";
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string }>;
  category: string;
  rating?: number;
  reviewCount?: number;
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentIds?: string[];
  children?: Category[];
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [slug, setSlug] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams?.get("sort") || "relevance"
  );
  const [minPrice, setMinPrice] = useState(searchParams?.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams?.get("inStock") === "true"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Unwrap params promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, searchQuery, sortBy, minPrice, maxPrice, inStockOnly, page]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Use Category API service
      const categoryData = await api.categories.getCategory(slug);
      setCategory(categoryData as any);

      // Fetch subcategories
      const subcats = await api.categories.getSubcategories(categoryData.id);
      setSubcategories(subcats as any);
    } catch (error: any) {
      console.error("Error fetching category:", error);
      toast.error("Failed to load category");
      router.push("/categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Use Product API service
      const filters: any = {
        page,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && sortBy !== "relevance" && { sortBy }),
        ...(minPrice && { minPrice: parseInt(minPrice) }),
        ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
        ...(inStockOnly && { inStock: true }),
      };

      const data = await api.products.getProductsByCategory(
        category!.id,
        filters
      );

      if (page === 1) {
        setProducts(data.products as any);
      } else {
        setProducts((prev) => [...prev, ...(data.products as any)]);
      }

      // Calculate if there are more pages
      setHasMore(page < data.totalPages);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    updateURL({ search: query });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
    updateURL({ sort });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("relevance");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setPage(1);
    router.push(`/categories/${slug}`);
  };

  const updateURL = (params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams?.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    router.push(`/categories/${slug}?${current.toString()}`);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  const activeFiltersCount = [
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy !== "relevance",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/categories"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Categories
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subcategories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat.id}
                  href={`/categories/${subcat.slug}`}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-center group"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subcat.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search in this category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Any"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      In Stock Only
                    </span>
                  </label>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {products.length} product
              {products.length !== 1 ? "s" : ""}
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {products.map((product) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (price: number) => string;
}) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden"
      >
        <Image
          src={getProductImageUrl(product, 0, "/assets/placeholder.png")}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
            -{discountPercent}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.floor(product.rating!)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            View Details
          </Link>
          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: getProductImageUrl(product, 0, "/assets/placeholder.png"),
              slug: product.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ProductListItem({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (price: number) => string;
}) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-4">
        <Link
          href={`/products/${product.slug}`}
          className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        >
          <Image
            src={getProductImageUrl(product, 0, "/assets/placeholder.png")}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-1 left-1 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {product.description}
          </p>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating!)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="px-6 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            View Details
          </Link>
          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: getProductImageUrl(product, 0, "/assets/placeholder.png"),
              slug: product.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}
