"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import WishlistButton from "@/components/wishlist/WishlistButton";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/utils/product";
import { api } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string }>;
  category: string;
  categorySlug?: string;
  tags: string[];
  status: string;
  rating?: number;
  reviewCount?: number;
  quantity: number;
  sku: string;
  seller?: {
    id: string;
    name?: string;
    storeName?: string;
  };
}

type ViewMode = "grid" | "list";
type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "newest"
  | "popular";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams?.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams?.get("sort") as SortOption) || "relevance"
  );
  const [inStockOnly, setInStockOnly] = useState(
    searchParams?.get("inStock") === "true"
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
    inStockOnly,
    page,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build filters object
      const filters: any = {
        page,
        limit: 20,
      };

      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (sortBy) filters.sortBy = sortBy;
      if (inStockOnly) filters.inStock = true;

      // Use API service instead of direct fetch
      const data = await api.products.getProducts(filters);

      if (page === 1) {
        setProducts((data.products as any) || []);
      } else {
        setProducts((prev) => [...prev, ...((data.products as any) || [])]);
      }

      setHasMore(data.total > page * 20);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (inStockOnly) params.set("inStock", "true");

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setInStockOnly(false);
    setPage(1);
    router.push("/products");
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const activeFiltersCount = [
    selectedCategory,
    minPrice,
    maxPrice,
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing products from our marketplace
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggles */}
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="₹10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stock Filter */}
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    In Stock Only
                  </span>
                </label>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && products.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Products Grid/List */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Load More
                    </>
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

// Product Card Component
function ProductCard({
  product,
  viewMode,
  formatPrice,
}: {
  product: Product;
  viewMode: ViewMode;
  formatPrice: (price: number) => string;
}) {
  const { addItem } = useCart();

  // Handle both nested and flat structures
  const productData = product as any;
  const productPrice = productData.pricing?.price ?? productData.price ?? 0;
  const productCompareAtPrice =
    productData.pricing?.compareAtPrice ?? productData.compareAtPrice;
  const productQuantity =
    productData.inventory?.quantity ?? productData.quantity ?? 0;

  const isOutOfStock = productQuantity === 0;
  const hasDiscount =
    productCompareAtPrice && productCompareAtPrice > productPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((productCompareAtPrice - productPrice) / productCompareAtPrice) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    const productAny = product as any;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: productPrice,
      quantity: 1,
      image: getProductImageUrl(product, 0, "/assets/placeholder.png"),
      slug: product.slug,
      sku: product.sku || "",
      sellerId: productAny.sellerId || product.seller?.id || "unknown",
      sellerName:
        productAny.sellerName ||
        product.seller?.storeName ||
        product.seller?.name ||
        "JustForView",
    });

    toast.success("Added to cart!");
  };

  if (viewMode === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow no-underline"
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-32 h-32 flex-shrink-0 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={getProductImageUrl(product, 0, "/assets/placeholder.png")}
              alt={product.name}
              fill
              className="object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                -{discountPercent}%
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {product.shortDescription}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(productPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(productCompareAtPrice!)}
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 text-sm mb-2">
                <span className="text-yellow-500">★</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviewCount && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
            {/* Add to Cart Button for List View */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`mt-2 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* Wishlist Button */}
          <div className="flex-shrink-0">
            <WishlistButton
              product={{
                id: product.id,
                name: product.name,
                price: productPrice,
                image: getProductImageUrl(
                  product,
                  0,
                  "/assets/placeholder.png"
                ),
                slug: product.slug,
              }}
            />
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton
          product={{
            id: product.id,
            name: product.name,
            price: productPrice,
            image: getProductImageUrl(product, 0, "/assets/placeholder.png"),
            slug: product.slug,
          }}
        />
      </div>

      {/* Image - Clickable */}
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image
            src={getProductImageUrl(product, 0, "/assets/placeholder.png")}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content - Clickable */}
      <Link
        href={`/products/${product.slug}`}
        className="block no-underline p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {product.rating && (
          <div className="flex items-center gap-1 text-sm mb-2">
            <span className="text-yellow-500">★</span>
            <span className="text-gray-700 dark:text-gray-300">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-gray-500 dark:text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(productPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(productCompareAtPrice!)}
            </span>
          )}
        </div>
      </Link>

      {/* Action Button - Not clickable for navigation */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
