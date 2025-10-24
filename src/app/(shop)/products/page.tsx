"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useFirebase";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products from Firebase with real-time updates
  const {
    products: allProducts,
    loading,
    error,
  } = useProducts({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 50,
  });

  // Filter and sort products
  const products = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "beyblades", name: "Beyblades" },
    { id: "launchers", name: "Launchers" },
    { id: "stadiums", name: "Stadiums" },
    { id: "accessories", name: "Accessories" },
  ];

  return (
    
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="container py-8">
            <h1 className="text-3xl font-bold mb-2">All Products</h1>
            <p className="text-muted-foreground">
              Discover our complete collection
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="card p-6 sticky top-20 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Search</h3>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="input w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

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
                    <button className="btn btn-outline w-full text-sm">
                      Apply
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Availability</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">In Stock</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Pre-order</span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-secondary w-full">
                  Clear Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {products.length} products
                </p>
                <select
                  className="input w-full sm:w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-muted-foreground">
                      Showing mock data as fallback
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      No products found matching your criteria.
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      image={
                        product.images[0]?.url || "/placeholder-product.jpg"
                      }
                      slug={product.slug}
                      isFeatured={product.isFeatured}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline px-4 py-2" disabled>
                    Previous
                  </button>
                  <button className="btn btn-primary px-4 py-2">1</button>
                  <button className="btn btn-outline px-4 py-2">2</button>
                  <button className="btn btn-outline px-4 py-2">3</button>
                  <button className="btn btn-outline px-4 py-2">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
