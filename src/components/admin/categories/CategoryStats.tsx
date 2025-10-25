"use client";

import { CategoryTreeNode } from "@/types";

interface CategoryStatsProps {
  categories: CategoryTreeNode[];
}

export default function CategoryStats({ categories }: CategoryStatsProps) {
  // Calculate stats from the category tree
  const calculateStats = () => {
    let totalCategories = 0;
    let activeCategories = 0;
    let featuredCategories = 0;
    let rootCategories = 0;
    let leafCategories = 0;
    let parentCategories = 0;
    let totalProducts = 0;
    let totalInStock = 0;
    let totalOutOfStock = 0;
    let totalLowStock = 0;
    let maxDepth = 0;

    const traverse = (cats: CategoryTreeNode[], depth = 0) => {
      cats.forEach((category) => {
        totalCategories++;

        if (category.isActive) activeCategories++;
        if (category.featured) featuredCategories++;
        if (category.level === 0) rootCategories++;
        if (category.isLeaf) leafCategories++;
        else parentCategories++;

        if (category.productCount) totalProducts += category.productCount;
        if (category.inStockCount) totalInStock += category.inStockCount;
        if (category.outOfStockCount)
          totalOutOfStock += category.outOfStockCount;
        if (category.lowStockCount) totalLowStock += category.lowStockCount;

        maxDepth = Math.max(maxDepth, depth);

        traverse(category.children, depth + 1);
      });
    };

    traverse(categories);

    return {
      total: totalCategories,
      active: activeCategories,
      inactive: totalCategories - activeCategories,
      featured: featuredCategories,
      root: rootCategories,
      leaf: leafCategories,
      parent: parentCategories,
      products: totalProducts,
      inStock: totalInStock,
      outOfStock: totalOutOfStock,
      lowStock: totalLowStock,
      maxDepth: maxDepth + 1,
      averageProductsPerCategory:
        totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0,
    };
  };

  const stats = calculateStats();

  const statItems = [
    {
      label: "Total Categories",
      value: stats.total,
      icon: "📁",
      color: "blue",
    },
    {
      label: "Active",
      value: stats.active,
      icon: "✅",
      color: "green",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: "⏸️",
      color: "yellow",
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: "⭐",
      color: "purple",
    },
    {
      label: "Root Categories",
      value: stats.root,
      icon: "🌳",
      color: "indigo",
    },
    {
      label: "Leaf Categories",
      value: stats.leaf,
      icon: "🍃",
      color: "green",
    },
    {
      label: "Parent Categories",
      value: stats.parent,
      icon: "📁",
      color: "blue",
    },
    {
      label: "Total Products",
      value: stats.products,
      icon: "📦",
      color: "orange",
    },
    {
      label: "In Stock",
      value: stats.inStock,
      icon: "✅",
      color: "green",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: "❌",
      color: "red",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: "⚠️",
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      red: "bg-red-50 text-red-700 border-red-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Category Statistics
      </h3>

      <div className="space-y-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${getColorClasses(
              item.color
            )}`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-lg font-bold">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Category Depth:</span>
            <span className="font-medium">{stats.maxDepth} levels</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Products/Category:</span>
            <span className="font-medium">
              {stats.averageProductsPerCategory}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Rate:</span>
            <span className="font-medium">
              {stats.total > 0
                ? Math.round((stats.active / stats.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="flex justify-between">
            <span>Featured Rate:</span>
            <span className="font-medium">
              {stats.total > 0
                ? Math.round((stats.featured / stats.total) * 100)
                : 0}
              %
            </span>
          </div>
          {stats.products > 0 && (
            <>
              <div className="flex justify-between">
                <span>Stock Rate:</span>
                <span className="font-medium text-green-600">
                  {Math.round((stats.inStock / stats.products) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Out of Stock Rate:</span>
                <span className="font-medium text-red-600">
                  {Math.round((stats.outOfStock / stats.products) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock Rate:</span>
                <span className="font-medium text-yellow-600">
                  {Math.round((stats.lowStock / stats.products) * 100)}%
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span>Leaf Categories:</span>
            <span className="font-medium text-green-600">
              {stats.leaf} (Products assigned here)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Parent Categories:</span>
            <span className="font-medium text-blue-600">
              {stats.parent} (Aggregated counts)
            </span>
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Category Health
        </h4>
        <div className="flex items-center">
          {stats.inactive > stats.active ? (
            <div className="flex items-center text-red-600">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">
                More inactive than active categories
              </span>
            </div>
          ) : stats.active > 0 ? (
            <div className="flex items-center text-green-600">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">Category structure looks healthy</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">No categories found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
