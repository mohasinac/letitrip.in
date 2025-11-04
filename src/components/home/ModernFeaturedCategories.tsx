"use client";
import React from "react";
import { ArrowRight, TrendingUp, Package } from "lucide-react";
import NextLink from "next/link";
import type { Category } from "@/types/shared";
import {
  UnifiedCard,
  CardMedia,
  CardContent,
  PrimaryButton,
  UnifiedBadge,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

interface CategoryWithCount extends Category {
  productCount: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

interface ModernFeaturedCategoriesProps {
  categories: CategoryWithCount[];
}

export default function ModernFeaturedCategories({
  categories,
}: ModernFeaturedCategoriesProps) {
  // Filter only featured categories
  const featuredCategories = categories.filter(
    (cat) => cat.featured && cat.isActive
  );

  // If no featured categories, don't render the section
  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-surface">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Featured Categories
          </h2>
          <p className="text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of Beyblades across all generations
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((category) => {
            const hasProducts = (category.inStockCount || 0) > 0;

            return (
              <NextLink
                key={category.id}
                href={hasProducts ? `/products?category=${category.slug}` : "#"}
                className={cn(
                  "block transition-all",
                  !hasProducts && "pointer-events-none"
                )}
              >
                <UnifiedCard
                  variant="elevated"
                  className={cn(
                    "h-full transition-all duration-300 cursor-pointer",
                    "hover:-translate-y-2 hover:shadow-xl",
                    hasProducts
                      ? "hover:border-primary/50"
                      : "opacity-75 bg-surface/50"
                  )}
                >
                  {/* Trending Badge */}
                  {category.featured && hasProducts && (
                    <div className="absolute top-4 right-4 z-10">
                      <UnifiedBadge variant="warning" size="sm" rounded>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </UnifiedBadge>
                    </div>
                  )}

                  {/* Image */}
                  <CardMedia
                    className={cn(
                      "h-48 flex items-center justify-center relative overflow-hidden",
                      category.image
                        ? "bg-cover bg-center"
                        : "bg-gradient-to-br from-primary/10 to-primary/5"
                    )}
                    style={
                      category.image
                        ? { backgroundImage: `url(${category.image})` }
                        : undefined
                    }
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-radial-gradient from-primary/20 to-transparent" />

                    {/* Icon if no image */}
                    {!category.image && (
                      <Package
                        className={cn(
                          "w-20 h-20 z-10",
                          hasProducts ? "text-primary" : "text-textTertiary",
                          "opacity-80"
                        )}
                      />
                    )}
                  </CardMedia>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-text">
                      {category.name}
                    </h3>
                    <p className="text-sm text-textSecondary mb-4 line-clamp-2">
                      {category.description || "Explore this category"}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          hasProducts ? "text-primary" : "text-textTertiary"
                        )}
                      >
                        {category.productCount > 0
                          ? `${category.productCount}+ Products`
                          : "Coming Soon"}
                      </span>

                      {hasProducts && (
                        <ArrowRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </CardContent>
                </UnifiedCard>
              </NextLink>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <NextLink href="/categories">
            <PrimaryButton size="lg" className="group">
              View All Categories
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </PrimaryButton>
          </NextLink>
        </div>
      </div>
    </section>
  );
}
