"use client";

import { AuctionCard } from "./AuctionCard";
import type { AuctionCardData } from "./AuctionCard";
import { Span, Text } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

const { card } = THEME_CONSTANTS;
const { dimensions } = card;

type AuctionGridItem = AuctionCardData;

interface AuctionGridProps {
  auctions: AuctionGridItem[];
  loading?: boolean;
  skeletonCount?: number;
  /** "grid"/"card"/"fluid" (default): responsive grid. "list": stacked horizontal cards. */
  variant?: "grid" | "card" | "fluid" | "list";
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /**
   * Tailwind grid class for the card grid (variant="grid" only).
   * Defaults to THEME_CONSTANTS.grid.cards (2→3→max 4 across breakpoints).
   * Use THEME_CONSTANTS.grid.* presets or any custom Tailwind grid class.
   */
  gridClassName?: string;
}

function AuctionCardSkeleton({
  variant = "grid",
}: {
  variant?: "grid" | "card" | "fluid" | "list";
}) {
  if (variant === "list") {
    return (
      <div
        className={`bg-zinc-200 dark:bg-slate-700 rounded-xl overflow-hidden animate-pulse flex flex-row ${dimensions.listMinH}`}
      >
        <div
          className={`${dimensions.listMediaW} aspect-square bg-zinc-300 dark:bg-slate-600 flex-shrink-0`}
        />
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-zinc-300 dark:bg-slate-600 rounded w-2/3" />
          <div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-full" />
          <div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-3/4" />
          <div className="h-5 bg-zinc-300 dark:bg-slate-600 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
            <div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-zinc-200 dark:bg-slate-700 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-zinc-300 dark:bg-slate-600" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-300 dark:bg-slate-600 rounded w-3/4" />
        <div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/3" />
        <div className="h-5 bg-zinc-300 dark:bg-slate-600 rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/4" />
          <div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}

export function AuctionGrid({
  auctions,
  loading = false,
  skeletonCount = 12,
  variant = "grid",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  gridClassName,
}: AuctionGridProps) {
  const handleSelect = (id: string, selected: boolean) => {
    if (!onSelectionChange) return;
    if (selected) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  const containerClass =
    variant === "list"
      ? "flex flex-col gap-4"
      : (gridClassName ?? THEME_CONSTANTS.grid.cards) + " gap-6";

  if (loading) {
    return (
      <div className={containerClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AuctionCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Span className="text-6xl">🔨</Span>
        <Text variant="primary" className="text-xl font-medium">
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS}
        </Text>
        <Text size="sm" variant="secondary">
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS_SUBTITLE}
        </Text>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {auctions.map((auction) => (
        <AuctionCard
          key={auction.id}
          product={auction}
          variant={variant}
          selectable={selectable}
          isSelected={selectedIds.includes(auction.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
