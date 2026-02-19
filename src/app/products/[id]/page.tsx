"use client";

import { use } from "react";
import Link from "next/link";
import {
  ProductImageGallery,
  ProductInfo,
  ProductReviews,
  AddToCartButton,
  RelatedProducts,
} from "@/components";
import { UI_LABELS, API_ENDPOINTS, ROUTES, THEME_CONSTANTS } from "@/constants";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius } = THEME_CONSTANTS;

interface ProductResponse {
  data: ProductDocument;
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);

  const { data, isLoading, error } = useApiQuery<ProductResponse>({
    queryKey: ["product", id],
    queryFn: () => apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),
    enabled: Boolean(id),
  });

  const product = data?.data;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !product) {
    return (
      <div
        className={`min-h-screen ${themed.bgSecondary} flex items-center justify-center`}
      >
        <div className="text-center py-16 px-4">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className={`text-2xl font-bold mb-2 ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCT_DETAIL.PRODUCT_NOT_FOUND}
          </h1>
          <p className={`text-sm mb-6 ${themed.textSecondary}`}>
            {UI_LABELS.PRODUCT_DETAIL.PRODUCT_NOT_FOUND_SUBTITLE}
          </p>
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
          >
            ← {UI_LABELS.PRODUCT_DETAIL.BACK_TO_PRODUCTS}
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock =
    product.status === "out_of_stock" ||
    product.status === "sold" ||
    product.availableQuantity === 0;

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className={`${themed.textSecondary} hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
          >
            ← {UI_LABELS.PRODUCT_DETAIL.BACK_TO_PRODUCTS}
          </Link>
          {product.category && (
            <>
              <span className={themed.textSecondary}>/</span>
              <span className={themed.textSecondary}>{product.category}</span>
            </>
          )}
        </nav>

        {/* Main product layout */}
        <div
          className={`${themed.bgPrimary} ${borderRadius.xl} p-6 sm:p-8 mb-8`}
        >
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <ProductImageGallery
              mainImage={product.mainImage}
              images={product.images}
              title={product.title}
            />

            {/* Info + CTA */}
            <div className="space-y-4">
              <ProductInfo
                title={product.title}
                description={product.description}
                price={product.price}
                currency={product.currency}
                status={product.status}
                featured={product.featured}
                isAuction={product.isAuction}
                currentBid={product.currentBid}
                startingBid={product.startingBid}
                bidCount={product.bidCount}
                auctionEndDate={product.auctionEndDate}
                stockQuantity={product.stockQuantity}
                availableQuantity={product.availableQuantity}
                brand={product.brand}
                category={product.category}
                subcategory={product.subcategory}
                sellerName={product.sellerName}
                tags={product.tags}
                specifications={product.specifications}
                features={product.features}
                shippingInfo={product.shippingInfo}
                returnPolicy={product.returnPolicy}
              />

              {/* Add to cart button */}
              {!isOutOfStock && (
                <AddToCartButton
                  productId={product.id}
                  productTitle={product.title}
                  price={product.price}
                  isAuction={product.isAuction}
                  disabled={isOutOfStock}
                />
              )}
              {isOutOfStock && (
                <div className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-center font-medium text-sm cursor-not-allowed">
                  {product.status === "sold"
                    ? UI_LABELS.PRODUCTS_PAGE.SOLD
                    : UI_LABELS.PRODUCTS_PAGE.OUT_OF_STOCK}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div
          className={`${themed.bgPrimary} ${borderRadius.xl} p-6 sm:p-8 mb-8`}
        >
          <ProductReviews productId={product.id} />
        </div>

        {/* Related products */}
        <RelatedProducts category={product.category} excludeId={product.id} />
      </div>
    </div>
  );
}
