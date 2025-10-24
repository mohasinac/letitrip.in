"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  productCount: number;
  category: string;
  featured: boolean;
  established?: string;
  website?: string;
  popularProducts: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    // TODO: Fetch brands from Firebase/API
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/brands");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBrands(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const categories = Array.from(new Set(brands.map((brand) => brand.category)));

  const filteredAndSortedBrands = brands
    .filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || brand.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "products":
          return b.productCount - a.productCount;
        case "newest":
          return 0; // Would sort by date in real implementation
        default:
          return 0;
      }
    });

  const featuredBrands = brands.filter((brand) => brand.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Brands
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover products from the world's most trusted and innovative
              brands. Find quality, authenticity, and excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Brands */}
      {featuredBrands.length > 0 && (
        <div className="container py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Brands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {brand.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {brand.productCount} Products
                </p>
                <Link
                  href={`/products?brand=${brand.id}`}
                  className="btn btn-outline btn-sm w-full"
                >
                  View Products
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Brands
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="select w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="select w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="products">Product Count</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            All Brands ({filteredAndSortedBrands.length})
          </h2>
        </div>

        {filteredAndSortedBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Brand Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {brand.productCount} Products • {brand.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {brand.description}
                  </p>
                </div>

                {/* Popular Products */}
                {brand.popularProducts.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Popular Products
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {brand.popularProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="text-center">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs font-medium text-gray-900">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 pt-0">
                  <div className="flex space-x-2">
                    <Link
                      href={`/products?brand=${brand.id}`}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      View All Products
                    </Link>
                    {brand.website && (
                      <a
                        href={`https://${brand.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline text-sm px-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No brands found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
