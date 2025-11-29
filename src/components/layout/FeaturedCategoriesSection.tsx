"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface CategoryWithProducts {
  category: CategoryFE;
  products: ProductCardFE[];
}

export default function FeaturedCategoriesSection() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<
    CategoryWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCategories();
  }, []);

  const fetchFeaturedCategories = async () => {
    try {
      setLoading(true);
      const categories = await categoriesService.getHomepage();
      const topCategories = categories.slice(0, 3); // Reduced from 5 to 3

      const categoriesData = await Promise.all(
        topCategories.map(async (category: CategoryFE) => {
          try {
            const productsData = await productsService.list({
              categoryId: category.id,
              limit: 5, // Reduced from 10 to 5
            } as any);
            return {
              category,
              products: productsData.data,
            };
          } catch (error) {
            console.error(
              `Error fetching products for category ${category.id}:`,
              error,
            );
            return {
              category,
              products: [],
            };
          }
        }),
      );

      setCategoriesWithProducts(
        categoriesData.filter(
          (item: CategoryWithProducts) => item.products.length > 0,
        ),
      );
    } catch (error) {
      console.error("Error fetching featured categories:", error);
      setCategoriesWithProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="min-w-[280px] h-96 bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 py-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Shop by Category
        </h2>
        <p className="text-gray-600">
          Explore our featured categories and their top products
        </p>
      </div>
      {categoriesWithProducts.map(({ category, products }) => (
        <section key={category.id} className="space-y-4">
          {/* Category Header Card */}
          <div className="mb-4">
            <CategoryCard
              id={category.id}
              name={category.name}
              slug={category.slug}
              image={category.image || category.icon || undefined}
              description={category.description || undefined}
              productCount={category.productCount || 0}
              featured={category.featured}
              variant="compact"
            />
          </div>

          <HorizontalScrollContainer
            title=""
            viewAllLink={`/categories/${category.slug}`}
            viewAllText="View All in Category"
            itemWidth="280px"
            gap="1rem"
            headingLevel="h3"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                originalPrice={product.originalPrice || undefined}
                image={product.images[0] || "/placeholder-product.png"}
                rating={product.rating}
                reviewCount={product.reviewCount}
                shopName="Shop"
                shopSlug={`/shops/${product.shopId}`}
                inStock={product.stockCount > 0}
                featured={product.featured}
                condition={product.condition}
                showShopName={true}
                compact={false}
              />
            ))}
          </HorizontalScrollContainer>
        </section>
      ))}
    </div>
  );
}
