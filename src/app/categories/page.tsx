"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesService.list({ parentId: null });
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div id="categories-page" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Categories
          </h1>
          <p className="text-gray-600">
            Discover products organized by category
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <EmptyState
            title="No categories available"
            description="Categories will appear here once they are added."
            action={{
              label: "Go to Home",
              onClick: () => (window.location.href = "/"),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all p-6 group"
              >
                {/* Category Image */}
                {category.image && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Category Info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </div>

                {/* Product Count */}
                {category.productCount !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-3">
                    <Tag className="w-4 h-4" />
                    <span>
                      {category.productCount} product
                      {category.productCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Featured Badge */}
                {category.isFeatured && (
                  <span className="inline-block mt-3 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    Featured
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
