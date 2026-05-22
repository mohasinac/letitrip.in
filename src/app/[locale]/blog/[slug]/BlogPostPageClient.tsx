"use client";
import { BlogPostView, BlogCard, ROUTES } from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";

type Props = { slug: string; locale: string };

export function BlogPostPageClient({ slug, locale }: Props) {
  return (
    <BlogPostView
      slug={slug}
      renderBackButton={() => (
        <Link
          href={`/${locale}${String(ROUTES.PUBLIC.BLOG)}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors"
        >
          ← Back to Blog
        </Link>
      )}
      renderRelatedCard={(relatedPost) => (
        <BlogCard
          post={relatedPost}
          href={`/${locale}${String(ROUTES.BLOG.ARTICLE(relatedPost.slug))}`}
        />
      )}
    />
  );
}
