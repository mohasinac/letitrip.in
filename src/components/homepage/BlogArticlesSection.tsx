"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  THEME_CONSTANTS,
  ROUTES,
  UI_LABELS,
  MOCK_BLOG_ARTICLES,
} from "@/constants";
import { formatDate } from "@/utils";

export function BlogArticlesSection() {
  const router = useRouter();
  // NOTE: Using mock data until /api/blog route is implemented (blog feature not yet built)
  // Replace with: const { data, isLoading } = useApiQuery('/api/blog?limit=4')
  // when the blog feature is added.
  const articles = MOCK_BLOG_ARTICLES;

  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.subtle}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              {UI_LABELS.HOMEPAGE.BLOG.TITLE}
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {UI_LABELS.HOMEPAGE.BLOG.SUBTITLE}
            </p>
          </div>
          <button
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline hidden md:block`}
            onClick={() => router.push(ROUTES.PUBLIC.BLOG)}
          >
            {UI_LABELS.ACTIONS.VIEW_ALL} →
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <button
              key={article.id}
              className={`group ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} overflow-hidden hover:shadow-xl transition-all text-left`}
              onClick={() => router.push(`/blog/${article.slug}`)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                {article.thumbnail ? (
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                <h3
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
                >
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-4 line-clamp-2`}
                >
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} flex items-center justify-between pt-3 border-t ${THEME_CONSTANTS.themed.border}`}
                >
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="flex items-center gap-1">
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
                    {article.readTime} min
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile "View All" Button */}
        <div className="text-center mt-8 md:hidden">
          <button
            className={`${THEME_CONSTANTS.typography.body} text-blue-600 dark:text-blue-400 font-medium hover:underline`}
            onClick={() => router.push(ROUTES.PUBLIC.BLOG)}
          >
            {UI_LABELS.ACTIONS.VIEW_ALL} →
          </button>
        </div>
      </div>
    </section>
  );
}
