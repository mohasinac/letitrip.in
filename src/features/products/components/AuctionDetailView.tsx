/**
 * AuctionDetailView — thin adapter
 *
 * Wraps AppkitAuctionDetailView shell. All rendering logic lives in render slots.
 * Business logic (hooks, countdown, real-time bids, wishlist, bottom actions) stays local.
 */
"use client";

import {
  Heading,
  Grid,
  Li,
  Text,
  Ul,
  Divider,
  Span,
  Button,
  Badge,
  RichText,
} from "@mohasinac/appkit/ui";
import { proseMirrorToHtml } from "@mohasinac/appkit/utils";
import { useCountdown } from "@mohasinac/appkit/react";
import {
  Breadcrumbs,
  BreadcrumbItem,
  TextLink,
  Accordion,
  AccordionItem,
} from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { BidHistory } from "./BidHistory";
import { PlaceBidForm } from "./PlaceBidForm";
import { ProductFeatureBadges } from "./ProductFeatureBadges";
import { AuctionDetailView as AppkitAuctionDetailView } from "@mohasinac/appkit/features/products";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  useAuth,
  useBottomActions,
  useRealtimeBids,
  useAuctionDetail,
  useWishlistToggle,
} from "@/hooks";
import { formatCurrency, formatDate, resolveDate } from "@/utils";
import { Heart } from "lucide-react";

const { themed, flex, page, spacing } = THEME_CONSTANTS;

interface AuctionDetailViewProps {
  id: string;
}

function isEndingSoon(remaining: ReturnType<typeof useCountdown>): boolean {
  if (!remaining) return false;
  return remaining.days === 0 && remaining.hours < 1;
}

