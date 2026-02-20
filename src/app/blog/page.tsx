"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";
import { Card, Button, Spinner } from "@/components";
import { formatDate } from "@/utils";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography, spacing } = THEME_CONSTANTS;

const CATEGORY_TABS: { key: "" | BlogPostCategory; label: string }[] = [
  { key: "", label: "All" },
  { key: "news", label: "News" },
  { key: "tips", label: "Tips" },
  { key: "guides", label: "Guides" },
  { key: "updates", label: "Updates" },
  { key: "community", label: "Community" },
];

const CATEGORY_BADGE: Record<BlogPostCategory, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  tips: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  guides:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  updates:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  community:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

function BlogCard({ post }: { post: BlogPostDocument }) {
  return (
    <Link href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`} className="block group">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
        {post.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
            >
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="text-yellow-500 text-sm">★</span>
            )}
          </div>
          <h3
            className={`${typography.h4} ${themed.textPrimary} mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2`}
          >
            {post.title}
          </h3>
          <p className={`text-sm ${themed.textSecondary} mb-4 line-clamp-3`}>
            {post.excerpt}
          </p>
          <div
            className={`flex items-center justify-between text-xs ${themed.textSecondary}`}
          >
            <span>{post.authorName}</span>
            <div className="flex items-center gap-3">
              <span>
                {post.readTimeMinutes} {LABELS.READ_TIME}
              </span>
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

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
        {/* Category tabs */}
        <div className={`flex gap-2 flex-wrap mb-8 ${spacing.inline}`}>
          {CATEGORY_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeCategory === tab.key ? "primary" : "outline"}
              onClick={() => handleCategoryChange(tab.key)}
              className="text-sm"
            >
              {tab.label}
            </Button>
          ))}
        </div>

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
            {/* Featured post (first page only, category all) */}
            {featuredPost && page === 1 && (
              <div className="mb-10">
                <Link
                  href={`${ROUTES.PUBLIC.BLOG}/${featuredPost.slug}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="md:flex">
                      {featuredPost.coverImage && (
                        <div className="md:w-1/2 relative">
                          <img
                            src={featuredPost.coverImage}
                            alt={featuredPost.title}
                            className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-8 md:w-1/2 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[featuredPost.category]}`}
                          >
                            {featuredPost.category}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                        <h2
                          className={`${typography.h3} ${themed.textPrimary} mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}
                        >
                          {featuredPost.title}
                        </h2>
                        <p
                          className={`${themed.textSecondary} mb-4 line-clamp-3`}
                        >
                          {featuredPost.excerpt}
                        </p>
                        <div
                          className={`flex items-center gap-4 text-xs ${themed.textSecondary}`}
                        >
                          <span>{featuredPost.authorName}</span>
                          <span>
                            {featuredPost.readTimeMinutes} {LABELS.READ_TIME}
                          </span>
                          {featuredPost.publishedAt && (
                            <span>{formatDate(featuredPost.publishedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
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
