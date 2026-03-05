"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, Heading, MediaImage, Span, Text, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const { themed, flex } = THEME_CONSTANTS;

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

interface BlogCardProps {
  post: BlogPostDocument;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function BlogCard({
  post,
  selectable = false,
  selected = false,
  onSelect,
}: BlogCardProps) {
  const t = useTranslations("blog");

  return (
    <TextLink
      href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`}
      className="block group focus:outline-none"
    >
      <Card
        className={`h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200${
          selected ? " ring-2 ring-indigo-500" : ""
        }`}
      >
        {/* ── Image area ── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {post.coverImage ? (
            <MediaImage
              src={post.coverImage}
              alt={post.title}
              size="card"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`${flex.center} w-full h-full`}>
              <Span className="text-5xl opacity-30">📝</Span>
            </div>
          )}

          {/* Checkbox — top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                aria-label={`Select ${post.title}`}
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(post.id, e.target.checked);
                }}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white/80"
              />
            </div>
          )}

          {/* Featured star — top right */}
          {post.isFeatured && (
            <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow">
              <Star
                className="w-4 h-4 text-yellow-900 fill-yellow-900"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Category badge — bottom left */}
          <div className="absolute bottom-2 left-2 z-10">
            <Span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
            >
              {post.category}
            </Span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <Heading
            level={3}
            className={`text-base sm:text-[17px] font-semibold leading-snug ${themed.textPrimary} line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}
          >
            {post.title}
          </Heading>

          <Text size="sm" variant="secondary" className="line-clamp-3 flex-1">
            {post.excerpt}
          </Text>

          {/* Author row */}
          <div
            className={`${flex.between} text-xs ${themed.textSecondary} border-t ${themed.border} pt-2 mt-1`}
          >
            <Span className="truncate max-w-[55%]">{post.authorName}</Span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {post.readTimeMinutes != null && (
                <Span>
                  {post.readTimeMinutes}&thinsp;{t("readTime")}
                </Span>
              )}
              {post.publishedAt != null && (
                <Span>{formatDate(post.publishedAt)}</Span>
              )}
            </div>
          </div>

          {/* Continue Reading — visual-only; the outer <a> provides navigation */}
          <div
            aria-hidden="true"
            className="mt-1 w-full text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded-lg py-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors"
          >
            {t("continueReading")}
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
