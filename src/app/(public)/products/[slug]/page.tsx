"use client";

import { toast } from "@/components/admin/Toast";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductVariants } from "@/components/product/ProductVariants";
import { SellerProducts } from "@/components/product/SellerProducts";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { RecentlyViewedWidget } from "@/components/products/RecentlyViewedWidget";
import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import { useProductBySlug } from "@/hooks/queries/useProduct";
import { useShop } from "@/hooks/queries/useShop";
import { formatDiscount, formatINR } from "@/lib/price.utils";
import { ErrorMessage, useCart } from "@letitrip/react-library";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        </div>
        <ProductCardSkeletonGrid count={1} />
      </div>
    </div>
  );
}

function ProductContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Use React Query hooks for data fetching
  const { data: product, isLoading, error } = useProductBySlug(slug);
  const { data: shop } = useShop(product?.shopId, {
    enabled: !!product?.shopId,
  });

  const { addItem, loading: cartLoading } = useCart();
  const { addToHistory } = useViewingHistory();

  // Track product view in history
  useEffect(() => {
    if (product && shop) {
      addToHistory({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || "",
        price: product.price,
        shopName: shop.name || "",
        inStock: product.isInStock !== false,
      });
    }
  }, [product, shop, addToHistory]);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorMessage
          message={error.message || "Failed to load product. Please try again."}
          showRetry
          onRetry={() => window.location.reload()}
          showGoBack
          onGoBack={() => router.push("/products")}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Products
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Amazon-Style Layout: Main Product Section */}
      <div className="bg-white dark:bg-gray-800">
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>

                {/* Shop Link - Visit Store */}
                {shop && (
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {product.reviewCount} ratings
                    </a>
                  </div>
                )}

                <hr className="my-4 dark:border-gray-700" />

                {/* Price (shown in center col like Amazon) */}
                {product.price && (
                  <>
                    <div className="flex items-baseline gap-2 mb-2">
                      {formatDiscount(
                        product.compareAtPrice,
                        product.price,
                      ) && (
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {formatDiscount(
                            product.compareAtPrice,
                            product.price,
                          )}
                        </span>
                      )}
                      <span className="text-3xl font-medium text-gray-900 dark:text-white">
                        {formatINR(product.price)}
                      </span>
                    </div>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          M.R.P.:{" "}
                          <span className="line-through">
                            {formatINR(product.compareAtPrice)}
                          </span>
                        </div>
                      )}
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Inclusive of all taxes
                    </p>
                  </>
                )}

                <hr className="my-4 dark:border-gray-700" />

                {/* Product Features */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    About this item
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      Condition:{" "}
                      <span className="capitalize">
                        {product.condition || "New"}
                      </span>
                    </li>
                    <li>Stock: {product.stockCount} units available</li>
                    {product.isReturnable && (
                      <li className="text-green-600 dark:text-green-400">
                        7-day return policy available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Price & Actions Box (Right - 25%) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 lg:sticky lg:top-4 bg-white dark:bg-gray-800">
                <div className="space-y-4">
                  {/* Price in Buy Box */}
                  {product.price && (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-medium text-gray-900 dark:text-white">
                          {formatINR(product.price)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="text-sm">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      In Stock
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Ships from: {shop?.name || "Seller"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Sold by: {shop?.name || "Seller"}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  {product.stockCount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Quantity:
                      </label>
                      <select
                        value={selectedQuantity}
                        onChange={(e) =>
                          setSelectedQuantity(Number(e.target.value))
                        }
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="text-sm space-y-2 border-t dark:border-gray-700 pt-3">
                    <button className="w-full text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                      Add to Wish List
                    </button>
                    <button className="w-full text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
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
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
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
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Description
          </h2>
          <ProductDescription
            description={product.description}
            specifications={product.specifications}
          />
        </div>
      </div>

      {/* 6. Seller Products (Same/Parent Category) */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
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
      <div
        className="bg-white dark:bg-gray-800 border-t dark:border-gray-700"
        id="reviews"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>

      {/* 9. Recently Viewed - Exclude current product */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <RecentlyViewedWidget
            excludeId={product.id}
            title="Recently Viewed"
            limit={6}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductContent slug={slug} />
    </Suspense>
  );
}
