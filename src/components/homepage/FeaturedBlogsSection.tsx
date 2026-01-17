"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";
import { HorizontalScrollContainer } from '@letitrip/react-library';
import { BlogCard } from "@/components/cards/BlogCard";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { BlogPostFE } from "@/services/homepage.service";
import { ExternalLink } from "lucide-react";

interface FeaturedBlogsSectionProps {
  limit?: number;
  className?: string;
}

export function FeaturedBlogsSection({
  limit = 10,
  className = "",
}: FeaturedBlogsSectionProps) {
  const [blogs, setBlogs] = useState<BlogPostFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, [limit]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getFeaturedBlogs(limit);
      setBlogs(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_featured_blogs_viewed", {
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, { component: "FeaturedBlogsSection.loadBlogs" });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no blogs
  if (!loading && blogs.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Blog Posts
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Featured Blog Posts
      </h2>

      <HorizontalScrollContainer
        itemWidth="350px"
        gap="1.5rem"
        showArrows={true}
      >
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            id={blog.id}
            title={blog.title}
            slug={blog.slug}
            excerpt={blog.excerpt}
            featuredImage={blog.image}
            author={{
              id: "author",
              name: blog.author,
            }}
            publishedAt={blog.publishedAt}
            category="Blog"
            tags={blog.tags}
          />
        ))}
      </HorizontalScrollContainer>

      {/* View All Blog Posts Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Blog Posts
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
