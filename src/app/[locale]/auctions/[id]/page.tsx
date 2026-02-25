/**
 * Auction Detail + Bidding Page
 *
 * Route: /auctions/[id]
 * Shows full auction product details with live countdown, bid history,
 * and bid placement form. Uses Firebase Realtime Database for live bid updates
 * with a 60-second fallback poll for bid history sync.
 */

"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BidHistory, PlaceBidForm, Spinner } from "@/components";
import { THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useApiQuery, useAuth, useRealtimeBids } from "@/hooks";
import { formatCurrency } from "@/utils";
import type { ProductDocument, BidDocument } from "@/db/schema";

const { themed, typography, spacing } = THEME_CONSTANTS;

type AuctionProduct = ProductDocument;

interface ProductResponse {
  data: AuctionProduct;
}

interface BidsResponse {
  data: BidDocument[];
  meta: { total: number };
}

interface Props {
  params: Promise<{ id: string }>;
}

/* ---- Countdown hook ---- */
function useCountdown(endDate: Date | string | undefined) {
  const getRemaining = () => {
    if (!endDate) return null;
    const end = endDate instanceof Date ? endDate : new Date(endDate as string);
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);
  return remaining;
}

function formatCountdown(
  r: ReturnType<typeof useCountdown>,
  endedLabel: string,
): {
  display: string;
  isEndingSoon: boolean;
} {
  if (!r) return { display: endedLabel, isEndingSoon: false };
  const { days, hours, minutes, seconds } = r;
  const isEndingSoon = days === 0 && hours < 1;
  let display: string;
  if (days > 0) display = `${days}d ${hours}h ${minutes}m`;
  else if (hours > 0) display = `${hours}h ${minutes}m ${seconds}s`;
  else display = `${minutes}m ${seconds}s`;
  return { display, isEndingSoon };
}

export default function AuctionDetailPage({ params }: Props) {
  const { id } = use(params);
  const { user } = useAuth();
  const tAuctions = useTranslations("auctions");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");

  /* ---- Fetch product ---- */
  const { data: productData, isLoading: productLoading } =
    useApiQuery<ProductResponse>({
      queryKey: ["product", id],
      queryFn: () =>
        fetch(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)).then((r) => r.json()),
    });

  const product = productData?.data ?? null;

  /* ---- Fetch bids (polls every 60s as fallback — RTDB provides live updates) ---- */
  const { data: bidsData, refetch: refetchBids } = useApiQuery<BidsResponse>({
    queryKey: ["bids", id],
    queryFn: () =>
      fetch(
        `${API_ENDPOINTS.BIDS.LIST}?productId=${encodeURIComponent(id)}`,
      ).then((r) => r.json()),
    enabled: !!product?.isAuction,
    refetchInterval: 60000,
  });

  const bids = useMemo(() => bidsData?.data ?? [], [bidsData]);

  /* ---- Real-time bid data via Firebase RTDB ---- */
  const {
    currentBid: rtdbBid,
    bidCount: rtdbBidCount,
    lastBid: lastRtdbBid,
    connected: rtdbConnected,
  } = useRealtimeBids(product?.isAuction ? id : null);

  /* ---- Countdown ---- */
  const remaining = useCountdown(product?.auctionEndDate);
  const isEnded = remaining === null && !!product?.auctionEndDate;
  const { display: countdownDisplay, isEndingSoon } = formatCountdown(
    remaining,
    tAuctions("ended"),
  );

  /* ---- Derived bid info (RTDB takes precedence over Firestore snapshot) ---- */
  const firestoreBid = product?.currentBid ?? 0;
  const currentBid = rtdbBid ?? firestoreBid;
  const startingBid = product?.startingBid ?? product?.price ?? 0;
  const displayBid = currentBid > 0 ? currentBid : startingBid;
  const hasCurrentBid = currentBid > 0;
  const liveBidCount = rtdbBidCount ?? bids.length;

  /* ---- Loading / Not found ---- */
  if (productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <p className={`text-lg font-medium ${themed.textPrimary}`}>
          {tProducts("productNotFound")}
        </p>
        <Link
          href={ROUTES.PUBLIC.AUCTIONS}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {tActions("back")}
        </Link>
      </div>
    );
  }

  /* ---- Not an auction ---- */
  if (!product.isAuction) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-20 text-center ${spacing.stack}`}
      >
        <p className={`text-lg font-medium ${themed.textPrimary}`}>
          {tAuctions("noAuctions")}
        </p>
        <Link
          href={ROUTES.PUBLIC.PRODUCTS + `/${product.id}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {tProducts("backToProducts")}
        </Link>
      </div>
    );
  }

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Breadcrumb */}
      <nav className={`text-sm ${themed.textSecondary}`}>
        <Link
          href={ROUTES.PUBLIC.AUCTIONS}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {tAuctions("title")}
        </Link>
        <span className="mx-2">/</span>
        <span className={`${themed.textPrimary} line-clamp-1`}>
          {product.title}
        </span>
      </nav>

      {/* Main layout: image left, info right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.mainImage ? (
            <Image
              src={product.mainImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">
              🔨
            </div>
          )}
          {/* LIVE badge */}
          {!isEnded && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {tAuctions("liveBadge")}
            </span>
          )}
          {/* Real-time connection indicator */}
          {rtdbConnected && !isEnded && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {tAuctions("realtimeBadge")}
            </span>
          )}
        </div>

        {/* Right: info + bid panel */}
        <div className={`flex flex-col ${spacing.stack}`}>
          <h1 className={`${typography.h3} ${themed.textPrimary}`}>
            {product.title}
          </h1>

          {/* Bid summary */}
          <div
            className={`rounded-xl border ${themed.border} p-4 ${spacing.stack}`}
          >
            <div className="flex flex-col gap-1">
              <p className={`text-xs ${themed.textSecondary}`}>
                {hasCurrentBid
                  ? tAuctions("currentBid")
                  : tAuctions("startingBid")}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(displayBid)}
              </p>
              <p className={`text-sm ${themed.textSecondary}`}>
                {tAuctions("totalBids", { count: liveBidCount })}
              </p>
              {lastRtdbBid && (
                <p className={`text-xs ${themed.textSecondary}`}>
                  {tAuctions("lastBidBy", { name: lastRtdbBid.bidderName })}
                </p>
              )}
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${themed.textSecondary}`}>
                {isEnded ? tAuctions("ended") : `${tAuctions("endsIn")}:`}
              </span>
              <span
                className={`font-mono font-bold text-lg ${
                  isEnded
                    ? themed.textSecondary
                    : isEndingSoon
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {countdownDisplay}
              </span>
            </div>
          </div>

          {/* Place bid form */}
          <PlaceBidForm
            productId={product.id}
            minimumBid={displayBid}
            currency={product.currency}
            isEnded={isEnded}
            isAuthenticated={!!user}
            onBidPlaced={() => refetchBids()}
          />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className={`font-semibold ${themed.textPrimary} mb-1`}>
                {tAuctions("description")}
              </h3>
              <p className={`text-sm ${themed.textSecondary} leading-relaxed`}>
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bid History (below image + info) */}
      <BidHistory bids={bids} />
    </main>
  );
}
