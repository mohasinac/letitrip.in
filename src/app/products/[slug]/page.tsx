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
import { useCart } from "@/hooks/useCart";
import { toast } from "@/components/admin/Toast";
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
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { addItem, loading: cartLoading } = useCart();

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
                      {product.compareAtPrice &&
                        product.compareAtPrice > product.price && (
                          <span className="text-sm font-medium text-red-600">
                            -
                            {Math.round(
                              ((product.compareAtPrice - product.price) /
                                product.compareAtPrice) *
                                100
                            )}
                            %
                          </span>
                        )}
                      <span className="text-3xl font-medium text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <div className="text-sm text-gray-600">
                          M.R.P.:{" "}
                          <span className="line-through">
                            ₹{product.compareAtPrice.toLocaleString()}
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
                    <li>Cash on Delivery available</li>
                    <li>Free delivery on orders above ₹5,000</li>
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
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-1">Delivery</p>
                    <p className="text-gray-700">
                      FREE delivery{" "}
                      <span className="font-semibold">Tomorrow</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Order within 3 hrs 42 mins
                    </p>
                  </div>

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
                        )
                      )}
                    </select>
                  </div>

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
                            }
                          );
                          toast.success(
                            `Added ${selectedQuantity} item(s) to cart`
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
                            }
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

      {/* 4. Variants Section (Full Width - Expandable Grid) */}
      {variants.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Similar items from {shop?.name || "this shop"}
              </h2>
              {variants.length > 6 && (
                <button
                  onClick={() => setShowAllVariants(!showAllVariants)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {showAllVariants
                    ? "Show less"
                    : `See all ${variants.length} options`}
                </button>
              )}
            </div>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4`}
            >
              {(showAllVariants ? variants : variants.slice(0, 6)).map(
                (variant) => (
                  <div
                    key={variant.id}
                    onClick={() => router.push(`/products/${variant.slug}`)}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group bg-white"
                  >
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={variant.primaryImage || variant.images?.[0] || ""}
                        alt={variant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-900 line-clamp-2 mb-2 h-10">
                        {variant.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {variant.formattedPrice}
                        </span>
                      </div>
                      {variant.compareAtPrice &&
                        variant.compareAtPrice > variant.price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 line-through">
                              ₹{variant.compareAtPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-red-600">
                              -
                              {Math.round(
                                ((variant.compareAtPrice - variant.price) /
                                  variant.compareAtPrice) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Products from this Seller (Excluding current & leaf category) */}
      {shopProducts.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Products related to this item
              </h2>
              <button
                onClick={() => router.push(`/shops/${product.shopId}`)}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                See more
              </button>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2">
                {shopProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/products/${item.slug}`)}
                    className="flex-shrink-0 w-40 cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group bg-white"
                  >
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={item.primaryImage || item.images?.[0] || ""}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-900 line-clamp-2 mb-1 h-8">
                        {item.name}
                      </p>
                      <div className="text-sm font-bold text-gray-900">
                        {item.formattedPrice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Similar Products (From parent categories & uncles) */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SimilarProducts
            productId={product.id}
            categoryId={product.categoryId}
            currentShopId={product.shopId}
          />
        </div>
      </div>

      {/* 7. Product Description (Full Width) */}
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

      {/* 8. Customer Reviews & Ratings */}
      <div className="bg-white border-t" id="reviews">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>
    </div>
  );
}
