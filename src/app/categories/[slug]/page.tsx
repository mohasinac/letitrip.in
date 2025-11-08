"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CardGrid } from "@/components/cards/CardGrid";
import { ProductCard } from "@/components/cards/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterSidebar } from "@/components/common/FilterSidebar";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { useFilters } from "@/hooks/useFilters";
import type { Category, Product } from "@/types";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    loadCategory();
  }, [params.slug]);

  useEffect(() => {
    if (category) {
      loadProducts();
      loadSubcategories();
    }
  }, [category]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getBySlug(params.slug);
      setCategory(data);
    } catch (error) {
      console.error("Failed to load category:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await productsService.list({
        categoryId: category!.id,
      });
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadSubcategories = async () => {
    try {
      const data = await categoriesService.list({
        parentId: category!.id,
      });
      setSubcategories(data || []);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-primary">
              Home
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/categories" className="hover:text-primary">
              Categories
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>

          {category.description && (
            <div
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Subcategories
              </h2>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <a
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    {sub.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {productsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="No products available in this category yet. Check back later!"
            action={{
              label: "Browse All Categories",
              onClick: () => router.push("/categories"),
            }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>

            <CardGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images?.[0] || ""}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  shopName={product.shopId}
                  shopSlug={product.shopId}
                  inStock={product.stockCount > 0}
                  condition={product.condition}
                />
              ))}
            </CardGrid>
          </>
        )}
      </div>
    </div>
  );
}
