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
  BaseListingCard,
  Heading,
  MediaImage,
  Span,
  Text,
  TextLink,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import type { BlogPost, BlogPostCategory } from "@mohasinac/feat-blog";

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
  post: BlogPost;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  /** "standard" = regular card layout. "overlay" = magazine with text over image. */
  variant?: "standard" | "overlay";
}

export function BlogCard({
  post,
  selectable = false,
  selected = false,
  onSelect,
  variant = "standard",
}: BlogCardProps) {
  const t = useTranslations("blog");

  return (
    <TextLink
      href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`}
      className="block group/card focus:outline-none"
    >
      <BaseListingCard isSelected={selected}>
        {/* ── Image area ── */}
        <BaseListingCard.Hero
          aspect={variant === "overlay" ? "4/3" : "4/3"}
          className="group/img"
        >
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
            <BaseListingCard.Checkbox
              selected={selected}
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(post.id, !selected);
              }}
              label={
                selected ? `Deselect ${post.title}` : `Select ${post.title}`
              }
              position="top-2 left-2"
            />
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

          {/* Category badge */}
          <div
            className={`absolute z-10 ${variant === "overlay" ? "top-3 left-3" : "bottom-2 left-2"}`}
          >
            {(() => {
              const CategoryIcon = CATEGORY_ICON[post.category];
              return (
                <Span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    variant === "overlay"
                      ? "bg-black/40 backdrop-blur-sm text-white"
                      : CATEGORY_BADGE[post.category]
                  }`}
                >
                  <CategoryIcon className="w-3 h-3 flex-shrink-0" />
                  {post.category}
                </Span>
              );
            })()}
          </div>

          {/* Date badge (overlay variant only) */}
          {variant === "overlay" && (
            <div className="absolute top-3 right-3 z-10">
              <Span className="bg-white dark:bg-slate-900 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg px-2 py-1 shadow-sm">
                {post.publishedAt != null
                  ? formatDate(post.publishedAt, "short")
                  : ""}
              </Span>
            </div>
          )}

          {/* Title overlay (overlay variant only) */}
          {variant === "overlay" && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-16 z-10">
              <Heading
                level={3}
                className="font-display text-base sm:text-lg text-white leading-snug line-clamp-2 group-hover/card:text-primary-400 transition-colors"
              >
                {post.title}
              </Heading>
            </div>
          )}
        </BaseListingCard.Hero>

        {/* ── Content (standard variant only) ── */}
        {variant === "standard" && (
          <BaseListingCard.Info className="p-4">
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
          </BaseListingCard.Info>
        )}
      </BaseListingCard>
    </TextLink>
  );
}
