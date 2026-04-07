"use client";

import { BlogCard as PkgBlogCard, CATEGORY_BADGE } from "@mohasinac/feat-blog";
import type { BlogCardProps as PkgBlogCardProps } from "@mohasinac/feat-blog";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import type { BlogPost } from "@mohasinac/feat-blog";

export { CATEGORY_BADGE };

type BlogCardProps = Omit<PkgBlogCardProps, "href" | "LinkComponent">;

/**
 * Locale-aware wrapper around @mohasinac/feat-blog's BlogCard.
 * Pre-configures the href from ROUTES and uses next-intl's Link.
 */
export function BlogCard({ post, ...props }: BlogCardProps) {
  return (
    <PkgBlogCard
      post={post}
      href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`}
      LinkComponent={Link}
      {...props}
    />
  );
}

export type { BlogPost };
