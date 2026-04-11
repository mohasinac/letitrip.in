"use client";

import { Breadcrumbs, BreadcrumbItem, TextLink } from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductActions } from "./ProductActions";
import { ProductInfo } from "./ProductInfo";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PromoBannerStrip } from "./PromoBannerStrip";
import { BuyMoreSaveMore } from "./BuyMoreSaveMore";
import { ProductTabs } from "./ProductTabs";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { capitalizeWords } from "@/utils";
import { useTranslations } from "next-intl";
import { useProductDetail } from "../hooks";
import { ProductDetailView as AppkitProductDetailView } from "@mohasinac/appkit/features/products";
import { Span, Heading, Text } from "@mohasinac/appkit/ui";
import type { ProductItem } from "@mohasinac/appkit/features/products";

function formatCategoryLabel(label: string): string {
  if (label.startsWith("category-")) {
    return capitalizeWords(label.slice("category-".length).replace(/-/g, " "));
  }
  return label;
}

const { themed, flex, page, spacing } = THEME_CONSTANTS;

interface ProductDetailViewProps {
  slug: string;
  initialData?: ProductItem;
}

export function ProductDetailView({
  slug,
  initialData,
}: ProductDetailViewProps) {
  const t = useTranslations("products");
  const { product, isLoading, error } = useProductDetail(slug, { initialData });

  const isOutOfStock =
    product?.status === "out_of_stock" ||
    product?.status === "sold" ||
    product?.availableQuantity === 0;

  const statusLabel = product?.status === "sold" ? t("sold") : t("outOfStock");

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`${page.container.xl} py-4 sm:py-6 lg:py-8`}>
        <AppkitProductDetailView
          isLoading={isLoading}
          renderSkeleton={() => (
            <div className={`${page.container.xl} py-6 sm:py-8`}>
              <div className="h-4 w-48 bg-zinc-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] 2xl:grid-cols-[1fr_1fr_320px] gap-6 lg:gap-8">
                <div className="animate-pulse space-y-3">
                  <div className="aspect-square bg-zinc-200 dark:bg-slate-700 rounded-2xl" />
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 bg-zinc-200 dark:bg-slate-700 rounded-lg shrink-0"
                      />
                    ))}
                  </div>
                </div>
                <div className={`animate-pulse ${spacing.stack}`}>
                  <div className="h-8 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl w-1/3" />
                </div>
                <div className="hidden lg:block animate-pulse space-y-3">
                  <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
                  <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </div>
            </div>
          )}
          renderNotFound={
            error || (!product && !isLoading)
              ? () => (
                  <div
                    className={`min-h-screen ${themed.bgSecondary} ${flex.center}`}
                  >
                    <div className="text-center py-16 px-4">
                      <Span className="text-6xl mb-4 block">🔍</Span>
                      <Heading level={1} className="text-2xl font-bold mb-2">
                        {t("productNotFound")}
                      </Heading>
                      <Text variant="secondary" size="sm" className="mb-6">
                        {t("productNotFoundSubtitle")}
                      </Text>
                      <TextLink
                        href={ROUTES.PUBLIC.PRODUCTS}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors text-sm"
                      >
                        ← {t("backToProducts")}
                      </TextLink>
                    </div>
                  </div>
                )
              : undefined
          }
          renderBreadcrumb={
            product
              ? () => (
                  <Breadcrumbs className="mb-4 sm:mb-6">
                    <BreadcrumbItem href={ROUTES.HOME}>
                      {t("home")}
                    </BreadcrumbItem>
                    <BreadcrumbItem href={ROUTES.PUBLIC.PRODUCTS}>
                      {t("title")}
                    </BreadcrumbItem>
                    {product.category && (
                      <BreadcrumbItem
                        href={`${ROUTES.PUBLIC.PRODUCTS}?filters=category==${encodeURIComponent(product.category)}`}
                      >
                        {formatCategoryLabel(product.category)}
                      </BreadcrumbItem>
                    )}
                    <BreadcrumbItem current>{product.title}</BreadcrumbItem>
                  </Breadcrumbs>
                )
              : undefined
          }
          renderGallery={
            product
              ? () => (
                  <ProductImageGallery
                    mainImage={product.mainImage ?? ""}
                    images={product.images}
                    video={
                      product.video as
                        | { url: string; thumbnailUrl?: string }
                        | undefined
                    }
                    title={product.title}
                    slug={product.slug}
                  />
                )
              : undefined
          }
          renderInfo={
            product
              ? () => (
                  <ProductInfo
                    title={product.title}
                    description={product.description ?? ""}
                    price={product.price}
                    currency={product.currency ?? "INR"}
                    status={product.status}
                    featured={product.featured ?? false}
                    isAuction={product.isAuction}
                    currentBid={product.currentBid}
                    startingBid={product.startingBid}
                    bidCount={product.bidCount}
                    auctionEndDate={
                      product.auctionEndDate
                        ? new Date(product.auctionEndDate as string | Date)
                        : undefined
                    }
                    stockQuantity={
                      product.stockQuantity ?? product.availableQuantity ?? 0
                    }
                    availableQuantity={product.availableQuantity ?? 0}
                    brand={product.brand}
                    category={product.category ?? ""}
                    subcategory={product.subcategory}
                    sellerName={product.sellerName ?? ""}
                    sellerId={product.sellerId}
                    tags={product.tags ?? []}
                    specifications={product.specifications}
                    features={product.features}
                    shippingInfo={product.shippingInfo}
                    returnPolicy={product.returnPolicy}
                    viewCount={product.viewCount}
                    slug={product.slug}
                    isPromoted={product.isPromoted}
                  />
                )
              : undefined
          }
          renderActions={
            product
              ? () => (
                  <ProductActions
                    productId={product.id}
                    productTitle={product.title}
                    price={product.price}
                    isAuction={product.isAuction}
                    isOutOfStock={isOutOfStock ?? false}
                    statusLabel={statusLabel}
                  />
                )
              : undefined
          }
          renderTabs={
            product
              ? () => (
                  <div className="mt-8 lg:mt-10 space-y-6">
                    <PromoBannerStrip />
                    <ProductTabs product={product} />
                    <BuyMoreSaveMore product={product} />
                  </div>
                )
              : undefined
          }
          renderRelated={
            product
              ? () => (
                  <>
                    <div
                      id="reviews"
                      className={`${themed.bgPrimary} rounded-xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-12`}
                    >
                      <ProductReviews productId={product.id} />
                    </div>
                    <RelatedProducts
                      category={product.category ?? ""}
                      excludeId={product.id}
                      isAuction={product.isAuction}
                    />
                  </>
                )
              : undefined
          }
        />
      </div>
    </div>
  );
}
