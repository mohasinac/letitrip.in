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
import { notFound } from "@/lib/error-redirects";
import type { ProductFE, ProductCardFE } from "@/types/frontend/product.types";
import type { ShopFE } from "@/types/frontend/shop.types";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [product, setProduct] = useState<ProductFE | null>(null);
  const [shop, setShop] = useState<ShopFE | null>(null);
  const [variants, setVariants] = useState<ProductCardFE[]>([]);
  const [shopProducts, setShopProducts] = useState<ProductCardFE[]>([]);
  const [similarProducts, setSimilarProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [shopProductsLoading, setShopProductsLoading] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);

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
    } catch (error: any) {
      console.error("Failed to load product:", error);
      router.push(notFound.product(slug, error));
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
      // Silently fail - variants are optional
      setVariants([]);
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
      // Silently fail - shop products are optional
      setShopProducts([]);
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
    ...product.images.map((url: string) => ({ url, type: "image" as const })),
    ...(product.videos || []).map((url: string) => ({
      url,
      type: "video" as const,
    })),
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

      {/* Main Content - Row 1: Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Column 1 - Product Gallery (Large - 5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <ProductGallery media={media} productName={product.name} />
            </div>
          </div>

          {/* Column 2 - Product Details & Variants (Large - 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Product Details with Shop Link */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>

                {/* Rating & Reviews Link */}
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <a
                      href="#reviews"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                      reviews)
                    </a>
                  </div>
                )}

                {/* Shop Link */}
                {shop && (
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    <span className="font-medium">{shop.name}</span>
                    {shop.isVerified && (
                      <span className="text-green-600 text-xs">✓ Verified</span>
                    )}
                  </Link>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {product.description}
                </p>
              )}

              {/* Key Features */}
              <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="font-medium capitalize">
                    {product.condition || "New"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span className="font-medium">
                    {product.stockCount} available
                  </span>
                </div>
                {product.isReturnable && (
                  <div className="flex justify-between">
                    <span>Returns:</span>
                    <span className="font-medium text-green-600">
                      7-day return
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variants Slider - Full Width */}
            {variants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Other Options ({variants.length})
                  </h3>
                  {variants.length > 6 && (
                    <button
                      onClick={() => setShowAllVariants(!showAllVariants)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAllVariants ? "Show Less ↑" : "Expand All ↓"}
                    </button>
                  )}
                </div>

                {/* Horizontal Scrollable Variants */}
                <div
                  className={`grid gap-3 ${
                    showAllVariants
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {(showAllVariants ? variants : variants.slice(0, 6)).map(
                    (variant) => (
                      <div
                        key={variant.id}
                        onClick={() => router.push(`/products/${variant.slug}`)}
                        className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <img
                            src={
                              variant.primaryImage || variant.images?.[0] || ""
                            }
                            alt={variant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-900 font-medium line-clamp-2 mb-1">
                            {variant.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">
                              {variant.formattedPrice}
                            </span>
                            {variant.compareAtPrice &&
                              variant.compareAtPrice > variant.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{variant.compareAtPrice.toLocaleString()}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 3 - Price & Actions (Compact - 3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-4 space-y-6">
              {/* Price Section */}
              <div className="border-b pb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{product.compareAtPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(
                            ((product.compareAtPrice - product.price) /
                              product.compareAtPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                </div>
                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Add to Cart
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Buy Now
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors">
                  Add to Wishlist ❤️
                </button>
              </div>

              {/* Delivery Info */}
              <div className="border-t pt-4 text-sm space-y-2 text-gray-600">
                <p className="font-semibold text-gray-900">Delivery Options:</p>
                <p>• Free delivery on orders ₹5,000+</p>
                <p>• Standard: 5-7 business days</p>
                {product.isReturnable && <p>• 7-day return policy</p>}
                <p>• Cash on delivery available</p>
              </div>

              {/* Shop Quick Info */}
              {shop && (
                <div className="border-t pt-4">
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {shop.logo && (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {shop.name}
                      </p>
                      {shop.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{shop.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-blue-600 group-hover:underline">
                      Visit →
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Variants as separate row before description */}
        {variants.length > 0 && (
          <div className="lg:hidden mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Other Options ({variants.length})
              </h3>
              {variants.length > 4 && (
                <button
                  onClick={() => setShowAllVariants(!showAllVariants)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllVariants ? "Show Less ↑" : "Expand All ↓"}
                </button>
              )}
            </div>

            <div
              className={`grid gap-3 ${
                showAllVariants ? "grid-cols-2" : "grid-cols-2"
              }`}
            >
              {(showAllVariants ? variants : variants.slice(0, 4)).map(
                (variant) => (
                  <div
                    key={variant.id}
                    onClick={() => router.push(`/products/${variant.slug}`)}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={variant.primaryImage || variant.images?.[0] || ""}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-900 font-medium line-clamp-2 mb-1">
                        {variant.name}
                      </p>
                      <span className="text-sm font-bold text-gray-900">
                        {variant.formattedPrice}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Product Description (Full Width) */}
      <div className="bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductDescription
            description={product.description}
            specifications={product.specifications}
          />
        </div>
      </div>

      {/* Row 3: Seller Similar Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {shopProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  More from this shop
                </h2>
                <p className="text-gray-600 mt-1">
                  Explore other products from {shop?.name || "this seller"}
                </p>
              </div>
              <button
                onClick={() => router.push(`/shops/${product.shopId}`)}
                className="text-blue-600 hover:underline font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {shopProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/products/${item.slug}`)}
                  className="cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={item.primaryImage || item.images?.[0] || ""}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                    <div className="text-base font-bold text-gray-900">
                      {item.formattedPrice}
                    </div>
                    {item.compareAtPrice &&
                      item.compareAtPrice > item.price && (
                        <div className="text-xs text-gray-500 line-through">
                          ₹{item.compareAtPrice.toLocaleString()}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Reviews Section */}
      <div className="bg-gray-50 border-t" id="reviews">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>

      {/* Row 5: Similar Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SimilarProducts
          productId={product.id}
          categoryId={product.categoryId}
          currentShopId={product.shopId}
        />
      </div>
    </div>
  );
}
