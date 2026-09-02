"use client";

import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useUrlTable,
  ROUTES,
  Div,
  Text,
  Stack,
  Row,
  Badge,
  DataListingView,
} from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { API_ENDPOINTS } from "@mohasinac/appkit/client";
import { FieldSelect } from "@mohasinac/appkit/ui";
import { TICKET_STATUSES } from "@/constants";



const __P = {
  p5: "p-[var(--appkit-space-5)]",
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

interface TicketsResponse {
  tickets?: TicketItem[];
  total?: number;
}

const SORT_OPTIONS = [
  { value: sortBy("updatedAt", "DESC"), label: "Recently updated" },
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
];

const STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info" | "admin"> = {
  open: "pending",
  in_progress: "info",
  waiting_on_user: "pending",
  resolved: "active",
  closed: "admin",
};

function formatDate(d: string | Date) {
  return d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "";
}

const CLOSED_STATUSES = new Set(["resolved", "closed"]);

function UserSupportPageInner() {
  const sideTable = useUrlTable({ defaults: { sort: sortBy("updatedAt", "DESC") } });
  const hideClosed = sideTable.get("hideClosed") !== "false";

  const config: ListingViewConfig<TicketsResponse, TicketItem> = {
    portal: "user",
    title: "Support Tickets",
    searchPlaceholder: "Search tickets…",
    emptyLabel: "You haven't opened any support tickets yet.",
    filterKeys: ["status"],
    defaultSort: sortBy("updatedAt", "DESC"),
    queryKey: ["user", "support-tickets", "listing"],
    endpoint: `${API_ENDPOINTS.SUPPORT.TICKETS}?pageSize=50`,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    toggles: [
      { label: "Hide resolved/closed", active: hideClosed, onChange: (next) => sideTable.set("hideClosed", next ? "" : "false") },
    ],
    toolbarExtra: (
      <Link
        href={ROUTES.USER.SUPPORT_NEW}
        className="rounded-xl bg-primary px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-semibold text-white hover:bg-primary-600"
      >
        + New ticket
      </Link>
    ),
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const status = sideTable.get("status") || "";
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const all = response.tickets ?? [];
      const filtered = all
        .filter((t) => (status ? t.status === status : true))
        .filter((t) => (status || !hideClosed ? true : !CLOSED_STATUSES.has(t.status)))
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
    },
    getTotal: (_response, rows) => rows.length,
    buildFilters: () => undefined,
    renderFilterPanel: ({ pendingFilters, setPendingFilters }) => (
      <FieldSelect
        name="status"
        label="Ticket status"
        value={pendingFilters.status || ""}
        onChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}
        options={[...TICKET_STATUSES]}
      />
    ),
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} className={`animate-pulse border border-[var(--appkit-color-border)] ${__P.p5}`} gap="3" rounded="xl">
                <Div className="h-4 w-1/3 bg-[var(--appkit-color-border)]" rounded="default" />
                <Div className="h-3 w-1/2 bg-[var(--appkit-color-border)]" rounded="default" />
              </Stack>
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        const status = sideTable.get("status") || "";
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">
              {status ? `No ${status.replace("_", " ")} tickets.` : "You haven't opened any support tickets yet."}
            </Text>
            <Link href={ROUTES.USER.SUPPORT_NEW} className="mt-3 inline-block text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline">
              Open your first ticket →
            </Link>
          </Div>
        );
      }
      return (
        <Stack gap="md">
          {rows.map((t) => (
            <Link
              key={t.id}
              href={String(ROUTES.USER.SUPPORT_TICKET(t.id))}
              className="block rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-[var(--appkit-space-5)] shadow-sm hover:border-[var(--appkit-color-primary)] transition-colors"
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
      );
    },
  };

  return <DataListingView config={config} />;
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function UserSupportPage() {
  return (
    <Suspense>
      <UserSupportPageInner />
    </Suspense>
  );
}
