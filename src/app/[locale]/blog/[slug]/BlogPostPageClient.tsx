"use client";
import { BlogPostView, BlogCard } from "@mohasinac/appkit/client";
import Link from "next/link";

type Props = { slug: string; locale: string };

export function BlogPostPageClient({ slug, locale }: Props) {
  return (
    <BlogPostView
      slug={slug}
      renderBackButton={() => (
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-primary transition-colors"
        >
          <span>←</span> Back to Blog
        </Link>
      )}
      renderRelatedCard={(relatedPost) => (
        <BlogCard post={relatedPost as any} />
      )}
    />
  );
}
