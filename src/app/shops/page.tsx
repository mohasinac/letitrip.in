"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Filter, Grid, List, AlertCircle } from "lucide-react";
import { FormSelect } from "@/components/forms";
import { AdvancedPagination } from "@/components/common/AdvancedPagination";
import { ShopCard } from "@/components/cards/ShopCard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { SHOP_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { shopsService } from "@/services/shops.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import type { ShopCardFE } from "@/types/frontend/shop.types";

function ShopsContent() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Use URL filters hook
  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters: resetUrlFilters,
    sort,
    setSort,
    page,
    setPage,
    limit,
    setLimit,
  } = useUrlFilters({
    initialFilters: {
      categoryId: "",
      minRating: "",
      isVerified: "",
      featured: "",
      view: "grid",
    },
    initialSort: { field: "rating", order: "desc" },
    initialPage: 1,
    initialLimit: 20,
  });

  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [totalShops, setTotalShops] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Extract view from filters
  const view = (filters.view as "grid" | "list") || "grid";

  const loadShops = useCallback(async () => {
    await execute(async () => {
      const startAfter = cursors[page - 1];

      // Build filter params
      const apiFilters: any = {
        startAfter: startAfter || undefined,
        limit,
        sortBy: sort?.field || "rating",
        sortOrder: sort?.order || "desc",
      };

      if (filters.categoryId) apiFilters.categoryId = filters.categoryId;
      if (filters.minRating) apiFilters.minRating = Number(filters.minRating);
      if (filters.isVerified === "true") apiFilters.isVerified = true;
      if (filters.featured === "true") apiFilters.featured = true;

      const response = await shopsService.list(apiFilters);
      setShops(response.data || []);
      setTotalShops(response.count || 0);

      // Store cursor for next page
      if (
        "hasNextPage" in response.pagination &&
        "nextCursor" in response.pagination
      ) {
        const cursorPagination = response.pagination as any;
        if (cursorPagination.nextCursor && !cursors[page]) {
          setCursors((prev) => {
            const newCursors = [...prev];
            newCursors[page] = cursorPagination.nextCursor || null;
            return newCursors;
          });
        }
      }
    });
  }, [cursors, page, limit, sort, filters, execute]);

  // Load shops when filters, sort, or page changes
  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const handleReset = useCallback(() => {
    resetUrlFilters();
    updateFilter("view", "grid");
    setShowFilters(false);
    setCursors([null]);
  }, [resetUrlFilters, updateFilter]);

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

        {/* Controls */}
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
            <FormSelect
              id="shops-sort-by"
              value={sort?.field || "rating"}
              onChange={(e) =>
                setSort({ field: e.target.value, order: sort?.order || "desc" })
              }
              options={[
                { value: "rating", label: "Highest Rated" },
                { value: "products", label: "Most Products" },
                { value: "newest", label: "Newest" },
              ]}
              compact
            />

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => updateFilter("view", "grid")}
                className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                  view === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => updateFilter("view", "list")}
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
              values={filters}
              onChange={(key, value) => updateFilter(key, value)}
              onApply={(pendingValues) => {
                if (pendingValues) updateFilters(pendingValues);
                setCursors([null]);
              }}
              onReset={handleReset}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              searchable={true}
              mobile={true}
              resultCount={totalShops}
              isLoading={isLoading}
            />
          )}

          {/* Shops Grid */}
          <div className="flex-1">
            {error ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  {error.message}
                </p>
                <button
                  onClick={loadShops}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
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

                {/* Pagination */}
                {totalShops > 0 && (
                  <div className="mt-8">
                    <AdvancedPagination
                      currentPage={page}
                      totalPages={Math.ceil(totalShops / limit)}
                      pageSize={limit}
                      totalItems={totalShops}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        if (newPage === 1) setCursors([null]);
                        globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
                      }}
                      onPageSizeChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                        setCursors([null]);
                      }}
                      showPageSizeSelector
                      showPageInput
                      showFirstLast
                    />
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
            values={filters}
            onChange={(key, value) => updateFilter(key, value)}
            onApply={(pendingValues) => {
              if (pendingValues) updateFilters(pendingValues);
              setCursors([null]);
              setShowFilters(false);
            }}
            onReset={handleReset}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalShops}
            isLoading={isLoading}
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
