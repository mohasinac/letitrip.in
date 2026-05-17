"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useSession,
  useUrlTable,
  CodeRevealPanel,
  type RevealedCode,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt",  label: "Oldest" },
];

async function fetchOrderCode(orderId: string): Promise<RevealedCode> {
  const res = await fetch(`/api/orders/${orderId}/code`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Could not retrieve code");
  return body.data as RevealedCode;
}

interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  listingType?: string;
}

interface OrderDoc {
  id: string;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
}

function paise(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function CodeRevealRow({ item, orderId }: { item: OrderItem; orderId: string }) {
  return (
    <Div className="rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-4 space-y-3">
      <Row justify="between" align="start">
        <Div className="space-y-0.5">
          <Link
            href={String(ROUTES.PUBLIC.DIGITAL_CODE_DETAIL(item.productId))}
            className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
          >
            {item.productTitle}
          </Link>
          <Text variant="secondary" className="text-xs">{paise(item.price)}</Text>
        </Div>
        <Link
          href={String(ROUTES.USER.ORDER_DETAIL(orderId))}
          className="text-xs text-[var(--appkit-color-primary)] hover:underline shrink-0"
        >
          View order
        </Link>
      </Row>
      <CodeRevealPanel orderId={orderId} fetchCode={fetchOrderCode} />
    </Div>
  );
}

export default function UserDigitalCodesPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const search = table.get("q") ?? "";

  const { data, isLoading } = useQuery<{ items: OrderDoc[] }>({
    queryKey: ["user-digital-codes"],
    queryFn: () =>
      fetch(`${API_ROUTES.USER.ORDERS}?perPage=100`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const codeItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result: Array<{ orderId: string; item: OrderItem }> = [];
    for (const order of data?.items ?? []) {
      for (const item of order.items ?? []) {
        if (item.listingType !== "digital-code") continue;
        if (q && !(item.productTitle?.toLowerCase().includes(q) || order.id.toLowerCase().includes(q))) continue;
        result.push({ orderId: order.id, item });
      }
    }
    return result;
  }, [data, search]);

  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Digital Codes
        </Heading>
        {!loading && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {codeItems.length} code{codeItems.length !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search by product or order…"
        onSearchChange={(v) => table.set("q", v)}
        sortValue={table.get("sort") ?? "-createdAt"}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => table.set("sort", v)}
        hideViewToggle
        hasActiveState={!!search}
        onResetAll={() => table.clear()}
      />

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-8 w-full rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
      ) : codeItems.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">You haven&apos;t purchased any digital codes yet.</Text>
          <Link
            href={String(ROUTES.PUBLIC.DIGITAL_CODES)}
            className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline"
          >
            Browse digital codes
          </Link>
        </Div>
      ) : (
        <Stack gap="sm">
          {codeItems.map(({ orderId, item }, idx) => (
            <CodeRevealRow key={`${orderId}-${idx}`} item={item} orderId={orderId} />
          ))}
        </Stack>
      )}
    </Div>
  );
}
