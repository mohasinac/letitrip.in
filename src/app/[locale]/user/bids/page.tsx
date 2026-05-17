"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useSession,
  useUrlTable,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  AuctionBidsTable,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";
import type { BidDocument } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";

const SORT_OPTIONS = [
  { value: "-bidTime", label: "Newest first" },
  { value: "bidTime",  label: "Oldest first" },
  { value: "-amount",  label: "Highest bid" },
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
    <Div className="w-full space-y-6">
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
        {/* eslint-disable-next-line lir/no-raw-html-elements -- short status filter; <Select> wrapper drops this UX */}
        <select
          value={status}
          onChange={(e) => table.set("status", e.target.value)}
          className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
          aria-label="Filter by bid status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-1/2 rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
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
