"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useGlobalCategories } from "@/contexts/CategoriesContext";
import ProductCard from "@/components/products/ProductCard";
import { Category, Product } from "@/types";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const { categories, loading: categoriesLoading } = useGlobalCategories();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  // Find the current category
  const category = categories.find((cat) => cat.slug === params.slug);

  // Get subcategories for this category
  const subcategories = categories.filter(
    (cat) => cat.parentId === category?.id
  );

  // Filter products for this category
  const categoryProducts = products.filter(
    (product) =>
      product.category === params.slug ||
      subcategories.some((sub) => sub.slug === product.category)
  );

  // Apply filters
  const filteredProducts = categoryProducts.filter((product) => {
    const matchesSubcategory =
      selectedSubcategory === "all" || product.category === selectedSubcategory;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSubcategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
    }
  });

  const loading = categoriesLoading || productsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <Link href="/products" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Category Hero */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container py-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">{category.icon || "📦"}</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                <p className="text-lg text-purple-100">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {categoryProducts.length}+
                </div>
                <div className="text-sm text-purple-200">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-purple-200">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm text-purple-200">Fast Delivery</div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/products" className="hover:text-primary">
                Products
              </Link>
              <span>/</span>
              <span className="text-foreground">{category.name}</span>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="card p-6 sticky top-20 space-y-6">
                {/* Subcategories */}
                <div>
                  <h3 className="font-semibold mb-4">Subcategories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubcategory("all")}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedSubcategory === "all"
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      All {category.name}
                    </button>
                    {subcategories.map((subcategory: Category) => (
                      <button
                        key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedSubcategory === subcategory.slug
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        placeholder="Min"
                        className="input w-full"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="input w-full"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                      />
                    </div>

                    {/* Quick Price Filters */}
                    <div className="space-y-2">
                      {[
                        { label: "Under ₹500", range: [0, 500] },
                        { label: "₹500 - ₹1000", range: [500, 1000] },
                        { label: "₹1000 - ₹2000", range: [1000, 2000] },
                        { label: "Over ₹2000", range: [2000, 10000] },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() =>
                            setPriceRange(option.range as [number, number])
                          }
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-4">Features</h3>
                  <div className="space-y-2">
                    {[
                      "Authentic",
                      "Limited Edition",
                      "Tournament Grade",
                      "Beginner Friendly",
                    ].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold mb-4">Customer Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm ml-1">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="btn btn-secondary w-full">
                  Clear All Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {sortedProducts.length} products
                  {selectedSubcategory !== "all" &&
                    ` in ${
                      subcategories.find(
                        (sub) => sub.slug === selectedSubcategory
                      )?.name || selectedSubcategory
                    }`}
                </p>
                <select
                  className="input w-full sm:w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Featured Banner */}
              {selectedSubcategory === "all" && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        🔥 Hot Deals on {category.name}
                      </h3>
                      <p className="text-orange-100">
                        Get up to 40% off on selected items this week!
                      </p>
                    </div>
                    <Link
                      href="/deals"
                      className="btn bg-white text-orange-600 hover:bg-gray-100"
                    >
                      View Deals
                    </Link>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product: Product) => (
                    <div key={product.id} className="relative">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        compareAtPrice={product.compareAtPrice}
                        image={
                          (typeof product.images?.[0] === "string"
                            ? product.images[0]
                            : product.images?.[0]?.url) ||
                          "/images/products/default.jpg"
                        }
                      />
                      {product.tags?.includes("limited") && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                            LIMITED
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-gray-400">
                      {category.icon || "📦"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    No products match your current filters
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSubcategory("all");
                      setPriceRange([0, 10000]);
                    }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Load More */}
              {sortedProducts.length > 0 && (
                <div className="text-center mt-12">
                  <button className="btn btn-outline">
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Info */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Why Choose Our {category.name}?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">100% Authentic</h3>
                      <p className="text-sm text-muted-foreground">
                        All products are sourced directly from authorized
                        distributors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Fast Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Get your orders delivered within 1-3 business days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Quality Guaranteed</h3>
                      <p className="text-sm text-muted-foreground">
                        7-day return policy for your peace of mind
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl overflow-hidden">
                  <img
                    src="/images/category-info.jpg"
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
