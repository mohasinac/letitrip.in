"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useApiQuery } from "@/hooks";
import { blogService } from "@/services";
import type { BlogPostDocument } from "@/db/schema";
import { Button, Heading, Section, Text } from "@/components";
import { BlogCard } from "@/features/blog";

const { flex } = THEME_CONSTANTS;

const MIN_BLOG_COUNT = 4;

interface BlogListResult {
  posts: BlogPostDocument[];
  meta: { total: number; page: number; pageSize: number };
}

export function BlogArticlesSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const router = useRouter();

  const { data, isLoading } = useApiQuery<BlogListResult>({
    queryKey: ["blog", "featured"],
    queryFn: async () => {
      const featuredRes = (await blogService.getFeatured(
        MIN_BLOG_COUNT,
      )) as BlogListResult;
      const featured = featuredRes?.posts ?? [];

      if (featured.length >= MIN_BLOG_COUNT) return featuredRes;

      // Fill remaining slots with latest posts
      const remaining = MIN_BLOG_COUNT - featured.length;
      const latestRes = (await blogService.getLatest(
        remaining + featured.length,
      )) as BlogListResult;
      const latest = latestRes?.posts ?? [];

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      return {
        ...featuredRes,
        posts: [...featured, ...filler],
      };
    },
    cacheTTL: 5 * 60 * 1000,
  });

  const articles = data?.posts ?? [];

  // Don't render while loading or when there are no featured posts
  if (isLoading || articles.length === 0) {
    return null;
  }

  return (
    <Section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.subtle}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className={`${flex.between} mb-10`}>
          <div>
            <Heading
              level={2}
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              {t("blogTitle")}
            </Heading>
            <Text
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {t("blogSubtitle")}
            </Text>
          </div>
          <Button
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline hidden md:block`}
            onClick={() => router.push(ROUTES.PUBLIC.BLOG)}
          >
            {tActions("viewAll")} →
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <BlogCard key={article.id} post={article} />
          ))}
        </div>

        {/* Mobile "View All" Button */}
        <div className="text-center mt-8 md:hidden">
          <Button
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline`}
            onClick={() => router.push(ROUTES.PUBLIC.BLOG)}
          >
            {tActions("viewAll")} →
          </Button>
        </div>
      </div>
    </Section>
  );
}
