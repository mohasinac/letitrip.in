/**
 * @fileoverview React Component
 * @module src/app/blog/BlogListClient
 * @description This file contains the BlogListClient component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { BlogCard } from "@/components/cards/BlogCard";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import type { BlogPost } from "@/services/blog.service";
import { blogService, type BlogFilters } from "@/services/blog.service";
import { Calendar, ChevronLeft, ChevronRight, Filter, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default /**
 * Performs blog list client operation
 *
 * @returns {any} The bloglistclient result
 *
 */
function BlogListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const {
    /** Is Loading */
    isLoading: loading,
    error,
    /** Data */
    data: blogs,
    /** Set Data */
    setData: setBlogs,
    execute,
  } = useLoadingState<BlogPost[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (err) => {
      logError(err, {
        /** Component */
        component: "BlogListClient.fetchBlogs",
        /** Metadata */
        metadata: { filters },
      });
    },
  });

  // Filters from URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [filters, setFilters] = useState<BlogFilters>({
    /** Status */
    status: "published",
    /** Limit */
    limit: 12,
    /** Sort By */
    sortBy: (searchParams.get("sortBy") as any) || "publishedAt",
    /** Sort Order */
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    /** Category */
    category: searchParams.get("category") || undefined,
    /** Featured */
    featured: searchParams.get("featured") === "true" || undefined,
    /** Search */
    search: searchParams.get("search") || undefined,
  });

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.category) params.set("category", filters.category);
    if (filters.featured) params.set("featured", "true");

    router.push(`/blog?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const fetchBlogs = async () => {
    await execute(async () => {
      const startAfter = cursors[currentPage - 1];
      const response = await blogService.list({
        ...filters,
        /** Start After */
        startAfter: startAfter || undefined,
        /** Search */
        search: filters.search || undefined,
      });

      const blogData = response.data || [];

      // Check if it's cursor pagination
      if (response.pagination && "hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in response.pagination) {
          /**
 * Performs cursor pagination operation
 *
 * @param {any} cursorPagination.nextCursor - The cursorpagination.nextcursor
 *
 * @returns {any} The cursorpagination result
 *
 */
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

      return blogData;
    });
  };

  /**
   * Handles search event
   *
   * @param {string} [searchValue] - The search value
   *
   * @returns {string} The handlesearch result
   */

  /**
   * Handles search event
   *
   * @param {string} [searchValue] - The search value
   *
   * @returns {string} The handlesearch result
   */

  const handleSearch = (searchValue?: string) => {
    setFilters((prev) => ({
      ...prev,
      /** Search */
      search: searchValue || searchQuery,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  /**
   * Handles category filter event
   *
   * @param {string} category - The category
   *
   * @returns {string} The handlecategoryfilter result
   */

  /**
   * Handles category filter event
   *
   * @param {string} category - The category
   *
   * @returns {string} The handlecategoryfilter result
   */

  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      /** Category */
      category: prev.category === category ? undefined : category,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  /**
   * Handles sort change event
   *
   * @param {string} sortBy - The sort by
   *
   * @returns {string} The handlesortchange result
   */

  /**
   * Handles sort change event
   *
   * @param {string} sortBy - The sort by
   *
   * @returns {string} The handlesortchange result
   */

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      /** Sort By */
      sortBy: sortBy as any,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  /**
   * Handles prev page event
   *
   * @returns {any} The handleprevpage result
   */

  /**
   * Handles prev page event
   *
   * @returns {any} The handleprevpage result
   */

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Handles next page event
   *
   * @returns {any} The handlenextpage result
   */

  /**
   * Handles next page event
   *
   * @returns {any} The handlenextpage result
   */

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Blog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover articles, guides, and stories about collectibles and auctions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sort */}
          <div className="lg:col-span-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="publishedAt">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>

          {/* Empty spacer */}
          <div></div>

          {/* Filter Toggle for Mobile */}
          <button className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Active Filters */}
        {filters.category && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active filters:
            </span>
            <button
              onClick={() => handleCategoryFilter(filters.category!)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              <Tag className="w-3 h-3" />
              <span>{filters.category}</span>
              <span className="ml-1">×</span>
            </button>
          </div>
        )}
      </div>

      {/* Featured Posts Section */}
      {filters.page === 1 && !filters.search && !filters.category && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Posts
          </h2>
          {/* Featured posts would go here */}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-800 dark:text-red-400">
            {error?.message || "An error occurred"}
          </p>
          <button
            onClick={fetchBlogs}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Grid */}
      {!loading && blogs && blogs.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                slug={blog.slug}
                excerpt={blog.excerpt}
                featuredImage={blog.featuredImage}
                author={blog.author}
                category={blog.category}
                tags={blog.tags}
                publishedAt={blog.publishedAt}
                views={blog.views}
                likes={blog.likes}
                featured={blog.featured}
              />
            ))}
          </div>

          {/* Pagination */}
          {blogs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-12">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} • {blogs.length} posts
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && (!blogs || blogs.length === 0) && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No blog posts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filters.search || filters.category
              ? "Try adjusting your filters"
              : "Check back later for new content"}
          </p>
          {(filters.search || filters.category) && (
            <button
              onClick={() =>
                setFilters({
                  /** Status */
                  status: "published",
                  /** Page */
                  page: 1,
                  /** Limit */
                  limit: 12,
                  /** Sort By */
                  sortBy: "publishedAt",
                  /** Sort Order */
                  sortOrder: "desc",
                })
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
