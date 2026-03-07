"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useApiQuery } from "@/hooks";
import { blogService } from "@/services";
import type { BlogPostDocument } from "@/db/schema";
import { BlogCard } from "@/features/blog";
import { SectionCarousel } from "./SectionCarousel";

const MIN_BLOG_COUNT = 4;

interface BlogListResult {
  posts: BlogPostDocument[];
  meta: { total: number; page: number; pageSize: number };
}

export function BlogArticlesSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");

  const { data, isLoading } = useApiQuery<BlogListResult>({
    queryKey: ["blog", "featured"],
    queryFn: async () => {
      const featuredRes = (await blogService.getFeatured(
        MIN_BLOG_COUNT,
      )) as BlogListResult;
      const featured = featuredRes?.posts ?? [];

      if (featured.length >= MIN_BLOG_COUNT) return featuredRes;

      const remaining = MIN_BLOG_COUNT - featured.length;
      const latestRes = (await blogService.getLatest(
        remaining + featured.length,
      )) as BlogListResult;
      const latest = latestRes?.posts ?? [];

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      return { ...featuredRes, posts: [...featured, ...filler] };
    },
    cacheTTL: 5 * 60 * 1000,
  });

  const articles = data?.posts ?? [];

  if (!isLoading && articles.length === 0) return null;

  return (
    <SectionCarousel
      title={t("blogTitle")}
      description={t("blogSubtitle")}
      viewMoreHref={ROUTES.PUBLIC.BLOG}
      viewMoreLabel={tActions("viewAllArrow")}
      items={articles}
      renderItem={(article) => <BlogCard post={article} />}
      perView={{ base: 1, sm: 2, md: 3, xl: 4 }}
      gap={24}
      keyExtractor={(a) => a.id}
      isLoading={isLoading}
      skeletonCount={4}
      className={THEME_CONSTANTS.sectionBg.subtle}
    />
  );
}
