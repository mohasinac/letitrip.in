import React from "react";
import type { BlogPost, BlogPostCategory } from "../types";

interface BlogCardProps {
  post: BlogPost;
  onClick?: (post: BlogPost) => void;
  className?: string;
}

export function BlogCard({ post, onClick, className = "" }: BlogCardProps) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick(post)
          : undefined
      }
      onClick={onClick ? () => onClick(post) : undefined}
      className={`group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden bg-neutral-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
            {post.category}
          </span>
          {post.readTimeMinutes && (
            <span className="text-xs text-neutral-400">
              {post.readTimeMinutes} min read
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-neutral-500">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          {post.authorAvatar && (
            <img
              src={post.authorAvatar}
              alt={post.authorName ?? ""}
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
          <div className="text-xs text-neutral-500">
            {post.authorName && (
              <span className="font-medium text-neutral-700">
                {post.authorName}
              </span>
            )}
            {date && <span className="ml-1">· {date}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

interface BlogCategoryTabsProps {
  categories: BlogPostCategory[];
  active?: BlogPostCategory | null;
  onSelect: (cat: BlogPostCategory | null) => void;
  labels?: Record<string, string>;
}

export function BlogCategoryTabs({
  categories,
  active,
  onSelect,
  labels = {},
}: BlogCategoryTabsProps) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${!active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
      >
        {labels.all ?? "All"}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${active === cat ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
        >
          {labels[cat] ?? cat}
        </button>
      ))}
    </div>
  );
}

interface BlogListViewProps {
  posts: BlogPost[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPostClick?: (post: BlogPost) => void;
  emptyLabel?: string;
}

export function BlogListView({
  posts,
  isLoading,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onPostClick,
  emptyLabel = "No posts found",
}: BlogListViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
          >
            <div className="aspect-video bg-neutral-200" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-16 rounded bg-neutral-200" />
              <div className="h-5 w-full rounded bg-neutral-200" />
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} onClick={onPostClick} />
        ))}
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${p === currentPage ? "bg-neutral-900 text-white" : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
