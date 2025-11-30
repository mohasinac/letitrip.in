"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Filter, Grid, List } from "lucide-react";
import { ShopCard } from "@/components/cards/ShopCard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { SHOP_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { shopsService } from "@/services/shops.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";

function ShopsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "rating"
  );
  const [sortOrder, setSortOrder] = useState<string>(
    searchParams.get("sortOrder") || "desc"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [totalShops, setTotalShops] = useState(0);

  // Cursor-based pagination
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 20;

  // Unified filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Load on sort/page change
  useEffect(() => {
    loadShops();
  }, [sortBy, sortOrder, currentPage]);

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      const startAfter = cursors[currentPage - 1];

      const response = await shopsService.list({
        startAfter: startAfter || undefined,
        limit,
        sortBy,
        sortOrder,
        ...filterValues,
      });

      setShops(response.data || []);
      setTotalShops(response.count || 0);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store cursor for next page
        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load shops:", error);
    } finally {
      setLoading(false);
    }
  }, [cursors, currentPage, limit, sortBy, sortOrder, filterValues]);

  const handleReset = useCallback(() => {
    setFilterValues({});
    setSortBy("rating");
    setSortOrder("desc");
    setCurrentPage(1);
    setCursors([null]);
    setShowFilters(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Shops
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover trusted sellers and their unique collections
          </p>
        </div>

        {/* Controls - No Search (use main search bar) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? "Hide" : "Show"} Filters</span>
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 touch-manipulation"
            >
              <option value="rating">Highest Rated</option>
              <option value="products">Most Products</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                  view === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
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
              onApply={(pendingValues) => {
                if (pendingValues) setFilterValues(pendingValues);
                setCurrentPage(1);
                setCursors([null]);
                setTimeout(() => loadShops(), 0);
              }}
              onReset={handleReset}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  No shops found
                </p>
                <button
                  onClick={handleReset}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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
                        logo={shop.logo || undefined}
                        banner={shop.banner || undefined}
                        rating={shop.rating}
                        reviewCount={shop.reviewCount || 0}
                        productCount={shop.productCount || shop.totalProducts}
                        isVerified={shop.isVerified}
                        featured={shop.featured}
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
                        logo={shop.logo || undefined}
                        banner={shop.banner || undefined}
                        rating={shop.rating}
                        reviewCount={shop.reviewCount || 0}
                        productCount={shop.productCount || shop.totalProducts}
                        isVerified={shop.isVerified}
                        featured={shop.featured}
                        location={shop.location}
                        showBanner={false}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!loading &&
              shops.length > 0 &&
              (hasNextPage || currentPage > 1) && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    disabled={currentPage === 1}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage}{" "}
                    {shops.length > 0 && `(${shops.length} shops)`}
                  </span>

                  <button
                    onClick={() => {
                      if (hasNextPage) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    disabled={!hasNextPage}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
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
            onApply={(pendingValues) => {
              if (pendingValues) setFilterValues(pendingValues);
              setCurrentPage(1);
              setCursors([null]);
              setShowFilters(false);
              setTimeout(() => loadShops(), 0);
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

export default function ShopsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ShopsContent />
    </Suspense>
  );
}
