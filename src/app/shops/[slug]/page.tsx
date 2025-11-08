"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductCard } from "@/components/cards/ProductCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import type { Shop, Product } from "@/types";

interface ShopPageProps {
  params: {
    slug: string;
  };
}

export default function ShopPage({ params }: ShopPageProps) {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    loadShop();
    loadProducts();
  }, [params.slug]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const data = await shopsService.getBySlug(params.slug);
      setShop(data);
    } catch (error) {
      console.error("Failed to load shop:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await productsService.list({
        shopId: params.slug,
        status: "active" as any,
        limit: 20,
      });
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <ShopHeader shop={shop} />

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* About Section */}
        {shop.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: shop.description }}
            />
          </div>
        )}

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products available"
              description="This shop hasn't listed any products yet"
            />
          ) : (
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
                  shopName={shop.name}
                  shopSlug={shop.slug}
                  inStock={product.stockCount > 0}
                  isFeatured={product.isFeatured}
                  condition={product.condition}
                  showShopName={false}
                />
              ))}
            </CardGrid>
          )}
        </div>
      </div>
    </div>
  );
}
