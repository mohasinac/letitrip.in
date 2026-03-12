"use client";

import {
  Star,
  Newspaper,
  Lightbulb,
  BookOpen,
  Bell,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  Checkbox,
  Heading,
  MediaImage,
  Span,
  Text,
  TextLink,
} from "@/components";
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

const CATEGORY_ICON: Record<
  BlogPostCategory,
  React.FC<{ className?: string }>
> = {
  news: Newspaper,
  tips: Lightbulb,
  guides: BookOpen,
  updates: Bell,
  community: Users,
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
      className="block group/card focus:outline-none"
    >
      <Card
        className={`h-full overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300${
          selected ? " ring-2 ring-primary-500" : ""
        }`}
      >
        {/* ── Image area ── */}
        <div className="group/img relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0">
          {post.coverImage ? (
            <MediaImage
              src={post.coverImage}
              alt={post.title}
              size="card"
              className="group-hover/img:scale-105 transition-transform duration-300"
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
              <Checkbox
                aria-label={`Select ${post.title}`}
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(post.id, e.target.checked);
                }}
                className="bg-white/80"
              />
            </div>
          )}

          {/* Featured star — top right */}
          {post.isFeatured && (
            <div
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 ${flex.center} shadow`}
            >
              <Star
                className="w-4 h-4 text-yellow-900 fill-yellow-900"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Category badge — bottom left */}
          <div className="absolute bottom-2 left-2 z-10">
            {(() => {
              const CategoryIcon = CATEGORY_ICON[post.category];
              return (
                <Span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
                >
                  <CategoryIcon className="w-3 h-3 flex-shrink-0" />
                  {post.category}
                </Span>
              );
            })()}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <Heading
            level={3}
            className={`text-base sm:text-[17px] font-semibold leading-snug ${themed.textPrimary} line-clamp-2 group-hover/img:text-primary-600 dark:group-hover/img:text-primary-400 transition-colors`}
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
            className="mt-1 w-full text-center text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 rounded-xl py-2 group-hover/img:bg-primary-50 dark:group-hover/img:bg-primary-900/20 transition-colors"
          >
            {t("continueReading")}
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
