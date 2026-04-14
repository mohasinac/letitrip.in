"use client";

import { useState } from "react";
import { Breadcrumbs, BreadcrumbItem, TextLink } from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductActions } from "./ProductActions";
import { ProductInfo } from "./ProductInfo";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PromoBannerStrip } from "./PromoBannerStrip";
import { BuyMoreSaveMore } from "./BuyMoreSaveMore";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { capitalizeWords } from "@/utils";
import { useTranslations } from "next-intl";
import {
  ProductDetailView as AppkitProductDetailView,
  ProductTabs,
  useProductDetail,
} from "@mohasinac/appkit/features/products";
import { proseMirrorToHtml } from "@mohasinac/appkit/utils";
import { Grid, Span, Heading, Text, RichText, Ul, Li, Ol, TabStrip, Div, Row, Stack } from "@mohasinac/appkit/ui";
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
  const [tabKey, setTabKey] = useState("description");
  const { product, isLoading, error } = useProductDetail(slug, { initialData });

  const isOutOfStock =
    product?.status === "out_of_stock" ||
    product?.status === "sold" ||
    product?.availableQuantity === 0;

  const statusLabel = product?.status === "sold" ? t("sold") : t("outOfStock");

  return (
    <Div className={`min-h-screen ${themed.bgSecondary}`}>
      <Div className={`${page.container.xl} py-4 sm:py-6 lg:py-8`}>
        <AppkitProductDetailView
          isLoading={isLoading}
          renderSkeleton={() => (
            <div className={`${page.container.xl} py-6 sm:py-8`}>
              <div className="h-4 w-48 bg-zinc-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
              <Grid cols="productDetailTriplet">
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
              </Grid>
            </div>
          )}
          renderNotFound={
            error || (!product && !isLoading)
              ? () => (
                  <Div
                    className={`min-h-screen ${themed.bgSecondary} ${flex.center}`}
                  >
                    <Div className="text-center py-16 px-4">
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
                    </Div>
                  </Div>
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
                  <Div className="mt-8 lg:mt-10 space-y-6">
                    <PromoBannerStrip />
                    <ProductTabs
                      defaultTab={tabKey}
                      renderDescription={() => (
                        <Div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                          <RichText
                            html={proseMirrorToHtml(product.description ?? "")}
                            copyableCode
                            className="text-sm"
                          />
                        </Div>
                      )}
                      extraTabs={[
                        { value: "ingredients", label: t("tabIngredients") },
                        { value: "howToUse", label: t("tabHowToUse") },
                        { value: "reviews", label: t("tabReviews") },
                      ]}
                      renderTabBar={(activeTab, onChange, tabs) => (
                        <TabStrip
                          activeKey={activeTab}
                          onChange={(next) => {
                            setTabKey(next);
                            if (next === "reviews") {
                              const el = document.getElementById("reviews");
                              el?.scrollIntoView({ behavior: "smooth" });
                            }
                            onChange(next);
                          }}
                          tabs={tabs.map((tab) => {
                            if (tab.value === "description") {
                              return { key: tab.value, label: t("tabDescription") };
                            }
                            return { key: tab.value, label: tab.label };
                          })}
                        />
                      )}
                      renderExtraTab={(value) => {
                        if (value === "ingredients") {
                          return product.ingredients?.length ? (
                            <Ul className="space-y-1">
                              {product.ingredients.map((item, i) => (
                                <Li
                                  key={i}
                                  className="text-sm text-zinc-700 dark:text-zinc-300 list-disc ml-4"
                                >
                                  {item}
                                </Li>
                              ))}
                            </Ul>
                          ) : (
                            <Text variant="secondary" size="sm">
                              {t("noIngredients")}
                            </Text>
                          );
                        }

                        if (value === "howToUse") {
                          return product.howToUse?.length ? (
                            <Ol className="space-y-2 list-decimal ml-4">
                              {product.howToUse.map((step, i) => (
                                <Li
                                  key={i}
                                  className="text-sm text-zinc-700 dark:text-zinc-300"
                                >
                                  {step}
                                </Li>
                              ))}
                            </Ol>
                          ) : (
                            <Text variant="secondary" size="sm">
                              {t("noHowToUse")}
                            </Text>
                          );
                        }

                        return null;
                      }}
                    />
                    <BuyMoreSaveMore product={product} />
                  </Div>
                )
              : undefined
          }
          renderRelated={
            product
              ? () => (
                  <>
                    <Div
                      id="reviews"
                      className={`${themed.bgPrimary} rounded-xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-12`}
                    >
                      <ProductReviews productId={product.id} />
                    </Div>
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
      </Div>
    </Div>
  );
}
