/**
 * All Products List Page - Shows products from all stores
 */

"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

export default function AllProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { products, loading, error, totalCount, refetch } = useProducts({
    search: searchTerm,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
    maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    sortBy: sortBy as any,
    limit: 24,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
  };

  const ProductCard = ({ product }: { product: any }) => (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={product.images?.[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <HeartIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <EyeIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {product.compareAtPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            {Math.round(
              ((product.compareAtPrice - product.price) /
                product.compareAtPrice) *
                100
            )}
            % OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-red-600"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating || 0)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{product.category}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Stock:{" "}
            {product.quantity > 0 ? `${product.quantity} left` : "Out of stock"}
          </div>
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              product.quantity > 0
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={product.quantity === 0}
          >
            <ShoppingCartIcon className="h-4 w-4 inline mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="mt-1 text-sm text-gray-600">
                Discover products from all our stores • {totalCount} products
                found
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="toys">Toys</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No products found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {products.length > 0 && products.length < totalCount && (
              <div className="text-center mt-12">
                <button
                  onClick={() => {
                    /* Implement load more */
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
