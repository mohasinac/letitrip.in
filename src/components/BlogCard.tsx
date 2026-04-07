"use client";

import { BlogCard as PkgBlogCard } from "@mohasinac/feat-blog";
import type { BlogPostCategory } from "@mohasinac/feat-blog";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import type { BlogPost } from "@mohasinac/feat-blog";

export const CATEGORY_BADGE: Record<BlogPostCategory, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  tips: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  guides:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  updates:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  community: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
};

export interface BlogCardProps {
  post: BlogPost;
  className?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

/**
 * Locale-aware wrapper around @mohasinac/feat-blog's BlogCard.
 * Handles navigation via next-intl Link.
 */
export function BlogCard({
  post,
  className,
  selectable,
  selected,
  onSelect,
}: BlogCardProps) {
  return (
    <Link
      href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`}
      className="block"
      onClick={
        selectable && onSelect
          ? (e) => {
              e.preventDefault();
              onSelect(post.id, !selected);
            }
          : undefined
      }
    >
      {selectable && (
        <span
          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded border-2 inline-flex items-center justify-center
            ${selected ? "bg-primary border-primary" : "bg-white/90 border-gray-300"}`}
          aria-hidden="true"
        >
          {selected && (
            <span className="text-white text-xs leading-none">✓</span>
          )}
        </span>
      )}
      <PkgBlogCard post={post} className={className} />
    </Link>
  );
}

export type { BlogPost };
