"use client";

import { Button } from "@mohasinac/appkit/ui";

import { useTranslations } from "next-intl";
import {
  BlogCard,
  BlogPostView as AppkitBlogPostView,
} from "@mohasinac/appkit/features/blog";
import { getMediaUrl } from "@mohasinac/appkit/utils";
import { MediaImage, TextLink } from "@/components";
import { ROUTES } from "@/constants";
import { Link } from "@/i18n/navigation";
import { proseMirrorToHtml } from "@/utils";
import type { BlogPostDetailResponse } from "@mohasinac/appkit/features/blog/server";

interface BlogPostViewProps {
  slug: string;
  initialData?: BlogPostDetailResponse;
}

export function BlogPostView({ slug, initialData }: BlogPostViewProps) {
  const t = useTranslations("blog");

  return (
    <AppkitBlogPostView
      slug={slug}
      initialData={initialData}
      labels={{
        backToBlog: t("backToBlog"),
        notFound: t("postNotFound"),
        notFoundDescription: t("postNotAvailable"),
        author: t("author"),
        readTime: t("readTime"),
        publishedOn: t("publishedOn"),
        viewsLabel: t("viewsLabel"),
        featured: t("featured"),
        relatedTitle: t("related"),
      }}
      renderImage={(post) => {
        const coverImageUrl = getMediaUrl(post.coverImage);

        return coverImageUrl ? (
          <MediaImage
            src={coverImageUrl}
            alt={post.title}
            size="hero"
            priority
          />
        ) : null;
      }}
      renderContent={(post) => (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: proseMirrorToHtml(post.content ?? ""),
          }}
        />
      )}
      renderBackButton={() => (
        <TextLink href={ROUTES.PUBLIC.BLOG}>
          <Button variant="outline">{t("backToBlog")}</Button>
        </TextLink>
      )}
      renderRelatedCard={(post) => (
        <Link href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`} className="block" key={post.id}>
          <BlogCard post={post} className="h-full" />
        </Link>
      )}
    />
  );
}
