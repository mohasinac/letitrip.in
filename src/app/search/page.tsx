"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/cards/ProductCard";
import { ShopCard } from "@/components/cards/ShopCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [activeTab, setActiveTab] = useState<
    "all" | "products" | "shops" | "categories"
  >("all");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch(query, activeTab);
    }
  }, [query, activeTab]);

  const performSearch = async (searchQuery: string, type: string) => {
    try {
      setLoading(true);
      const response = await productsService.list({
        search: searchQuery,
        limit: 50,
      });
      // For now, just return products - proper multi-type search would need separate services
      setResults({
        products: response.data || [],
        shops: [],
        categories: [],
        total: response.count || 0,
      });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All", count: results?.total || 0 },
    {
      id: "products",
      label: "Products",
      count: results?.products?.length || 0,
    },
    { id: "shops", label: "Shops", count: results?.shops?.length || 0 },
    {
      id: "categories",
      label: "Categories",
      count: results?.categories?.length || 0,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600 mt-1">
            {results?.total || 0} results found
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && results.total > 0 ? (
          <div className="space-y-8">
            {/* Products */}
            {(activeTab === "all" || activeTab === "products") &&
              results.products?.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Products ({results.products.length})
                    </h2>
                  )}
                  <CardGrid>
                    {results.products.map((product: any) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </CardGrid>
                </div>
              )}

            {/* Shops */}
            {(activeTab === "all" || activeTab === "shops") &&
              results.shops?.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Shops ({results.shops.length})
                    </h2>
                  )}
                  <CardGrid>
                    {results.shops.map((shop: any) => (
                      <ShopCard key={shop.id} {...shop} />
                    ))}
                  </CardGrid>
                </div>
              )}

            {/* Categories */}
            {(activeTab === "all" || activeTab === "categories") &&
              results.categories?.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Categories ({results.categories.length})
                    </h2>
                  )}
                  <CardGrid>
                    {results.categories.map((category: any) => (
                      <CategoryCard key={category.id} {...category} />
                    ))}
                  </CardGrid>
                </div>
              )}
          </div>
        ) : (
          <EmptyState
            title="No results found"
            description={`We couldn't find any results for "${query}". Try different keywords or browse our categories.`}
            action={{
              label: "Browse Categories",
              onClick: () => (window.location.href = "/categories"),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
