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
          className="inline-flex items-center gap-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:text-primary transition-colors"
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
