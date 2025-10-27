"use client";

import { useState, useEffect } from "react";
import {
  fetchMarkdownContent,
  parseCategoriesMarkdown,
} from "@/lib/utils/markdown-client";
import type { CategoryItem } from "@/lib/utils/markdown-client";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await fetchMarkdownContent(
          "homepage/featured-categories.md"
        );
        const parsedCategories = parseCategoriesMarkdown(
          categoriesData.content
        );
        setCategories(parsedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-br from-theme-accent to-theme-background shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-theme-text mb-6 drop-shadow-lg">
            Featured Categories
          </h2>
          <p className="text-2xl text-theme-muted max-w-3xl mx-auto font-bold drop-shadow-md">
            Explore our curated collection of hobby categories
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border-4 border-theme-primary shadow-2xl animate-pulse"
              >
                <div className="h-40 bg-theme-muted rounded-xl mb-6"></div>
                <div className="h-6 bg-theme-muted rounded mb-4"></div>
                <div className="h-4 bg-theme-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-8 pb-4" style={{ width: "max-content" }}>
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-96 bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <div className="h-40 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-5xl drop-shadow-lg">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-theme-text mb-4 drop-shadow-sm">
                    {category.title}
                  </h3>
                  <p className="text-theme-muted mb-6 text-lg font-semibold">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.highlights.slice(0, 3).map((highlight, idx) => (
                      <p
                        key={idx}
                        className="text-base text-theme-muted flex items-center font-medium"
                      >
                        <span className="w-2 h-2 bg-theme-primary rounded-full mr-3 shadow-sm"></span>
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
