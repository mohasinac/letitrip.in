"use client";

import { useState, useEffect } from "react";
import { BlogCard } from "@/components/cards/BlogCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { blogService } from "@/services/blog.service";
import type { BlogPost } from "@/services/blog.service";

export default function FeaturedBlogsSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      const blogsList = await blogService.getHomepage();
      setBlogs(blogsList.slice(0, 10));
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[320px] h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <HorizontalScrollContainer
        title="📰 Latest from Our Blog"
        viewAllLink="/blog"
        viewAllText="View All Posts"
        itemWidth="320px"
        gap="1rem"
      >
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            id={blog.id}
            title={blog.title}
            slug={blog.slug}
            excerpt={blog.excerpt}
            featuredImage={blog.featuredImage}
            author={blog.author}
            category={blog.category}
            tags={blog.tags}
            publishedAt={blog.publishedAt}
            views={blog.views}
            likes={blog.likes}
            featured={blog.featured}
            compact={false}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
