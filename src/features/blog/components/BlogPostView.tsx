"use client";

import { useApiQuery } from "@/hooks";
import { blogService } from "@/services";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  MediaImage,
  Spinner,
  Heading,
  Text,
  Span,
  TextLink,
} from "@/components";
import { BlogCard } from "@/components";
import { formatDate } from "@/utils";
import type { BlogPostDocument, BlogPostCategory } from "@/db/schema";

const { themed, typography, flex, page } = THEME_CONSTANTS;

const CATEGORY_BADGE: Record<BlogPostCategory, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  tips: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  guides:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  updates:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  community:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

interface BlogPostViewProps {
  slug: string;
}

export function BlogPostView({ slug }: BlogPostViewProps) {
  const t = useTranslations("blog");
  const tActions = useTranslations("actions");

  const { data, isLoading, error } = useApiQuery<{
    post: BlogPostDocument;
    related: BlogPostDocument[];
  }>({
    queryKey: ["blog", "post", slug],
    queryFn: () => blogService.getBySlug(slug),
  });

  const post = data?.post;
  const related = data?.related || [];

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary} ${flex.center}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} ${flex.centerCol} gap-4 p-8`}
      >
        <Heading level={1} className={typography.h3}>
          {t("postNotFound")}
        </Heading>
        <Text variant="secondary">{t("postNotAvailable")}</Text>
        <TextLink href={ROUTES.PUBLIC.BLOG}>
          <Button variant="primary">{t("backToBlog")}</Button>
        </TextLink>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <MediaImage
            src={post.coverImage}
            alt={post.title}
            size="hero"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className={`${page.container.sm} py-12`}>
        {/* Breadcrumb */}
        <div
          className={`flex items-center gap-2 text-sm ${themed.textSecondary} mb-8`}
        >
          <TextLink
            href={ROUTES.PUBLIC.BLOG}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {t("title")}
          </TextLink>
          <Span>/</Span>
          <Span className="capitalize">{post.category}</Span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Span
              size="xs"
              weight="medium"
              className={`inline-block px-2 py-0.5 rounded-full capitalize ${CATEGORY_BADGE[post.category]}`}
            >
              {post.category}
            </Span>
            {post.isFeatured && (
              <Span
                size="xs"
                weight="medium"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full"
              >
                {t("featured")}
              </Span>
            )}
          </div>
          <Heading level={1} className={`${typography.h2} mb-4`}>
            {post.title}
          </Heading>
          <Text size="lg" variant="secondary" className="mb-6">
            {post.excerpt}
          </Text>
          <div
            className={`flex flex-wrap items-center gap-4 text-sm ${themed.textSecondary}`}
          >
            <Span variant="secondary">
              {t("author")}: <Span weight="bold">{post.authorName}</Span>
            </Span>
            <Span variant="secondary">
              {post.readTimeMinutes} {t("readTime")}
            </Span>
            {post.publishedAt && (
              <Span variant="secondary">
                {t("publishedOn")} {formatDate(post.publishedAt)}
              </Span>
            )}
            <Span variant="secondary">
              {post.views} {t("viewsLabel")}
            </Span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Span
                key={tag}
                size="xs"
                weight="medium"
                variant="secondary"
                className={`inline-block px-3 py-1 rounded-full ${themed.bgSecondary}`}
              >
                #{tag}
              </Span>
            ))}
          </div>
        )}

        {/* Content */}
        <Card className="p-8 mb-12">
          <div
            className={`prose dark:prose-invert max-w-none ${themed.textPrimary}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <Heading level={2} className={`${typography.h3} mb-6`}>
              {t("related")}
            </Heading>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <BlogCard key={rel.id} post={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className={`mt-10 pt-8 border-t ${themed.border}`}>
          <TextLink href={ROUTES.PUBLIC.BLOG}>
            <Button variant="outline">{t("backToBlog")}</Button>
          </TextLink>
        </div>
      </div>
    </div>
  );
}
