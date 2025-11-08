"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductReviews } from "@/components/product/ProductReviews";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [params.slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsService.getBySlug(params.slug);
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Prepare media for gallery
  const media = [
    ...product.images.map((url) => ({ url, type: "image" as const })),
    ...(product.videos || []).map((url) => ({ url, type: "video" as const })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <ProductGallery media={media} productName={product.name} />

            {/* Info & Actions */}
            <ProductInfo
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                actualPrice: product.costPrice,
                originalPrice: product.originalPrice,
                salePrice: product.price,
                stock: product.stockCount,
                rating: product.rating,
                reviewCount: product.reviewCount,
                shop_id: product.shopId,
                shop_name: product.shopId, // Would need to fetch shop name
                returnable: product.isReturnable,
                condition: product.condition,
                status: product.status,
              }}
            />
          </div>
        </div>

        {/* Description & Specs */}
        <div className="mb-6">
          <ProductDescription
            description={product.description}
            specifications={product.specifications?.reduce((acc, spec) => {
              acc[spec.name] = spec.value;
              return acc;
            }, {} as Record<string, string>)}
          />
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>

        {/* Similar Products */}
        <SimilarProducts
          productId={product.id}
          categoryId={product.categoryId}
          currentShopId={product.shopId}
        />
      </div>
    </div>
  );
}
