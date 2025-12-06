/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedBlogsSection
 * @description This file contains the FeaturedBlogsSection component and its related functionality
 *
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { BlogCard } from "@/components/cards/BlogCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import type { BlogPost } from "@/services/blog.service";
import { blogService } from "@/services/blog.service";
import { BookOpen } from "lucide-react";

export default function FeaturedBlogsSection() {
  return (
    <FeaturedSection<BlogPost>
      title="📰 Latest from Our Blog"
      icon={BookOpen}
      viewAllLink="/blog"
      viewAllText="View All Posts"
      fetchData={async () => {
        const blogsList = await blogService.getHomepage();
        return blogsList.slice(0, 10);
      }}
      renderItem={(blog) => (
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
      )}
      itemWidth="320px"
    />
  );
}
