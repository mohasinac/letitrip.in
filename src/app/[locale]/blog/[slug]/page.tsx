"use client";

import { use } from "react";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";
import { Card, Button, Spinner } from "@/components";
import { formatDate } from "@/utils";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography } = THEME_CONSTANTS;

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useApiQuery<{
    post: BlogPostDocument;
    related: BlogPostDocument[];
  }>({
    queryKey: ["blog", "post", slug],
    queryFn: () => apiClient.get(API_ENDPOINTS.BLOG.GET_BY_SLUG(slug)),
  });

  const post = data?.post;
  const related = data?.related || [];

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex flex-col items-center justify-center gap-4 p-8`}
      >
        <h1 className={`${typography.h3} ${themed.textPrimary}`}>
          Post not found
        </h1>
        <p className={`${themed.textSecondary}`}>
          This article doesn&apos;t exist or is no longer available.
        </p>
        <Link href={ROUTES.PUBLIC.BLOG}>
          <Button variant="primary">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div
          className={`flex items-center gap-2 text-sm ${themed.textSecondary} mb-8`}
        >
          <Link
            href={ROUTES.PUBLIC.BLOG}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Blog
          </Link>
          <span>/</span>
          <span className="capitalize">{post.category}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
            >
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          <h1 className={`${typography.h2} ${themed.textPrimary} mb-4`}>
            {post.title}
          </h1>
          <p className={`text-lg ${themed.textSecondary} mb-6`}>
            {post.excerpt}
          </p>
          <div
            className={`flex flex-wrap items-center gap-4 text-sm ${themed.textSecondary}`}
          >
            <span>
              {LABELS.AUTHOR}: <strong>{post.authorName}</strong>
            </span>
            <span>
              {post.readTimeMinutes} {LABELS.READ_TIME}
            </span>
            {post.publishedAt && (
              <span>
                {LABELS.PUBLISHED_ON} {formatDate(post.publishedAt)}
              </span>
            )}
            <span>{post.views} views</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${themed.bgSecondary} ${themed.textSecondary}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <Card className="p-8 mb-12">
          <div
            className={`prose dark:prose-invert max-w-none ${themed.textPrimary}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h2 className={`${typography.h3} ${themed.textPrimary} mb-6`}>
              {LABELS.RELATED}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`${ROUTES.PUBLIC.BLOG}/${rel.slug}`}
                  className="block group"
                >
                  <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    {rel.coverImage && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={rel.coverImage}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3
                        className={`text-sm font-semibold ${themed.textPrimary} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2`}
                      >
                        {rel.title}
                      </h3>
                      <p className={`text-xs ${themed.textSecondary} mt-1`}>
                        {rel.readTimeMinutes} {LABELS.READ_TIME}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link href={ROUTES.PUBLIC.BLOG}>
            <Button variant="outline">
              &larr; {UI_LABELS.ACTIONS.BACK} to Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
