"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import {
  Button,
  Spinner,
  BlogCard,
  BlogFeaturedCard,
  BlogCategoryTabs,
} from "@/components";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const { themed, typography } = THEME_CONSTANTS;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<"" | BlogPostCategory>(
    "",
  );
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const apiUrl =
    `${API_ENDPOINTS.BLOG.LIST}?page=${page}&pageSize=${pageSize}` +
    (activeCategory ? `&category=${activeCategory}` : "");

  const { data, isLoading, error } = useApiQuery<{
    posts: BlogPostDocument[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["blog", activeCategory, String(page)],
    queryFn: () => apiClient.get(apiUrl),
  });

  const posts = data?.posts || [];
  const totalPages = data?.meta.totalPages ?? 1;

  const featuredPost = posts.find((p) => p.isFeatured);
  const regularPosts =
    featuredPost && page === 1
      ? posts.filter((p) => p.id !== featuredPost.id)
      : posts;

  const handleCategoryChange = (key: "" | BlogPostCategory) => {
    setActiveCategory(key);
    setPage(1);
  };

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Insights, guides, and updates from the LetItRip team
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogCategoryTabs
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
        />

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className={`${themed.textSecondary}`}>
              {UI_LABELS.LOADING.FAILED}
            </p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <p className={`${typography.h4} ${themed.textSecondary}`}>
              No posts yet
            </p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <>
            {featuredPost && page === 1 && (
              <BlogFeaturedCard post={featuredPost} />
            )}

            {/* Grid of posts */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {UI_LABELS.ACTIONS.BACK}
                </Button>
                <span className={`text-sm ${themed.textSecondary}`}>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {UI_LABELS.ACTIONS.NEXT}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
