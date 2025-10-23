"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  // Mock search results
  const mockResults = [
    {
      id: "1",
      name: "Premium Beyblade Stadium Pro",
      slug: "premium-stadium-pro",
      price: 2999,
      compareAtPrice: 3999,
      image: "/images/product-1.jpg",
      category: "Stadiums",
      relevanceScore: 95,
    },
    {
      id: "2",
      name: "Metal Fusion Beyblade Set",
      slug: "metal-fusion-set",
      price: 1499,
      compareAtPrice: 1999,
      image: "/images/product-2.jpg",
      category: "Beyblades",
      relevanceScore: 88,
    },
    {
      id: "3",
      name: "Launcher Grip Pro",
      slug: "launcher-grip-pro",
      price: 799,
      image: "/images/product-3.jpg",
      category: "Launchers",
      relevanceScore: 75,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const timer = setTimeout(() => {
      if (query) {
        // Filter results based on query
        const filtered = mockResults.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "relevance":
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });

  const categories = [...new Set(results.map((r) => r.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b">
          <div className="container py-8">
            <h1 className="text-3xl font-bold mb-2">
              {query ? `Search Results for "${query}"` : "Search Products"}
            </h1>
            {query && (
              <p className="text-muted-foreground">
                {loading
                  ? "Searching..."
                  : `${results.length} ${
                      results.length === 1 ? "result" : "results"
                    } found`}
              </p>
            )}
          </div>
        </div>

        <div className="container py-8">
          {!query ? (
            /* No Search Query */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                What are you looking for?
              </h2>
              <p className="text-muted-foreground mb-8">
                Use the search bar above to find products, or browse our
                categories
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {["Beyblades", "Launchers", "Stadiums", "Accessories"].map(
                  (category) => (
                    <Link
                      key={category}
                      href={`/categories/${category.toLowerCase()}`}
                      className="card p-4 text-center hover:shadow-lg transition-shadow group"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">
                          {category === "Beyblades" && "⚡"}
                          {category === "Launchers" && "🚀"}
                          {category === "Stadiums" && "🏟️"}
                          {category === "Accessories" && "🎯"}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {category}
                      </h3>
                    </Link>
                  )
                )}
              </div>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Searching for "{query}"...
              </p>
            </div>
          ) : results.length === 0 ? (
            /* No Results */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.016-5.71-2.646"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-8">
                We couldn't find any products matching "{query}"
              </p>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Try:</p>
                  <ul className="space-y-1">
                    <li>• Checking your spelling</li>
                    <li>• Using more general terms</li>
                    <li>• Browsing our categories</li>
                  </ul>
                </div>
                <Link href="/products" className="btn btn-primary">
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium">
                    Filter by category:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-full transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input text-sm py-1"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Search Suggestions */}
              {query && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Related searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Metal Fusion",
                      "Tournament Stadium",
                      "Launcher Set",
                      "Beyblade Accessories",
                    ].map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="px-3 py-1 bg-white hover:bg-gray-50 text-sm rounded border transition-colors"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedResults.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Load More */}
              {results.length > 0 && (
                <div className="text-center mt-12">
                  <button className="btn btn-outline">Load More Results</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Searches */}
        {!query && (
          <section className="py-16 bg-white">
            <div className="container">
              <h2 className="text-2xl font-bold text-center mb-8">
                Popular Searches
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Beyblade Metal Fusion",
                  "Tournament Stadium",
                  "Launcher Grip",
                  "Burst Series",
                  "Metal Fight",
                  "Beyblade Arena",
                  "Custom Launcher",
                  "Rare Beyblades",
                ].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading search...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