export function AuctionDetailView({ id }: AuctionDetailViewProps) {
  const { user } = useAuth();
  const t = useTranslations("auctionDetail");

  const { productQuery, product, bidsQuery, bids } = useAuctionDetail(id);
  const {
    currentBid: rtdbBid,
    bidCount: rtdbBidCount,
    lastBid: lastRtdbBid,
  } = useRealtimeBids(product?.isAuction ? id : null);

  const remaining = useCountdown(product?.auctionEndDate);
  const isEnded = remaining === null && !!product?.auctionEndDate;

  const firestoreBid = product?.currentBid ?? 0;
  const currentBid = rtdbBid ?? firestoreBid;
  const startingBid = product?.startingBid ?? product?.price ?? 0;
  const displayBid = currentBid > 0 ? currentBid : startingBid;
  const hasCurrentBid = currentBid > 0;
  const liveBidCount = rtdbBidCount ?? bids.length;
  const reserveMet =
    product?.reservePrice && currentBid >= product.reservePrice;

  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product?.id ?? "");

  useBottomActions({
    infoLabel: product
      ? `${hasCurrentBid ? t("currentBid") : t("startingBid")}: ${formatCurrency(displayBid)}`
      : undefined,
    actions: product
      ? [
          {
            id: "wishlist",
            icon: (
              <Heart
                className={`w-4 h-4 ${inWishlist ? "fill-current text-pink-500" : ""}`}
              />
            ),
            label: inWishlist ? t("removeFromWishlist") : t("addToWishlist"),
            variant: "ghost" as const,
            grow: false,
            disabled: wishlistLoading,
            onClick: toggleWishlist,
          },
          {
            id: isEnded ? "ended" : "bid",
            label: isEnded ? t("auctionEnded") : t("placeBidCta"),
            variant: isEnded ? ("ghost" as const) : ("primary" as const),
            grow: true,
            disabled: isEnded,
            onClick: () => {
              document
                .getElementById("place-bid-mobile")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          },
        ]
      : [],
  });

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`${page.container.xl} py-4 sm:py-6 lg:py-8`}>
        <AppkitAuctionDetailView
          isLoading={productQuery.isLoading}
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
                  <div className="h-32 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
                </div>
                <div className="hidden lg:block animate-pulse space-y-3">
                  <div className="h-48 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
                  <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </Grid>
            </div>
          )}
          renderNotFound={
            productQuery.error || (!product && !productQuery.isLoading)
              ? () => (
                  <div
                    className={`min-h-screen ${themed.bgSecondary} ${flex.center}`}
                  >
                    <div className="text-center py-16 px-4">
                      <Span className="text-6xl mb-4 block">🔨</Span>
                      <Heading level={1} className="text-2xl font-bold mb-2">
                        {t("notFound")}
                      </Heading>
                      <Text variant="secondary" size="sm" className="mb-6">
                        {t("notFoundDesc")}
                      </Text>
                      <TextLink
                        href={ROUTES.PUBLIC.AUCTIONS}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors text-sm"
                      >
                        ← {t("backToAuctions")}
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
                    <BreadcrumbItem href={ROUTES.PUBLIC.AUCTIONS}>
                      {t("auctions")}
                    </BreadcrumbItem>
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
                  <div className={spacing.stack}>
                    {/* Title + badges */}
                    <div>
                      <Heading
                        level={1}
                        className="text-xl sm:text-2xl xl:text-3xl font-bold leading-tight"
                      >
                        {product.title}
                      </Heading>
                      <Row wrap gap="sm" className="mt-2">
                        {product.featured && (
                          <Badge variant="warning">{t("featured")}</Badge>
                        )}
                        {product.insurance && (
                          <Badge variant="success">{t("insurance")}</Badge>
                        )}
                        {product.autoExtendable && (
                          <Badge variant="info">⏱ {t("autoExtend")}</Badge>
                        )}
                      </Row>
                    </div>

                    {/* Seller + Category */}
                    <Row wrap gap="sm" className="gap-x-3 gap-y-1 text-sm">
                      <TextLink
                        href={`${ROUTES.PUBLIC.STORES}/${product.sellerId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {product.sellerName}
                      </TextLink>
                      <Span variant="muted">•</Span>
                      <TextLink
                        href={`${ROUTES.PUBLIC.AUCTIONS}?filters=category==${encodeURIComponent(product.category ?? "")}`}
                        className="hover:underline"
                      >
                        {product.category}
                      </TextLink>
                      {product.brand && (
                        <>
                          <Span variant="muted">•</Span>
                          <Text size="sm" variant="secondary">
                            {product.brand}
                          </Text>
                        </>
                      )}
                    </Row>

                    {/* Countdown */}
                    <div
                      className={`rounded-xl border-2 ${isEnded ? "border-zinc-300 dark:border-slate-600" : isEndingSoon(remaining) ? "border-amber-400 dark:border-amber-500" : "border-primary/60"} p-4`}
                    >
                      <Text
                        size="xs"
                        variant="secondary"
                        weight="semibold"
                        className="uppercase tracking-wider mb-2"
                      >
                        {isEnded ? t("auctionEnded") : t("timeRemaining")}
                      </Text>
                      {!isEnded && remaining ? (
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { value: remaining.days, label: t("days") },
                            { value: remaining.hours, label: t("hours") },
                            { value: remaining.minutes, label: t("minutes") },
                            { value: remaining.seconds, label: t("seconds") },
                          ].map((unit) => (
                            <div key={unit.label}>
                              <Text className="text-2xl sm:text-3xl font-bold font-mono text-primary">
                                {String(unit.value).padStart(2, "0")}
                              </Text>
                              <Text size="xs" variant="secondary">
                                {unit.label}
                              </Text>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text className="text-2xl font-bold text-zinc-500 dark:text-zinc-400">
                          {t("auctionEnded")}
                        </Text>
                      )}
                      {product.auctionEndDate && (
                        <time
                          dateTime={
                            resolveDate(
                              product.auctionEndDate,
                            )?.toISOString() ?? ""
                          }
                        >
                          <Text size="xs" variant="muted" className="mt-2">
                            {t("auctionEnds")}:{" "}
                            {formatDate(product.auctionEndDate)}
                          </Text>
                        </time>
                      )}
                    </div>

                    {/* Bid Info */}
                    <div
                      className={`${themed.bgPrimary} rounded-xl p-4 ${spacing.stack}`}
                    >
                      <div className={flex.between}>
                        <div>
                          <Text size="xs" variant="secondary">
                            {hasCurrentBid ? t("currentBid") : t("startingBid")}
                          </Text>
                          <Text className="text-3xl font-bold text-primary">
                            {formatCurrency(displayBid)}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="xs" variant="secondary">
                            {t("totalBids", { count: liveBidCount })}
                          </Text>
                          {lastRtdbBid && (
                            <Text size="xs" variant="muted">
                              {lastRtdbBid.bidderName}
                            </Text>
                          )}
                        </div>
                      </div>
                      {product.reservePrice && product.reservePrice > 0 && (
                        <div
                          className={`flex items-center gap-2 text-sm ${reserveMet ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                        >
                          <Span>{reserveMet ? "✓" : "⚠"}</Span>
                          <Text size="sm" weight="medium">
                            {reserveMet ? t("reserveMet") : t("reserveNotMet")}
                          </Text>
                          <Text size="xs" variant="muted">
                            ({t("reservePrice")}:{" "}
                            {formatCurrency(product.reservePrice)})
                          </Text>
                        </div>
                      )}
                      {product.minBidIncrement &&
                        product.minBidIncrement > 0 && (
                          <Text size="xs" variant="muted">
                            {t("minIncrement", {
                              amount: formatCurrency(product.minBidIncrement),
                            })}
                          </Text>
                        )}
                    </div>

                    <ProductFeatureBadges
                      condition={product.condition}
                      isAuction
                      featured={product.featured}
                      freeShipping={
                        product.shippingPaidBy === "seller" ||
                        product.auctionShippingPaidBy === "seller"
                      }
                      returnable={!!product.returnPolicy}
                    />

                    {/* Shipping / Insurance / Auto-extend badges */}
                    <Row wrap gap="sm">
                      <Span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${themed.bgSecondary}`}
                      >
                        📦{" "}
                        {t("shippingPaidBy", {
                          payer:
                            product.auctionShippingPaidBy === "seller"
                              ? t("shippingBySeller")
                              : t("shippingByWinner"),
                        })}
                      </Span>
                      {product.insurance && (
                        <Span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          🛡{" "}
                          {product.insuranceCost
                            ? t("insuranceInfo", {
                                cost: formatCurrency(product.insuranceCost),
                              })
                            : t("insuranceIncluded")}
                        </Span>
                      )}
                      {product.autoExtendable && (
                        <Span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/5 text-primary dark:bg-primary/10">
                          ⏱{" "}
                          {t("autoExtendInfo", {
                            minutes: product.auctionExtensionMinutes ?? 5,
                          })}
                        </Span>
                      )}
                    </Row>

                    <Divider />

                    {product.description && (
                      <div>
                        <Heading level={3} className="font-semibold mb-2">
                          {t("description")}
                        </Heading>
                        <RichText
                          html={proseMirrorToHtml(product.description)}
                          copyableCode
                          className="text-sm"
                        />
                      </div>
                    )}

                    {product.features && product.features.length > 0 && (
                      <div>
                        <Heading level={3} className="font-semibold mb-2">
                          {t("features")}
                        </Heading>
                        <Ul className="space-y-1.5">
                          {product.features.map(
                            (feature: string, i: number) => (
                              <Li key={i} className="flex items-start gap-2">
                                <Span className="text-primary mt-0.5">•</Span>
                                <Text size="sm" variant="secondary">
                                  {feature}
                                </Text>
                              </Li>
                            ),
                          )}
                        </Ul>
                      </div>
                    )}

                    <Accordion type="multiple" defaultValue={[]}>
                      {product.specifications &&
                        product.specifications.length > 0 && (
                          <AccordionItem
                            value="specs"
                            title={t("specifications")}
                          >
                            <dl className="space-y-2">
                              {product.specifications.map(
                                (
                                  spec: { name: string; value: string },
                                  i: number,
                                ) => (
                                  <div
                                    key={i}
                                    className="flex justify-between gap-4"
                                  >
                                    <dt>
                                      <Text size="sm" weight="medium">
                                        {spec.name}
                                      </Text>
                                    </dt>
                                    <dd>
                                      <Text size="sm" variant="secondary">
                                        {spec.value}
                                      </Text>
                                    </dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          </AccordionItem>
                        )}
                      {(product.shippingInfo || product.returnPolicy) && (
                        <AccordionItem
                          value="delivery"
                          title={t("deliveryReturns")}
                        >
                          <div className={spacing.stack}>
                            {product.shippingInfo && (
                              <div>
                                <Text
                                  size="sm"
                                  weight="semibold"
                                  className="mb-1"
                                >
                                  {t("shippingInfo")}
                                </Text>
                                <Text size="sm" variant="secondary">
                                  {product.shippingInfo}
                                </Text>
                              </div>
                            )}
                            {product.returnPolicy && (
                              <div>
                                <Text
                                  size="sm"
                                  weight="semibold"
                                  className="mb-1"
                                >
                                  {t("returnPolicy")}
                                </Text>
                                <Text size="sm" variant="secondary">
                                  {product.returnPolicy}
                                </Text>
                              </div>
                            )}
                          </div>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </div>
                )
              : undefined
          }
          renderBidForm={
            product
              ? () => (
                  <div className={`sticky top-24 ${spacing.stack}`}>
                    <div
                      className={`${themed.bgPrimary} rounded-xl p-5 ${spacing.stack} shadow-sm border ${themed.border}`}
                    >
                      <PlaceBidForm
                        productId={product.id}
                        minimumBid={displayBid}
                        currency={product.currency}
                        isEnded={isEnded}
                        isAuthenticated={!!user}
                        onBidPlaced={() => bidsQuery.refetch()}
                      />
                      {product.buyNowPrice &&
                        product.buyNowPrice > 0 &&
                        !isEnded && (
                          <>
                            <Divider />
                            <Button
                              variant="secondary"
                              className="w-full"
                              disabled={isEnded}
                            >
                              {t("buyNowAction", {
                                price: formatCurrency(product.buyNowPrice),
                              })}
                            </Button>
                          </>
                        )}
                      <Divider />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                      >
                        {inWishlist
                          ? `♥ ${t("removeFromWishlist")}`
                          : `🤍 ${t("addToWishlist")}`}
                      </Button>
                    </div>
                    <div
                      className={`${themed.bgPrimary} rounded-xl p-4 border ${themed.border}`}
                    >
                      <Text
                        size="xs"
                        variant="secondary"
                        className="uppercase tracking-wider mb-1"
                      >
                        {t("seller")}
                      </Text>
                      <Text weight="semibold">{product.sellerName}</Text>
                      <TextLink
                        href={`${ROUTES.PUBLIC.STORES}/${product.sellerId}`}
                        className="text-primary text-sm hover:underline mt-1 inline-block"
                      >
                        {t("viewStore")} →
                      </TextLink>
                    </div>
                  </div>
                )
              : undefined
          }
          renderMobileBidForm={
            product
              ? () => (
                  <div
                    id="place-bid-mobile"
                    className={`lg:hidden mt-6 scroll-mt-4 ${themed.bgPrimary} rounded-xl p-4 sm:p-5 border ${themed.border} ${spacing.stack}`}
                  >
                    <Text
                      weight="semibold"
                      size="sm"
                      className="uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      {t("placeBid")}
                    </Text>
                    <PlaceBidForm
                      productId={product.id}
                      minimumBid={displayBid}
                      currency={product.currency}
                      isEnded={isEnded}
                      isAuthenticated={!!user}
                      onBidPlaced={() => bidsQuery.refetch()}
                    />
                    {product.buyNowPrice &&
                      product.buyNowPrice > 0 &&
                      !isEnded && (
                        <>
                          <Divider />
                          <Button
                            variant="secondary"
                            className="w-full"
                            disabled={isEnded}
                          >
                            {t("buyNowAction", {
                              price: formatCurrency(product.buyNowPrice),
                            })}
                          </Button>
                        </>
                      )}
                  </div>
                )
              : undefined
          }
          renderBidHistory={
            product
              ? () => (
                  <div
                    className={`${themed.bgPrimary} rounded-xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-12`}
                  >
                    <BidHistory
                      bids={bids}
                      loading={bidsQuery.isLoading}
                      currentUserId={user?.uid}
                    />
                  </div>
                )
              : undefined
          }
        />
      </div>
    </div>
  );
}
