"use client";
import { useQuery } from "@tanstack/react-query";
import {
  useAuth,
  useOrders,
  ROUTES,
  Div,
  Stack,
  Text,
  Heading,
} from "@mohasinac/appkit/client";
import { apiClient } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";

interface BidLite {
  id: string;
  amount: number;
  status?: string;
  productId?: string;
  bidTime?: string | number;
}
interface ReviewLite {
  id: string;
  rating: number;
  title?: string;
  productId?: string;
  publishedAt?: string | number;
}

function formatINR(paise: number): string {
  const rupees = Math.round((paise ?? 0) / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <Div className="rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3">
      <Text className="text-xl font-bold text-[var(--appkit-color-text)] leading-tight">{value}</Text>
      <Text className="text-xs text-[var(--appkit-color-text-muted)] mt-0.5">{label}</Text>
    </Div>
  );
}

function SectionCard({ title, viewAllHref, children }: { title: string; viewAllHref: string; children: React.ReactNode }) {
  return (
    <Div className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5 shadow-sm">
      <Div className="mb-3 flex items-center justify-between">
        <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">{title}</Text>
        <Link href={viewAllHref} className="text-xs text-[var(--appkit-color-primary)] hover:underline">View all →</Link>
      </Div>
      {children}
    </Div>
  );
}

export function ProfileActivityPanel() {
  const { user } = useAuth();
  const { orders: recentOrders } = useOrders({ page: 1, perPage: 5 });
  const { orders: allOrders } = useOrders({ page: 1, perPage: 100 });

  const { data: bidsData } = useQuery<{ bids: BidLite[]; total: number }>({
    queryKey: ["user-bids", "profile-activity"],
    // eslint-disable-next-line lir/no-apiclient-outside-services -- queryFn IS the service boundary here
    queryFn: () => apiClient.get<{ bids: BidLite[]; total: number }>("/api/user/bids?limit=5"),
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: reviewsData } = useQuery<{ reviews: ReviewLite[]; total: number }>({
    queryKey: ["user-reviews", "profile-activity"],
    queryFn: () =>
      // eslint-disable-next-line lir/no-apiclient-outside-services -- queryFn IS the service boundary here
      apiClient
        .get<{ reviews: ReviewLite[]; total: number }>("/api/user/reviews?limit=5")
        .catch(() => ({ reviews: [], total: 0 })),
    enabled: !!user,
    staleTime: 60_000,
  });

  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce(
    (acc: number, o: any) => acc + (typeof o?.totalAmount === "number" ? o.totalAmount : 0),
    0,
  );
  const memberSince = (user as any)?.metadata?.creationTime ?? null;

  return (
    <Stack gap="lg">
      <Heading level={2} className="text-lg font-semibold text-[var(--appkit-color-text)]">Your activity</Heading>

      {/* eslint-disable-next-line lir/no-hardcoded-grid-cols -- fixed 4-stat strip; FLUID_GRID token oversizes */}
      <Div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Lifetime orders" value={totalOrders} />
        <StatPill label="Lifetime spent" value={formatINR(totalSpent)} />
        <StatPill label="Bids placed" value={bidsData?.total ?? 0} />
        <StatPill label="Member since" value={memberSince ? new Date(memberSince).getFullYear() : "—"} />
      </Div>

      {/* eslint-disable-next-line lir/no-hardcoded-grid-cols, lir/require-xl-breakpoints -- 3-panel activity row stays 3-wide above lg */}
      <Div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Recent orders" viewAllHref={String(ROUTES.USER.ORDERS)}>
          {recentOrders.length === 0 ? (
            <Text variant="secondary" className="text-xs">No orders yet.</Text>
          ) : (
            <Stack gap="sm">
              {recentOrders.slice(0, 5).map((o: any) => (
                <Link
                  key={o.id}
                  href={String(ROUTES.USER.ORDER_DETAIL(o.id))}
                  className="block rounded-md border border-[var(--appkit-color-border)] px-3 py-2 hover:border-[var(--appkit-color-primary)] transition-colors"
                >
                  <Text className="text-xs font-medium text-[var(--appkit-color-text)] truncate">{o.id}</Text>
                  <Text className="text-[11px] text-[var(--appkit-color-text-muted)]">
                    {formatINR(o.totalAmount ?? 0)} · {o.status ?? ""}
                  </Text>
                </Link>
              ))}
            </Stack>
          )}
        </SectionCard>

        <SectionCard title="Recent bids" viewAllHref={String(ROUTES.USER.BIDS)}>
          {!bidsData || bidsData.bids.length === 0 ? (
            <Text variant="secondary" className="text-xs">No bids yet.</Text>
          ) : (
            <Stack gap="sm">
              {bidsData.bids.slice(0, 5).map((b) => (
                <Div key={b.id} className="rounded-md border border-[var(--appkit-color-border)] px-3 py-2">
                  <Text className="text-xs font-medium text-[var(--appkit-color-text)] truncate">{b.productId ?? "Auction"}</Text>
                  <Text className="text-[11px] text-[var(--appkit-color-text-muted)]">
                    {formatINR(b.amount)} · {b.status ?? "active"}
                  </Text>
                </Div>
              ))}
            </Stack>
          )}
        </SectionCard>

        <SectionCard title="Recent reviews" viewAllHref={String(ROUTES.USER.REVIEWS)}>
          {!reviewsData || reviewsData.reviews.length === 0 ? (
            <Text variant="secondary" className="text-xs">No reviews yet.</Text>
          ) : (
            <Stack gap="sm">
              {reviewsData.reviews.slice(0, 5).map((r) => (
                <Div key={r.id} className="rounded-md border border-[var(--appkit-color-border)] px-3 py-2">
                  <Text className="text-xs font-medium text-[var(--appkit-color-text)] truncate">{r.title ?? r.productId}</Text>
                  <Text className="text-[11px] text-[var(--appkit-color-text-muted)]">{"★".repeat(r.rating ?? 0)}</Text>
                </Div>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Div>
    </Stack>
  );
}
