"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Tag, Loader2, Search, List } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "alphabetical" | "productCount" | "level"
  >("alphabetical");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Load all active categories
      const allCategories = await categoriesService.list({ isActive: true });
      setCategories(allCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and group categories by level
  const categoriesByLevel = useMemo(() => {
    let filtered = [...categories];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Group by level
    const grouped = new Map<number, CategoryFE[]>();
    filtered.forEach((cat) => {
      const level = cat.level || 0;
      if (!grouped.has(level)) {
        grouped.set(level, []);
      }
      grouped.get(level)!.push(cat);
    });

    // Sort categories within each level
    grouped.forEach((cats, level) => {
      cats.sort((a, b) => {
        switch (sortBy) {
          case "alphabetical":
            return a.name.localeCompare(b.name);
          case "productCount":
            return b.productCount - a.productCount;
          case "level":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    });

    // Convert to sorted array of [level, categories]
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [categories, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            title="No categories available"
            description="Categories will appear here once they are added."
            action={{
              label: "Go to Home",
              onClick: () => (window.location.href = "/"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Browse Categories
            </h1>
            <p className="text-gray-600">
              Discover {categories.length} categories and thousands of products
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="sm:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alphabetical">Sort Alphabetically</option>
                  <option value="productCount">Sort by Product Count</option>
                  <option value="level">Sort by Level</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Categories by Level */}
        <div className="space-y-8">
          {categoriesByLevel.map(([level, levelCategories]) => (
            <div key={level} className="space-y-4">
              {/* Level Header */}
              <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {level === 0
                      ? "Root Categories"
                      : `Level ${level} Categories`}
                  </h2>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  ({levelCategories.length}{" "}
                  {levelCategories.length === 1 ? "category" : "categories"})
                </span>
              </div>

              {/* Categories Grid for this level */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {levelCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
                  >
                    {/* Category Image */}
                    {category.image && (
                      <div className="w-full h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                        {category.name}
                      </h3>

                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Tag className="w-3 h-3" />
                          <span>{category.productCount} products</span>
                        </div>
                        {category.featured && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Parent indicator if not root */}
                      {level > 0 && category.hasParents && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <ChevronRight className="w-3 h-3" />
                          <span className="truncate">Subcategory</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Empty state for search */}
          {categoriesByLevel.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No categories found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
