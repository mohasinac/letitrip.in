"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GripVertical,
  Save,
  RefreshCw,
  TrendingUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import SettingsLayout from "@/components/admin/settings/SettingsLayout";
import { useAuth } from '@/lib/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types/shared";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import {
  UnifiedCard,
  CardContent,
  UnifiedButton,
  UnifiedAlert,
  UnifiedSwitch,
  UnifiedBadge,
  UnifiedInput,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

interface CategoryWithMeta extends Category {
  productCount?: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

function FeaturedCategoriesContent() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Settings",
      href: "/admin/settings",
    },
    {
      label: "Featured Categories",
      href: "/admin/settings/featured-categories",
      active: true,
    },
  ]);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<CategoryWithMeta[]>(
        "/admin/categories?format=list",
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
    } else if (!authLoading && !user) {
      setError("Not authenticated");
      setLoading(false);
    }
  }, [authLoading, user, fetchCategories]);

  const handleToggleFeatured = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const currentFeaturedCount = categories.filter((c) => c.featured).length;

    // Check if trying to add a 7th featured category
    if (category && !category.featured && currentFeaturedCount >= 6) {
      setError(
        "Maximum 6 categories can be featured. Please remove one first.",
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, featured: !cat.featured } : cat,
      ),
    );
    setHasChanges(true);
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
      ),
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

      // Prepare updates
      const updates = categories.map((cat) => ({
        id: cat.id,
        featured: cat.featured || false,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      }));

      // Send batch update
      await apiClient.post("/admin/categories/batch-update", { updates });

      setSuccess("Featured categories updated successfully");
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save changes");
      console.error(err);
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

  // Filter categories based on search query
  const filteredNonFeatured = nonFeaturedCategories.filter((cat) =>
    searchQuery.trim()
      ? cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  return (
    <SettingsLayout>
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Alerts */}
          {error && (
            <UnifiedAlert
              variant="error"
              onClose={() => setError(null)}
              className="mb-4"
            >
              {error}
            </UnifiedAlert>
          )}
          {success && (
            <UnifiedAlert
              variant="success"
              onClose={() => setSuccess(null)}
              className="mb-4"
            >
              {success}
            </UnifiedAlert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mb-6">
            <div className="flex gap-4">
              <UnifiedButton
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </UnifiedButton>
              <UnifiedButton
                onClick={handleSave}
                disabled={!hasChanges || saving || loading}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </UnifiedButton>
            </div>
          </div>

          {/* Info */}
          <UnifiedAlert variant="info" className="mb-8">
            <p className="font-semibold mb-2">💡 Tips:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Maximum 6 categories will be shown on the homepage</li>
              <li>
                Use the arrows to reorder categories (top to bottom = left to
                right)
              </li>
              <li>
                Featured categories must be active to appear on the homepage
              </li>
              <li>Categories with no in-stock products will appear grey</li>
            </ul>
          </UnifiedAlert>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Featured Categories Section */}
              <UnifiedCard className="mb-8">
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">
                        Featured Categories ({featuredCategories.length}/6)
                      </h2>
                    </div>
                    {featuredCategories.length > 6 && (
                      <UnifiedBadge variant="warning">
                        Exceeds limit - only first 6 will show
                      </UnifiedBadge>
                    )}
                  </div>

                  {featuredCategories.length === 0 ? (
                    <div className="text-center py-8 text-textSecondary">
                      <p>
                        No featured categories selected. Toggle the "Featured"
                        switch below to add categories.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {featuredCategories.map((category, index) => (
                        <CategoryItem
                          key={category.id}
                          category={category}
                          index={categories.findIndex(
                            (c) => c.id === category.id,
                          )}
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
                </CardContent>
              </UnifiedCard>

              {/* Available Categories Section */}
              <UnifiedCard>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      Available Categories ({filteredNonFeatured.length})
                    </h2>
                  </div>

                  {/* Search Field */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
                    <UnifiedInput
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {filteredNonFeatured.length === 0 ? (
                    <div className="text-center py-8 text-textSecondary">
                      <p>
                        {searchQuery.trim()
                          ? "No categories match your search"
                          : "All categories are featured!"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredNonFeatured.map((category) => (
                        <CategoryItem
                          key={category.id}
                          category={category}
                          index={categories.findIndex(
                            (c) => c.id === category.id,
                          )}
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
                </CardContent>
              </UnifiedCard>
            </>
          )}
        </div>
      </div>
    </SettingsLayout>
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
      className={cn(
        "p-4 border rounded-lg flex items-center gap-4 transition-colors hover:bg-surfaceHover",
        showWarning
          ? "border-warning bg-warning/10"
          : "border-border bg-surface"
      )}
    >
      {/* Drag Handle & Order Controls */}
      {isFeatured && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Category Image */}
      <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-surfaceHover flex items-center justify-center flex-shrink-0">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-textSecondary" />
        )}
      </div>

      {/* Category Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold truncate">{category.name}</h3>
          {showWarning && (
            <UnifiedBadge variant="warning">Won't show</UnifiedBadge>
          )}
        </div>
        <p className="text-xs text-textSecondary font-mono mb-2">
          {category.slug}
        </p>
        <div className="flex gap-2">
          <UnifiedBadge variant="default">
            {category.productCount || 0} products
          </UnifiedBadge>
          {category.inStockCount !== undefined && (
            <UnifiedBadge
              variant={category.inStockCount > 0 ? "success" : "default"}
            >
              {category.inStockCount} in stock
            </UnifiedBadge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            {category.isActive ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <span>Active</span>
          </div>
          <UnifiedSwitch
            checked={category.isActive}
            onChange={() => onToggleActive(category.id)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Featured</span>
          </div>
          <UnifiedSwitch
            checked={category.featured || false}
            onChange={() => onToggleFeatured(category.id)}
          />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCategoriesPage() {
  return (
    <RoleGuard requiredRole="admin">
      <FeaturedCategoriesContent />
    </RoleGuard>
  );
}
