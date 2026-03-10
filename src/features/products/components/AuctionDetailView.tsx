/**
 * AuctionDetailView
 *
 * Full auction detail page with 3-column layout matching ProductDetailView.
 * Col 1: Image Gallery | Col 2: Auction Info | Col 3: Bid Panel (sticky)
 * Below: Bid History table + Related auctions
 */

"use client";

import {
  Badge,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Divider,
  Heading,
  Span,
  Text,
  TextLink,
  Accordion,
  AccordionItem,
  Ul,
  Li,
} from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { BidHistory } from "./BidHistory";
import { PlaceBidForm } from "./PlaceBidForm";
import { ProductFeatureBadges } from "./ProductFeatureBadges";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  useAuth,
  useRealtimeBids,
  useCountdown,
  useAuctionDetail,
  useWishlistToggle,
} from "@/hooks";
import { formatCurrency, formatDate, resolveDate } from "@/utils";

const { themed, flex, page, spacing } = THEME_CONSTANTS;

interface AuctionDetailViewProps {
  id: string;
}

export function AuctionDetailView({ id }: AuctionDetailViewProps) {
  const { user } = useAuth();
  const t = useTranslations("auctionDetail");

  const { productQuery, product, bidsQuery, bids } = useAuctionDetail(id);

  const {
    currentBid: rtdbBid,
    bidCount: rtdbBidCount,
    lastBid: lastRtdbBid,
    connected: rtdbConnected,
  } = useRealtimeBids(product?.isAuction ? id : null);

  const remaining = useCountdown(product?.auctionEndDate);
  const isEnded = remaining === null && !!product?.auctionEndDate;

  const firestoreBid = product?.currentBid ?? 0;
  const currentBid = rtdbBid ?? firestoreBid;
  const startingBid = product?.startingBid ?? product?.price ?? 0;
  const displayBid = currentBid > 0 ? currentBid : startingBid;
  const hasCurrentBid = currentBid > 0;
  const liveBidCount = rtdbBidCount ?? bids.length;

  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product?.id ?? "");

  // Reserve price status
  const reserveMet =
    product?.reservePrice && currentBid >= product.reservePrice;

  // Loading skeleton
  if (productQuery.isLoading) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary}`}>
        <div className={`${page.container.xl} py-6 sm:py-8`}>
          <div className="h-4 w-48 bg-zinc-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
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
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (productQuery.error || !product) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary} ${flex.center}`}>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
          >
            ← {t("backToAuctions")}
          </TextLink>
        </div>
      </div>
    );
  }

  const conditionLabel = product.condition
    ? t(
        `condition${product.condition.charAt(0).toUpperCase()}${product.condition.slice(1)}` as any,
      )
    : t("conditionNew");

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`${page.container.xl} py-4 sm:py-6 lg:py-8`}>
        {/* ——— Breadcrumbs ——— */}
        <Breadcrumbs className="mb-4 sm:mb-6">
          <BreadcrumbItem href={ROUTES.HOME}>
            {t("breadcrumbAuctions")}
          </BreadcrumbItem>
          <BreadcrumbItem href={ROUTES.PUBLIC.AUCTIONS}>
            {t("breadcrumbAuctions")}
          </BreadcrumbItem>
          {product.category && (
            <BreadcrumbItem
              href={`${ROUTES.PUBLIC.AUCTIONS}?filters=category==${encodeURIComponent(product.category)}`}
            >
              {product.category}
            </BreadcrumbItem>
          )}
          <BreadcrumbItem current>{product.title}</BreadcrumbItem>
        </Breadcrumbs>

        {/* ——— 3-Column Auction Layout ——— */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
          {/* Column 1 — Gallery */}
          <div className="relative">
            <ProductImageGallery
              mainImage={product.mainImage}
              images={product.images}
              video={product.video}
              title={product.title}
              slug={product.slug}
            />
            {/* Live / Ended badge overlay */}
            {!isEnded ? (
              <Span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {t("liveBadge")}
              </Span>
            ) : (
              <Span className="absolute top-3 left-3 z-10 bg-zinc-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t("endedBadge")}
              </Span>
            )}
            {rtdbConnected && !isEnded && (
              <Span className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                <Span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </Span>
            )}
          </div>

          {/* Column 2 — Auction Info */}
          <div className={spacing.stack}>
            {/* Title + badges */}
            <div>
              <Heading
                level={1}
                className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight"
              >
                {product.title}
              </Heading>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="primary">
                  {t("condition")}: {conditionLabel}
                </Badge>
                {product.featured && (
                  <Badge variant="warning">⭐ Featured</Badge>
                )}
                {product.insurance && (
                  <Badge variant="success">🛡️ {t("insurance")}</Badge>
                )}
                {product.autoExtendable && (
                  <Badge variant="info">⏱️ {t("autoExtend")}</Badge>
                )}
              </div>
            </div>

            {/* Seller + Category */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <TextLink
                href={`${ROUTES.PUBLIC.STORES}/${product.sellerId}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {product.sellerName}
              </TextLink>
              <Span variant="muted">•</Span>
              <TextLink
                href={`${ROUTES.PUBLIC.AUCTIONS}?filters=category==${encodeURIComponent(product.category)}`}
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
            </div>

            {/* ——— Countdown Timer — prominent display ——— */}
            <div
              className={`rounded-xl border-2 ${isEnded ? "border-zinc-300 dark:border-slate-600" : isEndingSoon(remaining) ? "border-amber-400 dark:border-amber-500" : "border-indigo-400 dark:border-indigo-500"} p-4`}
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
                      <Text className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {String(unit.value).padStart(2, "0")}
                      </Text>
                      <Text size="xs" variant="secondary">
                        {unit.label}
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-2xl font-bold text-zinc-400">
                  {t("auctionEnded")}
                </Text>
              )}
              {product.auctionEndDate && (
                <time
                  dateTime={
                    resolveDate(product.auctionEndDate)?.toISOString() ?? ""
                  }
                >
                  <Text size="xs" variant="muted" className="mt-2">
                    {t("auctionEnds")}: {formatDate(product.auctionEndDate)}
                  </Text>
                </time>
              )}
            </div>

            {/* ——— Bid Info ——— */}
            <div
              className={`${themed.bgPrimary} rounded-xl p-4 ${spacing.stack}`}
            >
              <div className={flex.between}>
                <div>
                  <Text size="xs" variant="secondary">
                    {hasCurrentBid ? t("currentBid") : t("startingBid")}
                  </Text>
                  <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
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

              {/* Reserve price indicator */}
              {product.reservePrice && product.reservePrice > 0 && (
                <div
                  className={`flex items-center gap-2 text-sm ${reserveMet ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                >
                  <Span>{reserveMet ? "✓" : "⚠"}</Span>
                  <Text size="sm" weight="medium">
                    {reserveMet ? t("reserveMet") : t("reserveNotMet")}
                  </Text>
                  <Text size="xs" variant="muted">
                    ({t("reservePrice")}: {formatCurrency(product.reservePrice)}
                    )
                  </Text>
                </div>
              )}

              {/* Min bid increment */}
              {product.minBidIncrement && product.minBidIncrement > 0 && (
                <Text size="xs" variant="muted">
                  {t("minIncrement", {
                    amount: formatCurrency(product.minBidIncrement),
                  })}
                </Text>
              )}
            </div>

            {/* ——— Feature Badges ——— */}
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

            {/* ——— Shipping & Insurance Info ——— */}
            <div className="flex flex-wrap gap-2">
              {/* Shipping payer */}
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

              {/* Insurance badge */}
              {product.insurance && (
                <Span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  🛡️{" "}
                  {product.insuranceCost
                    ? t("insuranceInfo", {
                        cost: formatCurrency(product.insuranceCost),
                      })
                    : t("insuranceIncluded")}
                </Span>
              )}

              {/* Auto-extend badge */}
              {product.autoExtendable && (
                <Span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  ⏱️{" "}
                  {t("autoExtendInfo", {
                    minutes: product.auctionExtensionMinutes ?? 5,
                  })}
                </Span>
              )}
            </div>

            <Divider />

            {/* ——— Description ——— */}
            {product.description && (
              <div>
                <Heading level={3} className="font-semibold mb-2">
                  {t("description")}
                </Heading>
                <Text
                  size="sm"
                  variant="secondary"
                  className="leading-relaxed whitespace-pre-line"
                >
                  {product.description}
                </Text>
              </div>
            )}

            {/* ——— Features ——— */}
            {product.features && product.features.length > 0 && (
              <div>
                <Heading level={3} className="font-semibold mb-2">
                  {t("features")}
                </Heading>
                <Ul className="space-y-1.5">
                  {product.features.map((feature, i) => (
                    <Li key={i} className="flex items-start gap-2">
                      <Span className="text-indigo-500 mt-0.5">•</Span>
                      <Text size="sm" variant="secondary">
                        {feature}
                      </Text>
                    </Li>
                  ))}
                </Ul>
              </div>
            )}

            {/* ——— Specifications + Delivery (Accordions) ——— */}
            <Accordion type="multiple" defaultValue={[]}>
              {product.specifications && product.specifications.length > 0 && (
                <AccordionItem value="specs" title={t("specifications")}>
                  <dl className="space-y-2">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between gap-4">
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
                    ))}
                  </dl>
                </AccordionItem>
              )}
              {(product.shippingInfo || product.returnPolicy) && (
                <AccordionItem value="delivery" title={t("deliveryReturns")}>
                  <div className={spacing.stack}>
                    {product.shippingInfo && (
                      <div>
                        <Text size="sm" weight="semibold" className="mb-1">
                          {t("shippingInfo")}
                        </Text>
                        <Text size="sm" variant="secondary">
                          {product.shippingInfo}
                        </Text>
                      </div>
                    )}
                    {product.returnPolicy && (
                      <div>
                        <Text size="sm" weight="semibold" className="mb-1">
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

          {/* Column 3 — Bid Panel (desktop sticky sidebar) */}
          <div className="hidden lg:block">
            <div className={`sticky top-24 ${spacing.stack}`}>
              {/* Bid panel card */}
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

                {/* Buy Now button */}
                {product.buyNowPrice && product.buyNowPrice > 0 && !isEnded && (
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

                {/* Wishlist */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                >
                  {inWishlist
                    ? `❤️ ${t("removeFromWishlist")}`
                    : `🤍 ${t("addToWishlist")}`}
                </Button>
              </div>

              {/* Seller card */}
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
                  className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-1 inline-block"
                >
                  {t("viewStore")} →
                </TextLink>
              </div>
            </div>
          </div>
        </div>

        {/* ——— Bid History Section ——— */}
        <div
          className={`${themed.bgPrimary} rounded-xl p-4 sm:p-6 lg:p-8 mt-8 lg:mt-12`}
        >
          <BidHistory bids={bids} loading={bidsQuery.isLoading} />
        </div>
      </div>

      {/* ——— Mobile sticky bottom bar ——— */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div
          className={`${themed.bgPrimary} border-t ${themed.border} px-4 py-3`}
        >
          <div className={flex.between}>
            <div>
              <Text size="xs" variant="secondary">
                {hasCurrentBid ? t("currentBid") : t("startingBid")}
              </Text>
              <Text className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(displayBid)}
              </Text>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-label={
                  inWishlist ? t("removeFromWishlist") : t("addToWishlist")
                }
              >
                {inWishlist ? "❤️" : "🤍"}
              </Button>
              {!isEnded ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    document
                      .getElementById("place-bid-mobile")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t("placeBidCta")}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  {t("auctionEnded")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}

/**
 * Helper to check if auction is ending soon (< 1 hour remaining)
 */
function isEndingSoon(remaining: ReturnType<typeof useCountdown>): boolean {
  if (!remaining) return false;
  return remaining.days === 0 && remaining.hours < 1;
}
