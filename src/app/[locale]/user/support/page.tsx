"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  useSession,
  useUrlTable,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Badge,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";
import { TICKET_STATUSES } from "@/constants";

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  orderId?: string;
  unreadByUser?: number;
}

const SORT_OPTIONS = [
  { value: "-updatedAt", label: "Recently updated" },
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt",  label: "Oldest" },
];

const STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info" | "admin"> = {
  open:             "pending",
  in_progress:      "info",
  waiting_on_user:  "pending",
  resolved:         "active",
  closed:           "admin",
};

function formatDate(d: string | Date) {
  return d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "";
}

export default function UserSupportPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "20", sort: "-updatedAt" } });
  const search = table.get("q") ?? "";
  const status = table.get("status") ?? "";
  const sort = table.get("sort") ?? "-updatedAt";

  const { data, isLoading } = useQuery<{ tickets: TicketItem[]; total: number }>({
    queryKey: ["user-support-tickets"],
    queryFn: () =>
      fetch("/api/support/tickets?pageSize=50")
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const tickets = useMemo(() => {
    const all = data?.tickets ?? [];
    const q = search.trim().toLowerCase();
    const filtered = all
      .filter((t) => (status ? t.status === status : true))
      .filter((t) =>
        q
          ? t.subject?.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
          : true,
      );
    return [...filtered].sort((a, b) => {
      const av = +new Date(sort === "-updatedAt" || sort === "updatedAt" ? a.updatedAt : a.createdAt);
      const bv = +new Date(sort === "-updatedAt" || sort === "updatedAt" ? b.updatedAt : b.createdAt);
      return sort.startsWith("-") ? bv - av : av - bv;
    });
  }, [data, search, status, sort]);

  const loading = sessionLoading || isLoading;
  const filterCount = status ? 1 : 0;

  return (
    <Div className="w-full space-y-6">
      <Row justify="between" wrap align="center">
        <Div>
          <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
            Support Tickets
          </Heading>
          {!loading && data && (
            <Text variant="secondary" className="text-sm mt-0.5">
              {data.total} ticket{data.total !== 1 ? "s" : ""}
            </Text>
          )}
        </Div>
        <Link
          href={ROUTES.USER.SUPPORT_NEW}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          + New ticket
        </Link>
      </Row>

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search tickets…"
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
        {/* eslint-disable-next-line lir/no-raw-html-elements -- short status filter */}
        <select
          value={status}
          onChange={(e) => table.set("status", e.target.value)}
          className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
          aria-label="Filter by ticket status"
        >
          {TICKET_STATUSES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div key={i} className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3">
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-1/2 rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
      ) : tickets.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">
            {status ? `No ${status.replace("_", " ")} tickets.` : "You haven't opened any support tickets yet."}
          </Text>
          <Link href={ROUTES.USER.SUPPORT_NEW} className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline">
            Open your first ticket →
          </Link>
        </Div>
      ) : (
        <Stack gap="md">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={String(ROUTES.USER.SUPPORT_TICKET(t.id))}
              className="block rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5 shadow-sm hover:border-[var(--appkit-color-primary)] transition-colors"
            >
              <Row justify="between" align="start" gap="3">
                <Div className="min-w-0">
                  <Text className="text-sm font-semibold text-[var(--appkit-color-text)] truncate">
                    {t.subject}
                  </Text>
                  <Row gap="sm" className="mt-1 flex-wrap">
                    <Text variant="secondary" className="text-xs capitalize">
                      {(t.category ?? "general").replaceAll("_", " ")}
                    </Text>
                    {t.orderId && (
                      <Text variant="secondary" className="text-xs">· Order {t.orderId}</Text>
                    )}
                    <Text variant="secondary" className="text-xs">· Updated {formatDate(t.updatedAt)}</Text>
                  </Row>
                </Div>
                <Badge variant={STATUS_VARIANT[t.status] ?? "pending"} className="shrink-0 capitalize">
                  {(t.status ?? "open").replaceAll("_", " ")}
                </Badge>
              </Row>
            </Link>
          ))}
        </Stack>
      )}
    </Div>
  );
}
