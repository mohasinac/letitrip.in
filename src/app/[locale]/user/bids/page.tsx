"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-26: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-26) */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  useSession,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
} from "@mohasinac/appkit/client";

interface BidItem {
  id: string;
  productId: string;
  productTitle: string;
  bidAmount: number;
  currency: string;
  status: string;
  isWinning: boolean;
  bidDate: string | Date;
  createdAt: string | Date;
}

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  outbid:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  won:       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  lost:      "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-zinc-400",
};

function paise(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount / 100);
}

export default function UserBidsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [filter, setFilter] = useState<"all" | "active" | "won" | "outbid" | "lost">("all");

  const { data, isLoading } = useQuery<{ bids: BidItem[]; total: number }>({
    queryKey: ["user-bids"],
    queryFn: () => fetch("/api/user/bids").then((r) => r.json()).then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const bids = useMemo(() => {
    const all = data?.bids ?? [];
    if (filter === "all") return all;
    return all.filter((b) => b.status === filter);
  }, [data, filter]);

  const loading = sessionLoading || isLoading;

  const tabs = [
    { key: "all",    label: "All" },
    { key: "active", label: "Active" },
    { key: "won",    label: "Won" },
    { key: "outbid", label: "Outbid" },
    { key: "lost",   label: "Lost" },
  ] as const;

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Bids
        </Heading>
        {!loading && data && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {data.total} bid{data.total !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      {/* Tab filter */}
      <Row gap="sm" className="flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[var(--appkit-color-primary)] text-white"
                : "bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text-muted)] hover:bg-[var(--appkit-color-border)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </Row>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div key={i} className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3">
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-1/2 rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
      ) : bids.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">
            {filter === "all" ? "You haven't placed any bids yet." : `No ${filter} bids.`}
          </Text>
        </Div>
      ) : (
        <Stack gap="md">
          {bids.map((bid) => {
            const date = bid.bidDate
              ? new Date(bid.bidDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusColor = STATUS_COLORS[bid.status] ?? "bg-zinc-100 text-zinc-600";
            const auctionHref = String(ROUTES.PUBLIC.AUCTION_DETAIL(bid.productId));
            return (
              <Div
                key={bid.id}
                className="relative rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] overflow-hidden shadow-sm p-5"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: "linear-gradient(to right,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)" }}
                  aria-hidden="true"
                />
                <Row justify="between" wrap align="start" gap="3">
                  <Div className="space-y-1 min-w-0">
                    <Link href={auctionHref} className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1">
                      {bid.productTitle}
                    </Link>
                    <Text variant="secondary" className="text-xs">{date}</Text>
                  </Div>
                  <Row gap="sm" className="shrink-0 items-center">
                    {bid.isWinning && (
                      <span className="rounded-full bg-[var(--appkit-color-primary)] text-white px-2 py-0.5 text-xs font-medium">
                        Winning
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor}`}>
                      {bid.status}
                    </span>
                  </Row>
                </Row>
                <Row justify="between" className="mt-3 pt-3 border-t border-[var(--appkit-color-border-subtle)]">
                  <Text variant="secondary" className="text-sm">Your bid</Text>
                  <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">
                    {paise(bid.bidAmount)}
                  </Text>
                </Row>
              </Div>
            );
          })}
        </Stack>
      )}
    </Div>
  );
}
