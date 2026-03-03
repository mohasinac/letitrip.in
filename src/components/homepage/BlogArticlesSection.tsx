"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatDate } from "@/utils";
import { useApiQuery } from "@/hooks";
import { blogService } from "@/services";
import type { BlogPostDocument } from "@/db/schema";
import { Button, Heading, Section, Span, Text } from "@/components";

const { flex } = THEME_CONSTANTS;

interface FeaturedBlogResult {
  posts: BlogPostDocument[];
  meta: { total: number; page: number; pageSize: number };
}

export function BlogArticlesSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const router = useRouter();

  const { data, isLoading } = useApiQuery<FeaturedBlogResult>({
    queryKey: ["blog", "featured"],
    queryFn: () => blogService.getFeatured(4),
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
            <Button
              key={article.id}
              className={`group ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} overflow-hidden hover:shadow-xl transition-all text-left`}
              onClick={() => router.push(ROUTES.BLOG.ARTICLE(article.slug))}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className={`w-full h-full ${flex.center} text-gray-400`}>
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {article.category}
                </div>
              </div>

              {/* Content */}
              <div className={`${THEME_CONSTANTS.spacing.padding.lg}`}>
                {/* Title */}
                <Heading
                  level={3}
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
                >
                  {article.title}
                </Heading>

                {/* Excerpt */}
                <Text
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-4 line-clamp-2`}
                >
                  {article.excerpt}
                </Text>

                {/* Meta Info */}
                <div
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} ${flex.between} pt-3 border-t ${THEME_CONSTANTS.themed.border}`}
                >
                  <Span>
                    {article.publishedAt ? formatDate(article.publishedAt) : ""}
                  </Span>
                  <Span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {article.readTimeMinutes} min
                  </Span>
                </div>
              </div>
            </Button>
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
