"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Tag,
  Loader2,
  Search,
  List,
  ChevronLeft,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [loading, setLoading] = useState(true);

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters from URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "sort_order",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  );
  const [featured, setFeatured] = useState(
    searchParams.get("featured") === "true",
  );

  useEffect(() => {
    loadCategories();
  }, [currentPage, sortBy, sortOrder, featured]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (featured) params.set("featured", "true");

    router.push(`/categories?${params.toString()}`, { scroll: false });
  }, [searchQuery, sortBy, sortOrder, featured]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const startAfter = cursors[currentPage - 1];
      const response = await categoriesService.list({
        startAfter,
        limit: 50,
        sortBy,
        sortOrder,
        featured: featured || undefined,
        search: searchQuery || undefined,
      });

      setCategories(response.data || []);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
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
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setCursors([null]);
    loadCategories();
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === "sortBy") setSortBy(value);
    else if (key === "sortOrder") setSortOrder(value);
    else if (key === "featured") setFeatured(value);

    setCurrentPage(1);
    setCursors([null]);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Group categories by level for display
  const categoriesByLevel = useMemo(() => {
    const grouped = new Map<number, CategoryFE[]>();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            title="No categories available"
            description="Categories will appear here once they are added."
            action={{
              label: "Go to Home",
              onClick: () => (window.location.href = "/"),
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
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Browse Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover {categories.length} categories and thousands of products
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </form>

                {/* Sort */}
                <div className="sm:w-64">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sort_order">Default Order</option>
                    <option value="name">Alphabetically</option>
                    <option value="product_count">By Product Count</option>
                    <option value="created_at">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Filter Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleFilterChange("featured", !featured)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    featured
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  ⭐ Featured Only
                </button>
              </div>
            </div>
          </div>
        </div>

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
                  {levelCategories.length === 1 ? "category" : "categories"})
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
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

          {/* Empty state for search */}
          {categoriesByLevel.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `No categories found matching "${searchQuery}"`
                  : "No categories found"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {categories.length > 0 && (
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
                Page {currentPage} • {categories.length} categories
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
