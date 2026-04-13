"use client";

import { Button } from "@mohasinac/appkit/ui";

import { useTranslations } from "next-intl";
import { BlogPostView as AppkitBlogPostView } from "@mohasinac/appkit/features/blog";
import { getMediaUrl } from "@mohasinac/appkit/utils";
import { MediaImage, TextLink } from "@/components";
import { BlogCard } from "@/components";
import { ROUTES } from "@/constants";
import { proseMirrorToHtml } from "@/utils";
import type { BlogPost } from "@mohasinac/appkit/features/blog";
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
      renderRelatedCard={(post) => <BlogCard post={post} key={post.id} />}
    />
  );
}
