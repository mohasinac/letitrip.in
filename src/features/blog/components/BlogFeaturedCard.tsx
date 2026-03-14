"use client";

import { Card, Heading, MediaImage, Span, Text, TextLink } from "@/components";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { CATEGORY_BADGE } from "@/components";
import type { BlogPostDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography } = THEME_CONSTANTS;

export function BlogFeaturedCard({ post }: { post: BlogPostDocument }) {
  return (
    <div className="mb-10">
      <TextLink href={`${ROUTES.PUBLIC.BLOG}/${post.slug}`} className="block">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="md:flex">
            {post.coverImage && (
              <div className="group/img md:w-1/2 relative h-64 md:min-h-[320px] overflow-hidden">
                <MediaImage
                  src={post.coverImage}
                  alt={post.title}
                  size="hero"
                  className="group-hover/img:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_BADGE[post.category]}`}
                >
                  {post.category}
                </Span>
                <Span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {UI_LABELS.PRODUCTS_PAGE.FEATURED_BADGE}
                </Span>
              </div>
              <Heading
                level={2}
                className={`${typography.h3} ${themed.textPrimary} mb-3 group-hover/img:text-primary transition-colors`}
              >
                {post.title}
              </Heading>
              <Text variant="secondary" className="mb-4 line-clamp-3">
                {post.excerpt}
              </Text>
              <div
                className={`flex items-center gap-4 text-xs ${themed.textSecondary}`}
              >
                <Span>{post.authorName}</Span>
                <Span>
                  {post.readTimeMinutes} {LABELS.READ_TIME}
                </Span>
                {post.publishedAt && (
                  <Span>{formatDate(post.publishedAt)}</Span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </TextLink>
    </div>
  );
}
