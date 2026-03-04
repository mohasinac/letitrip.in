/**
 * AuctionDetailView
 *
 * Full auction detail + bidding UI.
 * Extracted from /auctions/[id]/page.tsx.
 */

"use client";

import {
  BidHistory,
  MediaImage,
  MediaVideo,
  PlaceBidForm,
  Spinner,
  Heading,
  Text,
  Span,
  TextLink,
  Nav,
  Main,
} from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import {
  useAuth,
  useRealtimeBids,
  useCountdown,
  useAuctionDetail,
} from "@/hooks";
import { formatCurrency } from "@/utils";

const { themed, typography, spacing, flex, page } = THEME_CONSTANTS;

interface AuctionDetailViewProps {
  id: string;
}

function formatCountdown(
  r: ReturnType<typeof useCountdown>,
  endedLabel: string,
): { display: string; isEndingSoon: boolean } {
  if (!r) return { display: endedLabel, isEndingSoon: false };
  const { days, hours, minutes, seconds } = r;
  const isEndingSoon = days === 0 && hours < 1;
  let display: string;
  if (days > 0) display = `${days}d ${hours}h ${minutes}m`;
  else if (hours > 0) display = `${hours}h ${minutes}m ${seconds}s`;
  else display = `${minutes}m ${seconds}s`;
  return { display, isEndingSoon };
}

export function AuctionDetailView({ id }: AuctionDetailViewProps) {
  const { user } = useAuth();
  const tAuctions = useTranslations("auctions");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");

  const { productQuery, product, bidsQuery, bids } = useAuctionDetail(id);

  const {
    currentBid: rtdbBid,
    bidCount: rtdbBidCount,
    lastBid: lastRtdbBid,
    connected: rtdbConnected,
  } = useRealtimeBids(product?.isAuction ? id : null);

  const remaining = useCountdown(product?.auctionEndDate);
  const isEnded = remaining === null && !!product?.auctionEndDate;
  const { display: countdownDisplay, isEndingSoon } = formatCountdown(
    remaining,
    tAuctions("ended"),
  );

  const firestoreBid = product?.currentBid ?? 0;
  const currentBid = rtdbBid ?? firestoreBid;
  const startingBid = product?.startingBid ?? product?.price ?? 0;
  const displayBid = currentBid > 0 ? currentBid : startingBid;
  const hasCurrentBid = currentBid > 0;
  const liveBidCount = rtdbBidCount ?? bids.length;

  if (productQuery.isLoading) {
    return (
      <div className={`${flex.center} min-h-[60vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <Text size="lg" weight="medium">
          {tProducts("productNotFound")}
        </Text>
        <TextLink
          href={ROUTES.PUBLIC.AUCTIONS}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {tActions("back")}
        </TextLink>
      </div>
    );
  }

  if (!product.isAuction) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <Text size="lg" weight="medium">
          {tAuctions("noAuctions")}
        </Text>
        <TextLink
          href={ROUTES.PUBLIC.PRODUCTS + `/${product.id}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {tProducts("backToProducts")}
        </TextLink>
      </div>
    );
  }

  return (
    <Main className={`${page.container["2xl"]} py-10 ${spacing.stack}`}>
      {/* Breadcrumb */}
      <Nav
        aria-label="Breadcrumb"
        className={`text-sm ${themed.textSecondary}`}
      >
        <TextLink
          href={ROUTES.PUBLIC.AUCTIONS}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {tAuctions("title")}
        </TextLink>
        <Span className="mx-2">/</Span>
        <Span variant="primary" className="line-clamp-1">
          {product.title}
        </Span>
      </Nav>

      {/* Main layout: media left, info right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: video (if present) or image */}
        <div className="space-y-3">
          {/* Primary media */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {product.video?.url ? (
              <MediaVideo
                src={product.video.url}
                thumbnailUrl={product.video.thumbnailUrl}
                alt={product.title}
                trimStart={product.video.trimStart}
                trimEnd={product.video.trimEnd}
                controls
              />
            ) : (
              <MediaImage
                src={product.mainImage}
                alt={product.title}
                size="card"
                priority
                fallback="🔨"
              />
            )}
            {!isEnded && (
              <Span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {tAuctions("liveBadge")}
              </Span>
            )}
            {rtdbConnected && !isEnded && (
              <Span className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                <Span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {tAuctions("realtimeBadge")}
              </Span>
            )}
          </div>

          {/* Thumbnail — show the main image when a video is the primary display */}
          {product.video?.url && product.mainImage && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <MediaImage
                src={product.mainImage}
                alt={product.title}
                size="gallery"
              />
            </div>
          )}
        </div>

        {/* Right: info + bid panel */}
        <div className={`flex flex-col ${spacing.stack}`}>
          <Heading level={1} className={`${typography.h3}`}>
            {product.title}
          </Heading>

          {/* Bid summary */}
          <div
            className={`rounded-xl border ${themed.border} p-4 ${spacing.stack}`}
          >
            <div className="flex flex-col gap-1">
              <Text size="xs" variant="secondary">
                {hasCurrentBid
                  ? tAuctions("currentBid")
                  : tAuctions("startingBid")}
              </Text>
              <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(displayBid)}
              </Text>
              <Text size="sm" variant="secondary">
                {tAuctions("totalBids", { count: liveBidCount })}
              </Text>
              {lastRtdbBid && (
                <Text size="xs" variant="secondary">
                  {tAuctions("lastBidBy", { name: lastRtdbBid.bidderName })}
                </Text>
              )}
            </div>

            {/* Countdown */}
            <div className={flex.between}>
              <Span size="sm" variant="secondary">
                {isEnded ? tAuctions("ended") : `${tAuctions("endsIn")}:`}
              </Span>
              <Span
                className={`font-mono font-bold text-lg ${
                  isEnded
                    ? themed.textSecondary
                    : isEndingSoon
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {countdownDisplay}
              </Span>
            </div>
          </div>

          {/* Place bid form */}
          <PlaceBidForm
            productId={product.id}
            minimumBid={displayBid}
            currency={product.currency}
            isEnded={isEnded}
            isAuthenticated={!!user}
            onBidPlaced={() => bidsQuery.refetch()}
          />

          {/* Description */}
          {product.description && (
            <div>
              <Heading level={3} className="font-semibold mb-1">
                {tAuctions("description")}
              </Heading>
              <Text size="sm" variant="secondary" className="leading-relaxed">
                {product.description}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <BidHistory bids={bids} />
    </Main>
  );
}
