"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, Grid, List } from "lucide-react";
import { ShopCard } from "@/components/cards/ShopCard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { SHOP_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { shopsService } from "@/services/shops.service";
import type { Shop } from "@/types";

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<string>("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [totalShops, setTotalShops] = useState(0);

  // Unified filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  useEffect(() => {
    loadShops();
  }, [filterValues, sortBy, searchQuery]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await shopsService.list({
        search: searchQuery || undefined,
        ...filterValues,
        limit: 100,
      });

      let shopsData = response.data || [];

      // Sort shops
      if (sortBy === "rating") {
        shopsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === "products") {
        shopsData.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      } else if (sortBy === "newest") {
        shopsData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      setShops(shopsData);
      setTotalShops(shopsData.length);
    } catch (error) {
      console.error("Failed to load shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterValues({});
    setSortBy("rating");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Shops
          </h1>
          <p className="text-gray-600">
            Discover trusted sellers and their unique collections
          </p>
        </div>

        {/* Search & Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadShops()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={loadShops}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="products">Most Products</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
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
                onClick={() => setView("list")}
                className={`px-3 py-2 ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <UnifiedFilterSidebar
              sections={SHOP_FILTERS}
              values={filterValues}
              onChange={(key, value) => {
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onApply={() => {}}
              onReset={handleReset}
              isOpen={true}
              onClose={() => {}}
              searchable={true}
              mobile={false}
              resultCount={totalShops}
              isLoading={loading}
            />
          )}

          {/* Shops Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : shops.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No shops found</p>
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {shops.length} shop{shops.length !== 1 ? "s" : ""}
                </div>

                {view === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        id={shop.id}
                        name={shop.name}
                        slug={shop.slug}
                        description={shop.description || ""}
                        logo={shop.logo}
                        banner={shop.banner}
                        rating={shop.rating}
                        reviewCount={shop.reviewCount}
                        productCount={shop.productCount}
                        isVerified={shop.isVerified}
                        isFeatured={shop.isFeatured}
                        location={shop.location}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        id={shop.id}
                        name={shop.name}
                        slug={shop.slug}
                        description={shop.description || ""}
                        logo={shop.logo}
                        banner={shop.banner}
                        rating={shop.rating}
                        reviewCount={shop.reviewCount}
                        productCount={shop.productCount}
                        isVerified={shop.isVerified}
                        isFeatured={shop.isFeatured}
                        location={shop.location}
                        showBanner={false}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={SHOP_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={() => {
              setShowFilters(false);
            }}
            onReset={handleReset}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalShops}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}
