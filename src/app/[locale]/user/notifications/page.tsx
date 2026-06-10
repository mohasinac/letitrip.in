"use client";
import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useSession,
  useUrlTable,
  UserNotificationsView,
  Div,
  Text,
  Row,
  Stack,
  Button,
  useToast,
} from "@mohasinac/appkit/client";
import { ListingToolbar, Span } from "@mohasinac/appkit/ui";

const __P = {
  p4: "p-4",
} as const;

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string | Date;
  priority?: number;
}

interface NotifResponse {
  items: NotifItem[];
  total: number;
  unreadCount: number;
}

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"),  label: "Oldest" },
  { value: sortBy("priority", "DESC"),  label: "Highest priority" },
];

const TYPE_OPTIONS = [
  { value: "",         label: "All types" },
  { value: "orders",   label: "Orders" },
  { value: "bids",     label: "Bids" },
  { value: "system",   label: "System" },
  { value: "promotions", label: "Promotions" },
];

const READ_OPTIONS = [
  { value: "",       label: "Read & unread" },
  { value: "unread", label: "Unread only" },
  { value: "read",   label: "Read only" },
];

const TYPE_BUCKETS: Record<string, Set<string>> = {
  orders:     new Set(["order_placed", "order_confirmed", "order_shipped", "order_delivered", "order_cancelled"]),
  bids:       new Set(["bid_placed", "bid_outbid", "bid_won", "bid_lost"]),
  system:     new Set(["system", "welcome"]),
  promotions: new Set(["promotion"]),
};

