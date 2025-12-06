/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedCategoriesSection
 * @description Featured categories section using FeaturedSection pattern
 *
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 */

"use client";

import { CategoryCard } from "@/components/cards/CategoryCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { apiService } from "@/services/api.service";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import { FolderTree } from "lucide-react";

interface FeaturedItem {
  id: string;
  type: string;
  itemId: string;
  name: string;
  image?: string;
  position: number;
  active: boolean;
}

interface Props {
  maxCategories?: number;
}

export default function FeaturedCategoriesSection({
  maxCategories = 10,
}: Props) {
  const fetchFeaturedCategories = async (): Promise<CategoryFE[]> => {
    try {
      const response: any = await apiService.get("/homepage");
      const featuredItems: FeaturedItem[] =
        response.data?.featuredItems?.categories || [];

      if (featuredItems.length > 0) {
        const activeItems = featuredItems
          .filter((item) => item.active)
          .sort((a, b) => a.position - b.position)
          .slice(0, maxCategories);

        const categoryIds = activeItems.map((item) => item.itemId);
        if (categoryIds.length > 0) {
          const categoriesData = await categoriesService.list({
            ids: categoryIds,
          });
          const sortedCategories = categoryIds
            .map((id) => categoriesData.find((c) => c.id === id))
            .filter((c): c is CategoryFE => c !== undefined);
          if (sortedCategories.length > 0) {
            return sortedCategories;
          }
        }
      }
    } catch (error) {}

    const featuredCategories = await categoriesService.list({
      featured: true,
      limit: maxCategories,
    });
    return featuredCategories;
  };

  return (
    <FeaturedSection<CategoryFE>
      title=" Popular Categories"
      icon={FolderTree}
      viewAllLink="/categories"
      viewAllText="View All Categories"
      fetchData={fetchFeaturedCategories}
      renderItem={(category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          slug={category.slug}
          image={category.image}
          description={category.description}
          productCount={category.productCount}
          featured={category.featured}
        />
      )}
      itemWidth="280px"
    />
  );
}
