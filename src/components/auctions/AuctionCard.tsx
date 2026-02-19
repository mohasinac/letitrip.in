"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES, THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius } = THEME_CONSTANTS;

interface AuctionCardProps {
  product: Pick<
    ProductDocument,
    | "id"
    | "title"
    | "price"
    | "currency"
    | "mainImage"
    | "isAuction"
    | "auctionEndDate"
    | "startingBid"
    | "currentBid"
    | "bidCount"
    | "featured"
  >;
  className?: string;
}

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
    const id = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  return remaining;
}

function formatCountdown(remaining: ReturnType<typeof useCountdown>): string {
  if (!remaining) return UI_LABELS.AUCTIONS_PAGE.ENDED;
  const { days, hours, minutes, seconds } = remaining;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function AuctionCard({ product, className = "" }: AuctionCardProps) {
  const remaining = useCountdown(product.auctionEndDate);
  const isEnded = remaining === null;
  const isEndingSoon =
    remaining !== null && remaining.days === 0 && remaining.hours < 1;

  const displayBid =
    (product.currentBid ?? 0) > 0
      ? product.currentBid!
      : (product.startingBid ?? product.price);
  const bidCount = product.bidCount ?? 0;
  const hasCurrentBid = (product.currentBid ?? 0) > 0;

  return (
    <Link
      href={ROUTES.PUBLIC.AUCTION_DETAIL(product.id)}
      className={`group flex flex-col ${themed.bgPrimary} ${borderRadius.lg} overflow-hidden hover:shadow-xl transition-all duration-300 ${isEnded ? "opacity-60" : ""} ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
            🔨
          </div>
        )}

        {/* LIVE / Ending Soon badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!isEnded && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {UI_LABELS.AUCTIONS_PAGE.LIVE_BADGE}
            </span>
          )}
          {isEndingSoon && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {UI_LABELS.AUCTIONS_PAGE.ENDING_SOON}
            </span>
          )}
          {isEnded && (
            <span className="bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {UI_LABELS.AUCTIONS_PAGE.ENDED}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Title */}
        <p
          className={`text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug`}
        >
          {product.title}
        </p>

        {/* Current bid */}
        <div>
          <p className={`text-xs ${themed.textSecondary}`}>
            {hasCurrentBid
              ? UI_LABELS.AUCTIONS_PAGE.CURRENT_BID
              : UI_LABELS.AUCTIONS_PAGE.STARTING_BID}
          </p>
          <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(displayBid)}
          </p>
        </div>

        {/* Bid count + Countdown */}
        <div className={`flex items-center justify-between text-xs mt-auto`}>
          <span className={themed.textSecondary}>
            {UI_LABELS.AUCTIONS_PAGE.BID_COUNT(bidCount)}
          </span>
          <span
            className={`font-mono font-semibold ${
              isEnded
                ? themed.textSecondary
                : isEndingSoon
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {!isEnded && (
              <span className={`${themed.textSecondary} mr-1`}>
                {UI_LABELS.AUCTIONS_PAGE.ENDS_IN}:
              </span>
            )}
            {formatCountdown(remaining)}
          </span>
        </div>
      </div>
    </Link>
  );
}
