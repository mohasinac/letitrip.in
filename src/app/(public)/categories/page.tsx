"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import OptimizedImage from "@/components/common/OptimizedImage";
import { FormSelect } from "@/components/forms/FormSelect";
import { CATEGORY_FILTERS } from "@/constants/filters";
import { useLoadingState } from "@/hooks/useLoadingState";
import { useIsMobile } from "@/hooks/useMobile";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Loader2,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [view, setView] = useState<"grid" | "list">("grid");
  const {
    isLoading: loading,
    data: categories,
    setData: setCategories,
    execute,
  } = useLoadingState<CategoryFE[]>({
    initialData: [],
    onLoadError: (err) => {
      logError(err, { component: "CategoriesPage.loadCategories" });
    },
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState(CATEGORY_FILTERS);
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "sort_order"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
  );

  // Initialize filters from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const initialFilters: Record<string, any> = {};

    if (params.get("featured") === "true") initialFilters.is_featured = true;
    if (params.get("is_homepage") === "true") initialFilters.is_homepage = true;
    if (params.get("is_leaf") === "true") initialFilters.is_leaf = true;
    if (params.get("parent_id"))
      initialFilters.parent_id = params.get("parent_id");
    if (params.get("sortBy")) setSortBy(params.get("sortBy") || "sort_order");
    if (params.get("sortOrder"))
      setSortOrder((params.get("sortOrder") as "asc" | "desc") || "asc");

    if (Object.keys(initialFilters).length > 0) {
      setFilterValues(initialFilters);
    }

    loadFilterOptions();
  }, []);

  // Load categories when filters change
  useEffect(() => {
    loadCategories();
  }, [currentPage, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      const categoriesData = await categoriesService.list({ limit: 100 });

      // Update parent category options dynamically
      const updatedFilters = CATEGORY_FILTERS.map((section) => {
        if (section.title === "Category Level") {
          return {
            ...section,
            fields: section.fields.map((field) => {
              if (field.key === "parent_id") {
                return {
                  ...field,
                  options: [
                    { label: "Root Categories", value: "null" },
                    ...(categoriesData?.data || [])
                      .filter((cat) => !cat.isLeaf)
                      .map((cat) => ({
                        label: cat.name,
                        value: cat.id,
                      })),
                  ],
                };
              }
              return field;
            }),
          };
        }
        return section;
      });

      setFilterOptions(updatedFilters);
    } catch (error) {
      logError(error as Error, {
        component: "CategoriesPage.loadFilterOptions",
      });
    }
  };

  const loadCategories = () =>
    execute(async () => {
      const response = await categoriesService.list({
        page: currentPage,
        limit: 50,
        sortBy,
        sortOrder,
        featured: filterValues.is_featured || undefined,
        showOnHomepage: filterValues.is_homepage || undefined,
        parentId: filterValues.parent_id || undefined,
      });

      setTotalCount(response.count || response.data?.length || 0);
      setHasNextPage(response.pagination?.hasNextPage || false);
      return response.data || [];
    });

  const updateUrlAndLoad = useCallback(() => {
    const params = new URLSearchParams();

    if (filterValues.is_featured) params.set("featured", "true");
    if (filterValues.is_homepage) params.set("is_homepage", "true");
    if (filterValues.is_leaf) params.set("is_leaf", "true");
    if (filterValues.parent_id) params.set("parent_id", filterValues.parent_id);
    if (sortBy !== "sort_order") params.set("sortBy", sortBy);
    if (sortOrder !== "asc") params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("page", String(currentPage));

    router.push(
      `/categories${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
    loadCategories();
  }, [filterValues, sortBy, sortOrder, currentPage]);

  const handleResetFilters = useCallback(() => {
    setFilterValues({});
    setSortBy("sort_order");
    setSortOrder("asc");
    setCurrentPage(1);
    router.push("/categories", { scroll: false });
  }, [router]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  // Group categories by level for display
  const categoriesByLevel = useMemo(() => {
    const grouped = new Map<number, CategoryFE[]>();
    if (!categories) return [];
    categories.forEach((cat) => {
      const level = cat.level || 0;
      if (!grouped.has(level)) {
        grouped.set(level, []);
      }
      grouped.get(level)!.push(cat);
    });

    // Convert to sorted array of [level, categories]
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [categories]);

  if (loading && (!categories || categories.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!loading && (!categories || categories.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            title="No categories available"
            description={
              Object.keys(filterValues).length > 0
                ? "No categories match your filters. Try adjusting your search criteria."
                : "Categories will appear here once they are added."
            }
            action={{
              label:
                Object.keys(filterValues).length > 0
                  ? "Clear Filters"
                  : "Go to Home",
              onClick:
                Object.keys(filterValues).length > 0
                  ? handleResetFilters
                  : () => {
                      if (globalThis.location) globalThis.location.href = "/";
                    },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover {totalCount} categories and thousands of products
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-1">
              {/* Sort */}
              <FormSelect
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: "sort_order", label: "Default Order" },
                  { value: "name", label: "Alphabetically" },
                  { value: "product_count", label: "By Product Count" },
                  { value: "created_at", label: "Recently Added" },
                ]}
                className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
              />

              <FormSelect
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                options={[
                  { value: "asc", label: "Ascending" },
                  { value: "desc", label: "Descending" },
                ]}
                className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
              />

              {/* View Toggle - Hidden on mobile */}
              <div className="hidden sm:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
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

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? "Hide" : "Show"} Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 relative">
          {/* Filter Sidebar */}
          <UnifiedFilterSidebar
            sections={filterOptions}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={(pendingValues) => {
              if (pendingValues) setFilterValues(pendingValues);
              setCurrentPage(1);
              if (isMobile) setShowFilters(false);
              setTimeout(() => updateUrlAndLoad(), 0);
            }}
            onReset={handleResetFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={false}
            mobile={isMobile}
            resultCount={categories?.length || 0}
            isLoading={loading}
          />

          {/* Categories Content */}
          <div className="flex-1">
            {/* Results Count */}
            {!loading && categories && categories.length > 0 && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {categories.length} of {totalCount} categories (Page{" "}
                {currentPage})
              </div>
            )}

            {/* Categories by Level */}
            <div className="space-y-8">
              {categoriesByLevel.map(([level, levelCategories]) => (
                <div key={level} className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <List className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {level === 0
                          ? "Root Categories"
                          : `Level ${level} Categories`}
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      ({levelCategories.length}{" "}
                      {levelCategories.length === 1 ? "category" : "categories"}
                      )
                    </span>
                  </div>

                  {/* Categories Grid for this level */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {levelCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
                      >
                        {/* Category Image */}
                        {category.image && (
                          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                            <OptimizedImage
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}

                        {/* Category Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                            {category.name}
                          </h3>

                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Tag className="w-3 h-3" />
                              <span>{category.productCount} products</span>
                            </div>
                            {category.featured && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Parent indicator if not root */}
                          {level > 0 && category.hasParents && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                              <ChevronRight className="w-3 h-3" />
                              <span className="truncate">Subcategory</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Empty state for filtered results */}
              {categoriesByLevel.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No categories found with current filters
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {categories &&
              categories.length > 0 &&
              (currentPage > 1 || hasNextPage) && (
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || loading}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} • {categories?.length || 0} categories
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage || loading}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
