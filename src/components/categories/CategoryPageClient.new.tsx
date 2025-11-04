"use client";

import React, { useMemo, useState } from "react";
import NextLink from "next/link";
import type { Category } from "@/types/shared";
import {
  useBreadcrumbTracker,
  buildCategoryBreadcrumb,
} from "@/hooks/useBreadcrumbTracker";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedInput } from "@/components/ui/unified/Input";
import { UnifiedCard, CardContent } from "@/components/ui/unified/Card";
import {
  ChevronRight,
  ShoppingCart,
  Folder,
  Home,
  Layers as CategoryIcon,
  Search,
} from "lucide-react";

interface CategoryWithCounts extends Category {
  directProductCount: number;
  childProductCount: number;
  totalProductCount: number;
  subcategoryCount: number;
}

interface CategoryPageClientProps {
  allCategories: CategoryWithCounts[];
  currentCategory: Category | null;
  slug?: string;
}

export default function CategoryPageClient({
  allCategories,
  currentCategory,
  slug,
}: CategoryPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get categories to display
  const displayCategories = useMemo(() => {
    let categories: CategoryWithCounts[];

    if (!currentCategory) {
      // Show root categories (no parents)
      categories = allCategories.filter(
        (cat) => !cat.parentIds || cat.parentIds.length === 0
      );
    } else {
      // Show subcategories of current category
      categories = allCategories.filter((cat) =>
        cat.parentIds?.includes(currentCategory.id)
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      categories = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
      );
    }

    return categories;
  }, [allCategories, currentCategory, searchTerm]);

  // Build breadcrumb trail
  const breadcrumbItems = useMemo(() => {
    if (!currentCategory) {
      return [
        {
          label: "Categories",
          href: "/categories",
          active: true,
        },
      ];
    }
    return [
      {
        label: "Categories",
        href: "/categories",
      },
      ...buildCategoryBreadcrumb(currentCategory, allCategories),
    ];
  }, [currentCategory, allCategories]);

  // Add breadcrumb tracking
  useBreadcrumbTracker(breadcrumbItems);

  // Get current category data with counts
  const currentCategoryWithCounts = useMemo(() => {
    if (!currentCategory) return null;
    return allCategories.find((cat) => cat.id === currentCategory.id) || null;
  }, [currentCategory, allCategories]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbItems.map((crumb, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const href = crumb.href ? crumb.href : "/categories";

            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                {isLast ? (
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {crumb.label}
                  </span>
                ) : (
                  <NextLink
                    href={href}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {crumb.label}
                  </NextLink>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          {currentCategory ? currentCategory.name : "Shop by Category"}
        </h1>
        {currentCategory && currentCategory.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-4">
            {currentCategory.description}
          </p>
        )}
        {currentCategory && (
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary-500 text-primary-700 dark:text-primary-300">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">
                {currentCategoryWithCounts?.totalProductCount || 0} Products
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-secondary-500 text-secondary-700 dark:text-secondary-300">
              <Folder className="w-5 h-5" />
              <span className="font-semibold">
                {currentCategoryWithCounts?.subcategoryCount || 0} Subcategories
              </span>
            </div>
          </div>
        )}
        {!currentCategory && (
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection organized by category
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <UnifiedInput
            type="text"
            placeholder="Search categories by name, slug, or description..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 w-full"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 ml-1">
            {displayCategories.length === 0
              ? "No categories found"
              : `Found ${displayCategories.length} ${
                  displayCategories.length === 1 ? "category" : "categories"
                }`}
          </p>
        )}
      </div>

      {/* Categories Grid */}
      {displayCategories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? `No categories found matching "${searchTerm}"`
              : `No ${
                  currentCategory ? "subcategories" : "categories"
                } available`}
          </h3>
          {currentCategory && (
            <NextLink href={`/products?category=${currentCategory.id}`}>
              <UnifiedButton>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Products
              </UnifiedButton>
            </NextLink>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: CategoryWithCounts }) {
  // Check if category has in-stock products
  const hasInStockProducts = category.totalProductCount > 0;

  // Generate a color for the category based on stock availability and featured status
  const getCategoryColorClasses = () => {
    if (!hasInStockProducts) return "text-gray-400";
    if (category.featured) return "text-primary-600 dark:text-primary-400";
    return "text-secondary-600 dark:text-secondary-400";
  };

  const getBorderColorClasses = () => {
    if (!hasInStockProducts) return "border-gray-300 dark:border-gray-600";
    if (category.featured)
      return "border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400";
    return "border-gray-200 dark:border-gray-700 hover:border-secondary-500 dark:hover:border-secondary-400";
  };

  const getBackgroundGradient = () => {
    if (!hasInStockProducts) {
      return "linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(156, 163, 175, 0.05) 100%)";
    }
    if (category.featured) {
      return "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)";
    }
    return "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)";
  };

  const getRadialGradient = () => {
    if (!hasInStockProducts) {
      return "radial-gradient(circle at center, rgba(156, 163, 175, 0.2) 0%, transparent 70%)";
    }
    if (category.featured) {
      return "radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)";
    }
    return "radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)";
  };

  return (
    <UnifiedCard
      className={`h-full rounded-3xl overflow-hidden transition-all duration-300 border ${getBorderColorClasses()} ${
        hasInStockProducts
          ? "bg-white dark:bg-gray-800 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
          : "bg-gray-50 dark:bg-gray-900 opacity-75"
      }`}
      style={{
        boxShadow: hasInStockProducts ? undefined : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div className="relative">
        {/* Featured/Trending Badge */}
        {category.featured && (
          <div className="absolute top-4 right-4 z-10">
            <UnifiedBadge variant="warning">Trending</UnifiedBadge>
          </div>
        )}

        {/* Category Image/Icon Area */}
        <div
          className="h-52 flex items-center justify-center bg-cover bg-center relative"
          style={{
            backgroundImage: category.image
              ? `url(${category.image})`
              : undefined,
            background: !category.image ? getBackgroundGradient() : undefined,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: getRadialGradient(),
            }}
          />
          {!category.image && (
            <CategoryIcon
              className={`w-20 h-20 ${getCategoryColorClasses()} opacity-80 relative z-10`}
            />
          )}
        </div>
      </div>

      {/* Category Info */}
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {category.name}
        </h3>

        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {category.description}
          </p>
        )}

        {/* Additional info for products in subcategories */}
        {category.directProductCount > 0 && category.childProductCount > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            {category.directProductCount} direct • {category.childProductCount}{" "}
            in subcategories
          </p>
        )}

        {/* Bottom Actions Area */}
        <div className="flex items-center justify-between mt-auto pt-4">
          {/* Product/Subcategory Count */}
          <span
            className={`text-sm font-semibold ${getCategoryColorClasses()}`}
          >
            {category.totalProductCount > 0
              ? `${category.totalProductCount}+ Products`
              : category.subcategoryCount > 0
              ? `${category.subcategoryCount} Subcategories`
              : "Coming Soon"}
          </span>

          {/* Explore Button */}
          {category.totalProductCount > 0 && (
            <NextLink
              href={`/products?category=${category.slug}`}
              className={`font-semibold ${getCategoryColorClasses()} hover:opacity-70 transition-opacity inline-flex items-center gap-1 group`}
            >
              Explore
              <span className="inline-flex transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </NextLink>
          )}

          {category.subcategoryCount > 0 &&
            category.totalProductCount === 0 && (
              <NextLink
                href={`/categories/${category.slug}`}
                className={`font-semibold ${getCategoryColorClasses()} hover:opacity-70 transition-opacity inline-flex items-center gap-1 group`}
              >
                Explore
                <span className="inline-flex transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </NextLink>
            )}
        </div>
      </CardContent>
    </UnifiedCard>
  );
}
