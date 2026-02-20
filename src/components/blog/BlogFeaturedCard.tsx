"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { CATEGORY_BADGE } from "./BlogCard";
import type { BlogPostDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography } = THEME_CONSTANTS;

export function BlogFeaturedCard({ post }: { post: BlogPostDocument }) {
  return (
    <div className="mb-10">
      <Link href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`} className="block group">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="md:flex">
            {post.coverImage && (
              <div className="md:w-1/2 relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
                >
                  {post.category}
                </span>
                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {UI_LABELS.PRODUCTS_PAGE.FEATURED_BADGE}
                </span>
              </div>
              <h2
                className={`${typography.h3} ${themed.textPrimary} mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}
              >
                {post.title}
              </h2>
              <p className={`${themed.textSecondary} mb-4 line-clamp-3`}>
                {post.excerpt}
              </p>
              <div
                className={`flex items-center gap-4 text-xs ${themed.textSecondary}`}
              >
                <span>{post.authorName}</span>
                <span>
                  {post.readTimeMinutes} {LABELS.READ_TIME}
                </span>
                {post.publishedAt && (
                  <span>{formatDate(post.publishedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
