"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Star, Store } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductReviews } from "@/components/product/ProductReviews";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { Product, Shop } from "@/types";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [shopProductsLoading, setShopProductsLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);
  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsService.getBySlug(slug);
      setProduct(data);

      // Load shop info
      if (data.shopId) {
        try {
          const shopData = await shopsService.getBySlug(data.shopId);
          setShop(shopData);
        } catch (error) {
          console.error("Failed to load shop:", error);
        }
      }

      // Load related data
      loadVariants(slug);
      loadShopProducts(slug);
    } catch (error) {
      console.error("Failed to load product:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (slug: string) => {
    try {
      setVariantsLoading(true);
      const data = await productsService.getVariants(slug);
      setVariants(data.slice(0, 12)); // Limit to 12 variants
    } catch (error) {
      console.error("Failed to load variants:", error);
    } finally {
      setVariantsLoading(false);
    }
  };

  const loadShopProducts = async (slug: string) => {
    try {
      setShopProductsLoading(true);
      const data = await productsService.getSellerProducts(slug, 12);
      setShopProducts(data);
    } catch (error) {
      console.error("Failed to load shop products:", error);
    } finally {
      setShopProductsLoading(false);
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Product Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                    shop_name: shop?.name || product.shopId,
                    returnable: product.isReturnable,
                    condition: product.condition,
                    status: product.status,
                    image: product.images?.[0] || "",
                  }}
                />
              </div>
            </div>

            {/* Description & Specs */}
            <ProductDescription
              description={product.description}
              specifications={product.specifications?.reduce(
                (acc, spec) => {
                  acc[spec.name] = spec.value;
                  return acc;
                },
                {} as Record<string, string>,
              )}
            />

            {/* Variants Section */}
            {variants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Other Options (Variants)
                </h2>
                <p className="text-gray-600 mb-6">
                  Similar products in this category that might interest you
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      onClick={() => router.push(`/products/${variant.slug}`)}
                      className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={variant.images?.[0] || ""}
                          alt={variant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {variant.name}
                        </h3>
                        <div className="text-lg font-bold text-gray-900">
                          ₹{variant.price.toLocaleString()}
                        </div>
                        {variant.originalPrice &&
                          variant.originalPrice > variant.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{variant.originalPrice.toLocaleString()}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* From This Shop Section */}
            {shopProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      More from this shop
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Explore other products from this seller
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/shops/${product.shopId}`)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View Shop →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {shopProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/products/${item.slug}`)}
                      className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.images?.[0] || ""}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {item.name}
                        </h3>
                        <div className="text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </div>
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ProductReviews productId={product.id} productSlug={product.slug} />

            {/* Similar Products */}
            <SimilarProducts
              productId={product.id}
              categoryId={product.categoryId}
              currentShopId={product.shopId}
            />
          </div>

          {/* Right Column - Shop Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Shop Info Card */}
              {shop && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Seller Information
                  </h3>

                  <div className="space-y-4">
                    {/* Shop Logo */}
                    {shop.logo && (
                      <div className="flex justify-center">
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                    )}

                    {/* Shop Name */}
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">
                        {shop.name}
                      </h4>
                      {shop.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                          ✓ Verified Seller
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {shop.rating > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(shop.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">
                          {shop.rating.toFixed(1)} ({shop.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {shop.productCount || 0}
                        </p>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {shopProducts.length}
                        </p>
                        <p className="text-xs text-gray-600">In Stock</p>
                      </div>
                    </div>

                    {/* Visit Shop Button */}
                    <Link
                      href={`/shops/${shop.slug}`}
                      className="block w-full text-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                    >
                      Visit Shop
                    </Link>

                    {/* Contact Seller Button */}
                    {shop.email && (
                      <a
                        href={`mailto:${shop.email}`}
                        className="block w-full text-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Contact Seller
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery & Returns Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Delivery & Returns
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p>• Free delivery on orders above ₹5,000</p>
                  <p>• Standard delivery: 5-7 business days</p>
                  {product.isReturnable && (
                    <p>• 7-day return policy available</p>
                  )}
                  <p>• Cash on delivery available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
