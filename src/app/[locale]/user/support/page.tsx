"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
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
import { FieldSelect, ListingToolbar } from "@mohasinac/appkit/ui";
import { TICKET_STATUSES } from "@/constants";
import { getSupportTickets } from "@/lib/api/support-client";

const __P = {
  p5: "p-5",
} as const;

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
  { value: sortBy("updatedAt", "DESC"), label: "Recently updated" },
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"),  label: "Oldest" },
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
      getSupportTickets()
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
    <Stack className="w-full" gap="lg">
      <Row justify="between" wrap align="center">
        <Div>
          <Heading level={1} className="text-[var(--appkit-color-text)]" size="2xl" weight="semibold">
            Support Tickets
          </Heading>
          {!loading && data && (
            <Text variant="secondary" className="mt-0.5" size="sm">
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
        <FieldSelect
          name="status"
          aria-label="Filter by ticket status"
          value={status}
          onChange={(v) => table.set("status", v)}
          options={[...TICKET_STATUSES]}
        />
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Stack key={i} className={`animate-pulse border border-[var(--appkit-color-border)] ${__P.p5}`} gap="3" rounded="xl">
              <Div className="h-4 w-1/3 bg-[var(--appkit-color-border)]" rounded="default" />
              <Div className="h-3 w-1/2 bg-[var(--appkit-color-border)]" rounded="default" />
            </Stack>
          ))}
        </Stack>
      ) : tickets.length === 0 ? (
        <Div padding="y-6xl" className="text-center">
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
                  <Text className="text-[var(--appkit-color-text)] truncate" size="sm" weight="semibold">
                    {t.subject}
                  </Text>
                  <Row gap="sm" className="mt-1" wrap>
                    <Text variant="secondary" size="xs" transform="capitalize">
                      {(t.category ?? "general").replaceAll("_", " ")}
                    </Text>
                    {t.orderId && (
                      <Text variant="secondary" size="xs">· Order {t.orderId}</Text>
                    )}
                    <Text variant="secondary" size="xs">· Updated {formatDate(t.updatedAt)}</Text>
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
    </Stack>
  );
}
