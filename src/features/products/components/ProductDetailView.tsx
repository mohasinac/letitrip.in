"use client";

import {
  Breadcrumbs,
  BreadcrumbItem,
  Heading,
  Span,
  Text,
  TextLink,
} from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductActions } from "./ProductActions";
import { ProductInfo } from "./ProductInfo";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

const { themed, flex, page, spacing } = THEME_CONSTANTS;

interface ProductDetailViewProps {
  slug: string;
  initialData?: ProductDocument;
}

export function ProductDetailView({
  slug,
  initialData,
}: ProductDetailViewProps) {
  const t = useTranslations("products");

  const {
    data: product,
    isLoading,
    error,
  } = useApiQuery<ProductDocument>({
    queryKey: ["product", slug],
    queryFn: () => productService.getById(slug),
    enabled: Boolean(slug),
    initialData,
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary}`}>
        <div className={`${page.container.xl} py-6 sm:py-8`}>
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-zinc-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
            {/* Gallery skeleton */}
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

            {/* Info skeleton */}
            <div className={`animate-pulse ${spacing.stack}`}>
              <div className="h-8 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl w-1/3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-zinc-200 dark:bg-slate-700 rounded-lg"
                  />
                ))}
              </div>
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-4/6" />
            </div>

            {/* Actions skeleton (desktop) */}
            <div className="hidden lg:block animate-pulse space-y-3">
              <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !product) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary} ${flex.center}`}>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
          >
            ← {t("backToProducts")}
          </TextLink>
        </div>
      </div>
    );
  }

  const isOutOfStock =
    product.status === "out_of_stock" ||
    product.status === "sold" ||
    product.availableQuantity === 0;

  const statusLabel = product.status === "sold" ? t("sold") : t("outOfStock");

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`${page.container.xl} py-4 sm:py-6 lg:py-8`}>
        {/* ——— Breadcrumbs ——— */}
        <Breadcrumbs className="mb-4 sm:mb-6">
          <BreadcrumbItem href={ROUTES.HOME}>{t("home")}</BreadcrumbItem>
          <BreadcrumbItem href={ROUTES.PUBLIC.PRODUCTS}>
            {t("title")}
          </BreadcrumbItem>
          {product.category && (
            <BreadcrumbItem
              href={`${ROUTES.PUBLIC.PRODUCTS}?filters=category==${encodeURIComponent(product.category)}`}
            >
              {product.category}
            </BreadcrumbItem>
          )}
          <BreadcrumbItem current>{product.title}</BreadcrumbItem>
        </Breadcrumbs>

        {/* ——— 3-Column Product Layout ——— */}
        {/* Mobile: stacked. Tablet: 2-col. Desktop: 3-col with sticky actions sidebar. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
          {/* Column 1 — Gallery */}
          <div>
            <ProductImageGallery
              mainImage={product.mainImage}
              images={product.images}
              video={product.video}
              title={product.title}
              slug={product.slug}
            />
          </div>

          {/* Column 2 — Product Info */}
          <div>
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
              sellerId={product.sellerId}
              tags={product.tags}
              specifications={product.specifications}
              features={product.features}
              shippingInfo={product.shippingInfo}
              returnPolicy={product.returnPolicy}
              viewCount={product.viewCount}
              slug={product.slug}
              isPromoted={product.isPromoted}
            />
          </div>

          {/* Column 3 — Actions (desktop sticky sidebar) */}
          <ProductActions
            productId={product.id}
            productTitle={product.title}
            price={product.price}
            isAuction={product.isAuction}
            isOutOfStock={isOutOfStock}
            statusLabel={statusLabel}
          />
        </div>

        {/* ——— Reviews Section ——— */}
        <div
          className={`${themed.bgPrimary} rounded-xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-12`}
        >
          <ProductReviews productId={product.id} />
        </div>

        {/* ——— Related Products ——— */}
        <RelatedProducts
          category={product.category}
          excludeId={product.id}
          isAuction={product.isAuction}
        />
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
