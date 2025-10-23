"use client";

import { useState } from "react";
import { useGlobalCategories } from "@/contexts/CategoriesContext";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryFilters } from "@/components/categories/CategoryFilters";

export default function CategoriesPage() {
  const { categories, loading, error } = useGlobalCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid");

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCategories = categories.filter((cat) => cat.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover products across all categories - from electronics to
            fashion and everything in between
          </p>
        </div>

        {featuredCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  variant="featured"
                  showSubcategories={false}
                />
              ))}
            </div>
          </div>
        )}

        <CategoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          totalCategories={categories.length}
          filteredCount={filteredCategories.length}
        />

        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : selectedView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                variant="list"
              />
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary to-primary/80 rounded-lg text-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Explore Our Categories</h2>
            <p className="text-xl text-white/90">
              Find exactly what you're looking for across thousands of products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {categories.length}+
              </div>
              <div className="text-white/80">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {categories
                  .reduce((sum, cat) => sum + cat.productCount, 0)
                  .toLocaleString()}
                +
              </div>
              <div className="text-white/80">Total Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {categories.reduce(
                  (sum, cat) => sum + (cat.subcategories?.length || 0),
                  0
                )}
                +
              </div>
              <div className="text-white/80">Subcategories</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
