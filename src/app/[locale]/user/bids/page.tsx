"use client";
import { useQuery } from "@tanstack/react-query";
import {
  useSession,
  ROUTES,
  Div,
  Heading,
  Text,
  AuctionBidsTable,
} from "@mohasinac/appkit/client";
import type { BidDocument } from "@mohasinac/appkit";
import Link from "next/link";

export default function UserBidsPage() {
  const { user, loading: sessionLoading } = useSession();

  const { data, isLoading } = useQuery<{ bids: BidDocument[]; total: number }>({
    queryKey: ["user-bids"],
    queryFn: () =>
      fetch("/api/user/bids")
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const bids = data?.bids ?? [];
  const loading = sessionLoading || isLoading;

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

      {loading ? (
        <Div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-1/2 rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Div>
      ) : (
        <AuctionBidsTable
          bids={bids}
          portal="buyer"
          emptyLabel={
            <span>
              You haven&apos;t placed any bids yet.{" "}
              <Link
                href={String(ROUTES.PUBLIC.AUCTIONS)}
                className="text-[var(--appkit-color-primary)] hover:underline"
              >
                Browse auctions
              </Link>
            </span>
          }
        />
      )}
    </Div>
  );
}
