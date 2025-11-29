"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Star, Store } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductVariants } from "@/components/product/ProductVariants";
import { SellerProducts } from "@/components/product/SellerProducts";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import { notFound } from "@/lib/error-redirects";
import { formatINR, formatDiscount } from "@/lib/price.utils";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/components/admin/Toast";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { ProductCardSkeletonGrid } from "@/components/common/skeletons/ProductCardSkeleton";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getBySlug(slug);
      setProduct(data);

      // Load shop info
      if (data.shopId) {
        try {
          const shopData = await shopsService.getBySlug(data.shopId);
          setShop(shopData);
        } catch (error) {
          console.error("Failed to load shop:", error);
          // Non-critical error, continue showing product
        }
      }
    } catch (error: any) {
      console.error("Failed to load product:", error);
      setError(error.message || "Failed to load product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          </div>
          <ProductCardSkeletonGrid count={1} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage
          message={error}
          showRetry
          onRetry={loadProduct}
          showGoBack
          onGoBack={() => router.push("/products")}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage
          message="Product not found. It may have been removed or is no longer available."
          showGoBack
          onGoBack={() => router.push("/products")}
        />
      </div>
    );
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

      {/* Amazon-Style Layout: Main Product Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* 1. Product Gallery (Left - 40%) */}
            <div className="lg:col-span-5">
              <div className="sticky top-4">
                <ProductGallery media={media} productName={product.name} />
              </div>
            </div>

            {/* 2. Product Info & Features (Center - 35%) */}
            <div className="lg:col-span-4">
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                {/* Shop Link - Visit Store */}
                {shop && (
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                  >
                    Visit the {shop.name} Store
                  </Link>
                )}

                {/* Rating & Reviews Link */}
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {product.averageRating.toFixed(1)}
                      </span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <a
                      href="#reviews"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {product.reviewCount} ratings
                    </a>
                  </div>
                )}

                <hr className="my-4" />

                {/* Price (shown in center col like Amazon) */}
                {product.price && (
                  <>
                    <div className="flex items-baseline gap-2 mb-2">
                      {formatDiscount(
                        product.compareAtPrice,
                        product.price,
                      ) && (
                        <span className="text-sm font-medium text-red-600">
                          {formatDiscount(
                            product.compareAtPrice,
                            product.price,
                          )}
                        </span>
                      )}
                      <span className="text-3xl font-medium text-gray-900">
                        {formatINR(product.price)}
                      </span>
                    </div>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <div className="text-sm text-gray-600">
                          M.R.P.:{" "}
                          <span className="line-through">
                            {formatINR(product.compareAtPrice)}
                          </span>
                        </div>
                      )}
                    <p className="text-xs text-gray-600">
                      Inclusive of all taxes
                    </p>
                  </>
                )}

                <hr className="my-4" />

                {/* Product Features */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    About this item
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                    <li>
                      Condition:{" "}
                      <span className="capitalize">
                        {product.condition || "New"}
                      </span>
                    </li>
                    <li>Stock: {product.stockCount} units available</li>
                    {product.isReturnable && (
                      <li className="text-green-600">
                        7-day return policy available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Price & Actions Box (Right - 25%) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 lg:sticky lg:top-4">
                <div className="space-y-4">
                  {/* Price in Buy Box */}
                  {product.price && (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-medium text-gray-900">
                          {formatINR(product.price)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="text-sm">
                    <p className="text-green-600 font-medium">In Stock</p>
                    <p className="text-gray-600 text-xs">
                      Ships from: {shop?.name || "Seller"}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Sold by: {shop?.name || "Seller"}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  {product.stockCount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Quantity:
                      </label>
                      <select
                        value={selectedQuantity}
                        onChange={(e) =>
                          setSelectedQuantity(Number(e.target.value))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[...Array(Math.min(product.stockCount, 10))].map(
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        if (product.stockCount === 0) {
                          toast.error("Product is out of stock");
                          return;
                        }
                        try {
                          await addItem(
                            product.id,
                            selectedQuantity,
                            undefined,
                            {
                              name: product.name,
                              price: product.price,
                              image: product.images[0],
                              shopId: product.shopId,
                              shopName: shop?.name || product.shopId,
                            },
                          );
                          toast.success(
                            `Added ${selectedQuantity} item(s) to cart`,
                          );
                        } catch (error: any) {
                          toast.error(error.message || "Failed to add to cart");
                        }
                      }}
                      disabled={cartLoading || product.stockCount === 0}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium py-2.5 px-4 rounded-full transition-colors"
                    >
                      {cartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                    <button
                      onClick={async () => {
                        if (product.stockCount === 0) {
                          toast.error("Product is out of stock");
                          return;
                        }
                        try {
                          await addItem(
                            product.id,
                            selectedQuantity,
                            undefined,
                            {
                              name: product.name,
                              price: product.price,
                              image: product.images[0],
                              shopId: product.shopId,
                              shopName: shop?.name || product.shopId,
                            },
                          );
                          router.push("/checkout");
                        } catch (error: any) {
                          toast.error(error.message || "Failed to add to cart");
                        }
                      }}
                      disabled={cartLoading || product.stockCount === 0}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-full transition-colors"
                    >
                      {cartLoading ? "Processing..." : "Buy Now"}
                    </button>
                  </div>

                  {/* Additional Options */}
                  <div className="text-sm space-y-2 border-t pt-3">
                    <button className="w-full text-left text-blue-600 hover:text-blue-700 hover:underline">
                      Add to Wish List
                    </button>
                    <button className="w-full text-left text-blue-600 hover:text-blue-700 hover:underline">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Product Variants (Same Category) */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductVariants
            productId={product.id}
            categoryId={product.categoryId}
            currentShopId={product.shopId}
            categoryName={product.category?.name || "this category"}
          />
        </div>
      </div>

      {/* 5. Product Description (Full Width) */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Description
          </h2>
          <ProductDescription
            description={product.description}
            specifications={product.specifications}
          />
        </div>
      </div>

      {/* 6. Seller Products (Same/Parent Category) */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SellerProducts
            productId={product.id}
            categoryId={product.categoryId}
            shopId={product.shopId}
            shopName={shop?.name || product.shopId}
          />
        </div>
      </div>

      {/* 7. Similar Products (From Parent Categories) */}
      {product.categoryIds && product.categoryIds.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <SimilarProducts
              productId={product.id}
              parentCategoryIds={product.categoryIds.filter(
                (id: string) => id !== product.categoryId,
              )}
              currentShopId={product.shopId}
              parentCategoryName="related categories"
            />
          </div>
        </div>
      )}

      {/* 8. Customer Reviews & Ratings */}
      <div className="bg-white border-t" id="reviews">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>
    </div>
  );
}
