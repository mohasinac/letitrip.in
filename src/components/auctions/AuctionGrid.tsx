"use client";

import { AuctionCard } from "./AuctionCard";
import type { AuctionCardData } from "./AuctionCard";
import { Span, Text, Stack, Div, Row } from "@mohasinac/appkit/ui";
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
      <Div
        className={`bg-zinc-200 dark:bg-slate-700 rounded-xl overflow-hidden animate-pulse flex flex-row ${dimensions.listMinH}`}
      >
        <Div
          className={`${dimensions.listMediaW} aspect-square bg-zinc-300 dark:bg-slate-600 flex-shrink-0`}
        />
        <Div className="flex-1 p-3 space-y-2">
          <Div className="h-4 bg-zinc-300 dark:bg-slate-600 rounded w-2/3" />
          <Div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-full" />
          <Div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-3/4" />
          <Div className="h-5 bg-zinc-300 dark:bg-slate-600 rounded w-1/2" />
          <Row gap="sm">
            <Div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
            <Div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
          </Row>
        </Div>
      </Div>
    );
  }
  return (
    <Div className="bg-zinc-200 dark:bg-slate-700 rounded-xl overflow-hidden animate-pulse">
      <Div className="aspect-square bg-zinc-300 dark:bg-slate-600" />
      <Div className="p-3 space-y-2">
        <Div className="h-4 bg-zinc-300 dark:bg-slate-600 rounded w-3/4" />
        <Div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/3" />
        <Div className="h-5 bg-zinc-300 dark:bg-slate-600 rounded w-1/2" />
        <Row justify="between">
          <Div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/4" />
          <Div className="h-3 bg-zinc-300 dark:bg-slate-600 rounded w-1/3" />
        </Row>
        <Row gap="sm">
          <Div className="h-8 bg-zinc-300 dark:bg-slate-600 rounded flex-1" />
        </Row>
      </Div>
    </Div>
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
      <Div className={containerClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AuctionCardSkeleton key={i} variant={variant} />
        ))}
      </Div>
    );
  }

  if (auctions.length === 0) {
    return (
      <Stack
        align="center"
        gap="3"
        className="py-24 text-center justify-center"
      >
        <Span className="text-6xl">🔨</Span>
        <Text variant="primary" className="text-xl font-medium">
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS}
        </Text>
        <Text size="sm" variant="secondary">
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS_SUBTITLE}
        </Text>
      </Stack>
    );
  }

  return (
    <Div className={containerClass}>
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
    </Div>
  );
}
