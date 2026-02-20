"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography } = THEME_CONSTANTS;

export const CATEGORY_BADGE: Record<BlogPostCategory, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  tips: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  guides:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  updates:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  community:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

export function BlogCard({ post }: { post: BlogPostDocument }) {
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
