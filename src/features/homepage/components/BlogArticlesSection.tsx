"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useBlogArticles } from "@mohasinac/appkit/features/homepage";
import { BlogCard } from "@/components";
import { SectionCarousel } from "@mohasinac/appkit/features/homepage";
import type { BlogPost } from "@mohasinac/appkit/features/blog";

export function BlogArticlesSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");

  const { data, isLoading } = useBlogArticles();

  const articles = data?.posts ?? [];

  if (!isLoading && articles.length === 0) return null;

  return (
    <SectionCarousel<BlogPost>
      title={t("blogTitle")}
      description={t("blogSubtitle")}
      headingVariant="editorial"
      pillLabel={t("blogPill")}
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