function timeAgo(dateVal: string | Date) {
  const ms = Date.now() - new Date(dateVal).getTime();
  if (ms < 60_000)    return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function NotifCard({
  notif,
  onMarkRead,
  onDelete,
}: {
  notif: NotifItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Div
      className={`rounded-xl border px-5 py-4 space-y-2 transition-colors shadow-sm ${
        notif.isRead
          ? "border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]"
          : "border-[var(--appkit-color-primary)] bg-[var(--appkit-color-surface)]"
      }`}
    >
      <Row justify="between" wrap gap="3" align="start">
        <Div className="space-y-0.5 min-w-0">
          <Row gap="sm" align="center">
            {!notif.isRead && (
              <Span className="inline-block h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
            <Text className="text-sm font-semibold text-[var(--appkit-color-text)] line-clamp-1">
              {notif.title}
            </Text>
          </Row>
          <Text variant="secondary" className="text-sm line-clamp-2">{notif.message}</Text>
        </Div>
        <Text variant="secondary" className="text-xs shrink-0 mt-0.5">
          {timeAgo(notif.createdAt)}
        </Text>
      </Row>
      <Row gap="3" className="pt-1">
        {notif.actionUrl && notif.actionLabel && (
          <Link
            href={notif.actionUrl}
            className="text-xs font-medium text-primary hover:underline"
          >
            {notif.actionLabel}
          </Link>
        )}
        {!notif.isRead && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMarkRead(notif.id)}
            className="text-xs"
          >
            Mark read
          </Button>
        )}
        {/* eslint-disable-next-line lir/prefer-action-registry */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => onDelete(notif.id)}
          className="text-xs text-error hover:opacity-80 transition-colors ml-auto"
        >
          Delete
        </Button>
      </Row>
    </Div>
  );
}

export default function NotificationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const table = useUrlTable({ defaults: { pageSize: "50", sort: "-createdAt" } });
  const search = table.get("q") ?? "";
  const typeFilter = table.get("type") ?? "";
  const readFilter = table.get("read") ?? "";
  const sort = table.get("sort") ?? "-createdAt";

  const { data, isLoading } = useQuery<NotifResponse>({
    queryKey: ["user-notifications"],
    queryFn: () =>
      fetch("/api/user/notifications?pageSize=100")
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/user/notifications/${id}`, { method: "PATCH" }),
    onSuccess: invalidateNotifications,
    onError: () => showToast("Could not mark notification as read.", "error"),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () =>
      fetch("/api/user/notifications/read-all", { method: "POST" }),
    onSuccess: () => {
      invalidateNotifications();
      showToast("All notifications marked as read.", "success");
    },
    onError: () => showToast("Could not mark notifications as read.", "error"),
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/user/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidateNotifications();
      showToast("Notification deleted.", "info");
    },
    onError: () => showToast("Could not delete notification.", "error"),
  });

  const filtered = useMemo(() => {
    const all = data?.items ?? [];
    const q = search.trim().toLowerCase();
    const bucket = typeFilter ? TYPE_BUCKETS[typeFilter] : null;
    const filteredList = all
      .filter((n) => (readFilter === "unread" ? !n.isRead : readFilter === "read" ? n.isRead : true))
      .filter((n) => (bucket ? bucket.has(n.type) : true))
      .filter((n) =>
        q
          ? n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
          : true,
      );
    return [...filteredList].sort((a, b) => {
      switch (sort) {
        case "createdAt":  return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "-priority":  return (b.priority ?? 0) - (a.priority ?? 0);
        case "-createdAt":
        default:           return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
  }, [data, search, typeFilter, readFilter, sort]);

  const loading = sessionLoading || isLoading;
  const unreadCount = data?.unreadCount ?? 0;
  const filterCount = (typeFilter ? 1 : 0) + (readFilter ? 1 : 0);

  return (
    <UserNotificationsView
      labels={{ title: "Notifications" }}
      renderToolbar={() => (
        <Stack gap="md">
          <Row justify="between" wrap gap="3" align="center">
            <Div className="flex-1 min-w-0">
              <ListingToolbar
                searchValue={search}
                searchPlaceholder="Search notifications…"
                onSearchChange={(v) => table.set("q", v)}
                sortValue={sort}
                sortOptions={SORT_OPTIONS}
                onSortChange={(v) => table.set("sort", v)}
                hideViewToggle
                filterCount={filterCount}
                hasActiveState={filterCount > 0 || !!search}
                onResetAll={() => table.clear()}
              />
            </Div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead()}
                disabled={markingAll}
              >
                {markingAll ? "Marking…" : "Mark all read"}
              </Button>
            )}
          </Row>
          <Row gap="md" className="flex-wrap">
            <Div>
              {/* eslint-disable-next-line lir/no-raw-html-elements -- short filter; <Select> drops UX */}
              <select
                value={typeFilter}
                onChange={(e) => table.set("type", e.target.value)}
                className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
                aria-label="Filter by type"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Div>
            <Div>
              {/* eslint-disable-next-line lir/no-raw-html-elements -- short filter */}
              <select
                value={readFilter}
                onChange={(e) => table.set("read", e.target.value)}
                className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
                aria-label="Filter by read status"
              >
                {READ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Div>
          </Row>
        </Stack>
      )}
      renderList={() => {
        if (loading) {
          return (
            <Stack gap="md">
              {Array.from({ length: 5 }).map((_, i) => (
                <Div key={i} className={`animate-pulse rounded-xl border border-[var(--appkit-color-border)] ${__P.p4} space-y-2`}>
                  <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
                  <Div className="h-3 w-2/3 rounded bg-[var(--appkit-color-border)]" />
                </Div>
              ))}
            </Stack>
          );
        }
        if (filtered.length === 0) {
          return (
            <Div className="py-24 text-center">
              <Text variant="secondary">No notifications match the current filters.</Text>
            </Div>
          );
        }
        return (
          <Stack gap="sm">
            {filtered.map((notif) => (
              <NotifCard
                key={notif.id}
                notif={notif}
                onMarkRead={(id) => markRead(id)}
                onDelete={(id) => deleteNotif(id)}
              />
            ))}
          </Stack>
        );
      }}
    />
  );
}
