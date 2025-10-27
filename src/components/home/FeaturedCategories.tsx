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
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of hobby categories
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4" style={{ width: "max-content" }}>
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {category.description}
                  </p>
                  <div className="space-y-1">
                    {category.highlights.slice(0, 3).map((highlight, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-gray-500 flex items-center"
                      >
                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
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
