"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuctionBidsTable, Div, Heading, ROUTES, Span, Stack, Text, sortBy, useSession, useUrlTable } from "@mohasinac/appkit/client";
import { FieldSelect, ListingToolbar } from "@mohasinac/appkit/ui";
import type { BidDocument } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";

const SORT_OPTIONS = [
  { value: sortBy("bidTime", "DESC"), label: "Newest first" },
  { value: "bidTime",  label: "Oldest first" },
  { value: sortBy("amount", "DESC"),  label: "Highest bid" },
  { value: "amount",   label: "Lowest bid" },
];

const STATUS_OPTIONS = [
  { value: "",          label: "All statuses" },
  { value: "active",    label: "Active" },
  { value: "outbid",    label: "Outbid" },
  { value: "won",       label: "Won" },
  { value: "cancelled", label: "Cancelled" },
];

export default function UserBidsPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "20", sort: "-bidTime" } });
  const search = table.get("q") ?? "";
  const status = table.get("status") ?? "";
  const sort = table.get("sort") ?? "-bidTime";

  const { data, isLoading } = useQuery<{ bids: BidDocument[]; total: number }>({
    queryKey: ["user-bids"],
    queryFn: () =>
      fetch("/api/user/bids?limit=100")
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const bids = useMemo(() => {
    const all = data?.bids ?? [];
    const q = search.trim().toLowerCase();
    const filtered = all
      .filter((b: any) => (status ? b.status === status : true))
      .filter((b: any) => (q ? (b.productId ?? "").toLowerCase().includes(q) : true));
    return [...filtered].sort((a: any, b: any) => {
      switch (sort) {
        case "bidTime":  return +new Date(a.bidTime) - +new Date(b.bidTime);
        case "-amount":  return (b.amount ?? 0) - (a.amount ?? 0);
        case "amount":   return (a.amount ?? 0) - (b.amount ?? 0);
        case "-bidTime":
        default:         return +new Date(b.bidTime) - +new Date(a.bidTime);
      }
    });
  }, [data, search, status, sort]);

  const loading = sessionLoading || isLoading;
  const filterCount = status ? 1 : 0;

  return (
    <Stack className="w-full" gap="lg">
      <Div>
        <Heading level={1} className="text-[var(--appkit-color-text)]" size="2xl" weight="semibold">
          My Bids
        </Heading>
        {!loading && data && (
          <Text variant="secondary" className="mt-0.5" size="sm">
            {data.total} bid{data.total !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search by auction id…"
        onSearchChange={(v) => table.set("q", v)}
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => table.set("sort", v)}
        hideViewToggle
        filterCount={filterCount}
        hasActiveState={filterCount > 0 || !!search}
        onResetAll={() => table.clear()}
      />

      <Div>
        <FieldSelect
          name="status"
          aria-label="Filter by bid status"
          value={status}
          onChange={(v) => table.set("status", v)}
          options={STATUS_OPTIONS}
        />
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Stack padding="5" 
              key={i}
              className="animate-pulse border border-[var(--appkit-color-border)]" gap="3" rounded="xl"
            >
              <Div className="h-4 w-1/3 bg-[var(--appkit-color-border)]" rounded="default" />
              <Div className="h-3 w-1/2 bg-[var(--appkit-color-border)]" rounded="default" />
            </Stack>
          ))}
        </Stack>
      ) : (
        <AuctionBidsTable
          bids={bids}
          portal="buyer"
          emptyLabel={
            <Span>
              You haven&apos;t placed any bids yet.{" "}
              <Link
                href={String(ROUTES.PUBLIC.AUCTIONS)}
                className="text-[var(--appkit-color-primary)] hover:underline"
              >
                Browse auctions
              </Link>
            </Span>
          }
        />
      )}
    </Stack>
  );
}
