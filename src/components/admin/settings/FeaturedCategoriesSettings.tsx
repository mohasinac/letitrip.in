"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types/shared";

interface CategoryWithMeta extends Category {
  productCount?: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

export default function FeaturedCategoriesSettings() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<CategoryWithMeta[]>(
        "/admin/categories?format=list"
      );

      // Sort by sortOrder and featured status
      const sortedData = data.sort((a, b) => {
        // Featured categories first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by sortOrder
        return a.sortOrder - b.sortOrder;
      });

      setCategories(sortedData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCategories();
    }
  }, [authLoading, user, fetchCategories]);

  const handleToggleFeatured = (categoryId: string) => {
    setCategories((prev) => {
      const currentFeaturedCount = prev.filter((cat) => cat.featured).length;
      const category = prev.find((cat) => cat.id === categoryId);

      // Check if trying to add a 7th featured category
      if (category && !category.featured && currentFeaturedCount >= 6) {
        setError(
          "Maximum 6 categories can be featured. Please unfeature another category first."
        );
        setTimeout(() => setError(null), 5000);
        return prev;
      }

      const updated = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, featured: !cat.featured } : cat
      );
      return updated;
    });
    setHasChanges(true);
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
    setHasChanges(true);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index - 1]] = [
      newCategories[index - 1],
      newCategories[index],
    ];
    // Update sortOrder
    newCategories.forEach((cat, idx) => {
      cat.sortOrder = idx;
    });
    setCategories(newCategories);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [
      newCategories[index + 1],
      newCategories[index],
    ];
    // Update sortOrder
    newCategories.forEach((cat, idx) => {
      cat.sortOrder = idx;
    });
    setCategories(newCategories);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate: Check if more than 6 categories are featured
      const featuredCount = categories.filter((cat) => cat.featured).length;
      if (featuredCount > 6) {
        setError(
          "Cannot save: Maximum 6 categories can be featured. Please unfeature some categories."
        );
        setSaving(false);
        return;
      }

      // Prepare updates
      const updates = categories.map((cat) => ({
        id: cat.id,
        featured: cat.featured || false,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      }));

      console.log("Sending category updates:", updates);

      // Send batch update
      const response = await apiClient.post("/admin/categories/batch-update", {
        updates,
      });

      console.log("Category update response:", response);

      setSuccess("Featured categories updated successfully");
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving categories:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCategories();
    setHasChanges(false);
  };

  const featuredCategories = categories.filter((cat) => cat.featured);
  const nonFeaturedCategories = categories.filter((cat) => !cat.featured);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Categories ({featuredCategories.length}/6)
          </h2>
          {featuredCategories.length > 6 && (
            <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
              Exceeds limit - {featuredCategories.length - 6} too many
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1 pl-5 list-disc">
          <li>
            <strong>Maximum 6 categories</strong> can be featured on the
            homepage
          </li>
          <li>
            Use the arrows to reorder categories (top to bottom = left to right)
          </li>
          <li>Featured categories must be active to appear on the homepage</li>
          <li>Categories with no in-stock products will appear grey</li>
          <li>Attempting to add a 7th category will show an error</li>
        </ul>
      </div>

      {/* Warning for exceeding limit */}
      {featuredCategories.length > 6 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-1">
            ⚠️ Too many featured categories!
          </p>
          <p className="text-sm text-red-800">
            You have selected {featuredCategories.length} categories, but only 6
            can be featured. Please unfeature {featuredCategories.length - 6}{" "}
            {featuredCategories.length - 6 === 1 ? "category" : "categories"}{" "}
            before saving.
          </p>
        </div>
      )}

      {/* Featured Categories Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Featured Categories ({featuredCategories.length}/6)
              </h3>
            </div>
            {featuredCategories.length > 6 && (
              <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                Exceeds limit - only first 6 will show
              </span>
            )}
          </div>

          {featuredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No featured categories selected. Toggle the "Featured" switch
                below to add categories.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {featuredCategories.map((category, index) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  index={categories.findIndex((c) => c.id === category.id)}
                  totalCount={categories.length}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFeatured={true}
                  showWarning={index >= 6}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Categories Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Categories ({nonFeaturedCategories.length})
            </h3>
          </div>

          {nonFeaturedCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>All categories are featured!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nonFeaturedCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  index={categories.findIndex((c) => c.id === category.id)}
                  totalCount={categories.length}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFeatured={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: CategoryWithMeta;
  index: number;
  totalCount: number;
  onToggleFeatured: (id: string) => void;
  onToggleActive: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFeatured: boolean;
  showWarning?: boolean;
}

function CategoryItem({
  category,
  index,
  totalCount,
  onToggleFeatured,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isFeatured,
  showWarning,
}: CategoryItemProps) {
  return (
    <div
      className={`p-4 border rounded-lg flex items-center gap-3 hover:bg-gray-50 ${
        showWarning
          ? "border-amber-300 bg-amber-50/50"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Drag Handle & Order Controls */}
      {isFeatured && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* Category Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900 truncate">
            {category.name}
          </h4>
          {showWarning && (
            <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded whitespace-nowrap">
              Won't show
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-mono mb-1">{category.slug}</p>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 text-xs border border-gray-300 rounded-full text-gray-600">
            {category.productCount || 0} products
          </span>
          {category.inStockCount !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs border rounded-full ${
                category.inStockCount > 0
                  ? "border-green-300 text-green-700 bg-green-50"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {category.inStockCount} in stock
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            {category.isActive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            Active
          </span>
          <input
            type="checkbox"
            checked={category.isActive}
            onChange={() => onToggleActive(category.id)}
            className="w-10 h-5 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-blue-600 before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
          />
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="w-4 h-4" />
            Featured
          </span>
          <input
            type="checkbox"
            checked={category.featured}
            onChange={() => onToggleFeatured(category.id)}
            className="w-10 h-5 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-blue-600 before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
          />
        </label>
      </div>
    </div>
  );
}

