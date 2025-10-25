"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";

interface LeafCategory {
  id: string;
  name: string;
  fullPath: string;
  level: number;
  productCount?: number;
  inStockCount?: number;
  outOfStockCount?: number;
  lowStockCount?: number;
  isActive: boolean;
}

export default function LeafCategoriesDemo() {
  const [leafCategories, setLeafCategories] = useState<LeafCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeafCategories = async () => {
    try {
      if (!user) return;

      const data = (await apiClient.get(
        "/admin/categories/leaf?includeInactive=true"
      )) as any;
      setLeafCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching leaf categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeafCategories();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Loading Leaf Categories...
        </h3>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          🍃 Leaf Categories
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {leafCategories.length} total
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Categories where products are directly assigned. Parent categories
        automatically inherit these counts.
      </p>

      <div className="space-y-3">
        {leafCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🌱</div>
            <p className="font-medium">No leaf categories found</p>
            <p className="text-sm">
              Create categories without children to assign products
            </p>
          </div>
        ) : (
          leafCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-green-900">
                    {category.name}
                  </h4>
                  {!category.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {category.fullPath}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-green-600">
                  <span>Level {category.level}</span>
                  {category.productCount !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-medium">
                        {category.productCount} products
                      </span>
                      {category.inStockCount !== undefined && (
                        <span className="text-green-700">
                          ✓ {category.inStockCount} in stock
                        </span>
                      )}
                      {category.outOfStockCount !== undefined &&
                        category.outOfStockCount > 0 && (
                          <span className="text-red-600">
                            ✗ {category.outOfStockCount} out of stock
                          </span>
                        )}
                      {category.lowStockCount !== undefined &&
                        category.lowStockCount > 0 && (
                          <span className="text-yellow-600">
                            ⚠ {category.lowStockCount} low stock
                          </span>
                        )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🍃 Leaf
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">
          📋 How Leaf Categories Work
        </h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-3">
            <span className="text-lg">🍃</span>
            <div>
              <strong>Leaf Categories:</strong> Categories with no children
              where products are directly assigned. These show actual product
              counts and stock levels.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">📁</span>
            <div>
              <strong>Parent Categories:</strong> Automatically aggregate counts
              from all descendant leaf categories. No products are directly
              assigned here.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">🔍</span>
            <div>
              <strong>Search & Navigation:</strong> Products are searchable
              through the entire category hierarchy. Search in a parent category
              includes all descendant products.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">📊</span>
            <div>
              <strong>Stock Tracking:</strong> Real-time inventory tracking at
              leaf level with automatic aggregation up the hierarchy tree.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={fetchLeafCategories}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
