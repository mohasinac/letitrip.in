"use client";
import { useQuery } from "@tanstack/react-query";
import { AuctionBidsTable, Div, Heading, ROUTES, Span, Stack, Text, sortBy, useSession, useUrlTable } from "@mohasinac/appkit/client";
import { FieldSelect, ListingToolbar } from "@mohasinac/appkit/ui";
import type { BidDocument } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";
import { getUserBids } from "@/lib/api/user-client";
import { API_ROUTES } from "@/constants";

const SORT_OPTIONS = [
  { value: sortBy("bidDate", "DESC"), label: "Newest first" },
  { value: "bidDate",  label: "Oldest first" },
  { value: sortBy("bidAmount", "DESC"),  label: "Highest bid" },
  { value: "bidAmount",   label: "Lowest bid" },
];

const STATUS_OPTIONS = [
  { value: "",          label: "All statuses" },
  { value: "active",    label: "Active" },
  { value: "outbid",    label: "Outbid" },
  { value: "won",       label: "Won" },
  { value: "cancelled", label: "Cancelled" },
];

interface UserBidsResponse {
  bids: BidDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function UserBidsPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "20", sort: "-bidDate" } });
  const page = table.getNumber("page", 1);
  const status = table.get("status") ?? "";
  const sort = table.get("sort") ?? "-bidDate";

  const { data, isLoading } = useQuery<UserBidsResponse>({
    queryKey: ["user-bids", page, status, sort],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: "20", sort });
      if (status) qs.set("status", status);
      return getUserBids(`${API_ROUTES.USER.BIDS}?${qs.toString()}`)
        .then((r) => r.json())
        .then((r) => r.data);
    },
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const bids = data?.bids ?? [];
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
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => table.set("sort", v)}
        hideViewToggle
        filterCount={filterCount}
        hasActiveState={filterCount > 0}
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
          totalPages={data?.totalPages ?? 1}
          currentPage={page}
          onPageChange={(p) => table.setPage(p)}
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
