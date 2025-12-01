# Doc 22: Similar Categories Component

> **Status**: ✅ Complete
> **Priority**: ✅ Complete
> **Last Updated**: December 2025

## Problem

Category detail pages showed subcategories but not sibling categories (categories at the same tree level with the same parent). Users had no way to discover related categories.

## Solution

Created a new `SimilarCategories` component that:

1. Fetches sibling categories via existing API (`/api/categories/[slug]/similar`)
2. Displays them in a horizontal scrollable carousel
3. Shows empty state with "View All Categories" button when no siblings exist

## Files Created/Modified

### New File: `src/components/category/SimilarCategories.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Grid3X3, Folder } from "lucide-react";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

interface SimilarCategoriesProps {
  categorySlug: string;
  categoryName?: string;
  limit?: number;
}

export function SimilarCategories({
  categorySlug,
  categoryName = "this category",
  limit = 10,
}: SimilarCategoriesProps) {
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [loading, setLoading] = useState(true);
  // ... scroll state

  useEffect(() => {
    loadSimilarCategories();
  }, [categorySlug]);

  const loadSimilarCategories = async () => {
    const response = await categoriesService.getSimilarCategories(
      categorySlug,
      { limit }
    );
    setCategories(response.data || []);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3>Similar Categories</h3>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-40 h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="space-y-4 mt-8">
        <h3>Similar Categories</h3>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <Folder className="w-12 h-12 text-gray-400 mb-4" />
          <p>No similar categories available</p>
          <Link href="/categories" className="btn-primary">
            View All Categories
          </Link>
        </div>
      </div>
    );
  }

  // Horizontal carousel with category cards
  return (
    <div className="space-y-4 mt-8">
      <h3>Similar Categories</h3>
      <div className="relative group">
        {/* Scroll buttons */}
        <div
          id="similar-categories-scroll"
          className="flex gap-4 overflow-x-auto"
        >
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <div className="w-40 rounded-xl shadow-sm border">
                {category.image ? (
                  <img src={category.image} alt={category.name} />
                ) : (
                  <Folder className="w-10 h-10 text-blue-400" />
                )}
                <h4>{category.name}</h4>
                <p>{category.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Modified: `src/app/categories/[slug]/page.tsx`

Added import:

```tsx
import { SimilarCategories } from "@/components/category/SimilarCategories";
```

Added section after subcategories:

```tsx
{
  /* Similar Categories Section (sibling categories at same tree level) */
}
{
  category && (
    <div className="mt-8 mb-8 px-4 md:px-8">
      <SimilarCategories
        categorySlug={category.slug}
        categoryName={category.name}
        limit={12}
      />
    </div>
  );
}
```

## API Used

Existing endpoint: `GET /api/categories/[slug]/similar`

- Returns sibling categories (same parent)
- For root categories, returns other root categories
- Already implemented in `categoriesService.getSimilarCategories()`

## Result

- Category pages now show sibling categories
- Users can discover related categories easily
- Empty state guides users to browse all categories
- Horizontal scroll with navigation arrows
- Dark mode support included
