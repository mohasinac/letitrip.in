"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  Button,
  Div,
  Row,
  Stack,
  Text,
  sortBy,
  useApiMutation,
  useToast,
  useUrlTable,
  DataListingView,
} from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { FieldSelect, Span } from "@mohasinac/appkit/ui";
import {
  markUserNotificationRead,
  markAllUserNotificationsRead,
  deleteUserNotification,
} from "@/lib/api/user-client";
import { API_ROUTES } from "@/constants";

const __P = {
  p4: "p-[var(--appkit-space-4)]",
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
  items?: NotifItem[];
  total?: number;
  unreadCount?: number;
}

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
  { value: sortBy("priority", "DESC"), label: "Highest priority" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "orders", label: "Orders" },
  { value: "bids", label: "Bids" },
  { value: "system", label: "System" },
  { value: "promotions", label: "Promotions" },
];

const READ_OPTIONS = [
  { value: "", label: "Read & unread" },
  { value: "unread", label: "Unread only" },
  { value: "read", label: "Read only" },
];

const TYPE_BUCKETS: Record<string, Set<string>> = {
  orders: new Set(["order_placed", "order_confirmed", "order_shipped", "order_delivered", "order_cancelled"]),
  bids: new Set(["bid_placed", "bid_outbid", "bid_won", "bid_lost"]),
  system: new Set(["system", "welcome"]),
  promotions: new Set(["promotion"]),
};

function timeAgo(dateVal: string | Date) {
  const ms = Date.now() - new Date(dateVal).getTime();
  if (ms < 60_000) return "just now";
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
    <Stack
      className={`border transition-colors ${notif.isRead ? "border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]" : "border-[var(--appkit-color-primary)] bg-[var(--appkit-color-surface)]"}`} gap="sm" rounded="xl" shadow="sm" paddingX="x-5" paddingY="y-md"
    >
      <Row justify="between" wrap gap="3" align="start">
        <Stack gap="none" className="min-w-0">
          <Row gap="sm" align="center">
            {!notif.isRead && (
              <Span className="inline-block h-2 w-2 bg-primary shrink-0" rounded="full" />
            )}
            <Text className="text-[var(--appkit-color-text)] line-clamp-1" size="sm" weight="semibold">
              {notif.title}
            </Text>
          </Row>
          <Text variant="secondary" className="line-clamp-2" size="sm">{notif.message}</Text>
        </Stack>
        <Text variant="secondary" className="shrink-0 mt-0.5" size="xs">
          {timeAgo(notif.createdAt)}
        </Text>
      </Row>
      <Row gap="3" padding="t-2xs">
        {notif.actionUrl && notif.actionLabel && (
          <Link
            href={notif.actionUrl}
            className="text-[length:var(--appkit-text-xs)] font-medium text-primary hover:underline"
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
            className="text-[length:var(--appkit-text-xs)]"
          >
            Mark read
          </Button>
        )}
        {/* eslint-disable-next-line lir/prefer-action-registry */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => onDelete(notif.id)}
          className="text-[length:var(--appkit-text-xs)] text-error hover:opacity-80 transition-colors ml-auto"
        >
          Delete
        </Button>
      </Row>
    </Stack>
  );
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const sideTable = useUrlTable({ defaults: { sort: sortBy("createdAt", "DESC") } });

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["user", "notifications", "listing"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const { mutate: markRead } = useApiMutation({
    mutationFn: (id: string) => markUserNotificationRead(API_ROUTES.USER.NOTIFICATION_BY_ID(id)),
    onSuccess: invalidateNotifications,
    onError: () => showToast("Could not mark notification as read.", "error"),
  });

  const { mutate: markAllRead, isPending: markingAll } = useApiMutation({
    mutationFn: () => markAllUserNotificationsRead(API_ROUTES.USER.NOTIFICATIONS_READ_ALL),
    onSuccess: () => {
      invalidateNotifications();
      showToast("All notifications marked as read.", "success");
    },
    onError: () => showToast("Could not mark notifications as read.", "error"),
  });

  const { mutate: deleteNotif } = useApiMutation({
    mutationFn: (id: string) => deleteUserNotification(API_ROUTES.USER.NOTIFICATION_BY_ID(id)),
    onSuccess: () => {
      invalidateNotifications();
      showToast("Notification deleted.", "info");
    },
    onError: () => showToast("Could not delete notification.", "error"),
  });

  const config: ListingViewConfig<NotifResponse, NotifItem> = {
    portal: "user",
    title: "Notifications",
    searchPlaceholder: "Search notifications…",
    emptyLabel: "No notifications match the current filters.",
    filterKeys: ["type", "read"],
    defaultSort: sortBy("createdAt", "DESC"),
    queryKey: ["user", "notifications", "listing"],
    endpoint: `${API_ROUTES.USER.NOTIFICATIONS}?pageSize=100`,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    toolbarExtra: (
      <Button
        variant="outline"
        size="sm"
        onClick={() => markAllRead()}
        disabled={markingAll}
      >
        {markingAll ? "Marking…" : "Mark all read"}
      </Button>
    ),
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const typeFilter = sideTable.get("type") || "";
      const readFilter = sideTable.get("read") || "";
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const all = response.items ?? [];
      const bucket = typeFilter ? TYPE_BUCKETS[typeFilter] : null;
      const filteredList = all
        .filter((n) => (readFilter === "unread" ? !n.isRead : readFilter === "read" ? n.isRead : true))
        .filter((n) => (bucket ? bucket.has(n.type) : true))
        .filter((n) => (q ? n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q) : true));
      return [...filteredList].sort((a, b) => {
        switch (sort) {
          case "createdAt": return +new Date(a.createdAt) - +new Date(b.createdAt);
          case sortBy("priority", "DESC"): return (b.priority ?? 0) - (a.priority ?? 0);
          default: return +new Date(b.createdAt) - +new Date(a.createdAt);
        }
      });
    },
    getTotal: (_response, rows) => rows.length,
    buildFilters: () => undefined,
    renderFilterPanel: ({ pendingFilters, setPendingFilters }) => (
      <Stack gap="md">
        <FieldSelect
          name="type"
          label="Type"
          value={pendingFilters.type || ""}
          onChange={(v) => setPendingFilters((p) => ({ ...p, type: v }))}
          options={TYPE_OPTIONS}
        />
        <FieldSelect
          name="read"
          label="Read status"
          value={pendingFilters.read || ""}
          onChange={(v) => setPendingFilters((p) => ({ ...p, read: v }))}
          options={READ_OPTIONS}
        />
      </Stack>
    ),
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Stack key={i} className={`animate-pulse border border-[var(--appkit-color-border)] ${__P.p4}`} gap="sm" rounded="xl">
                <Div className="h-4 w-1/3 bg-[var(--appkit-color-border)]" rounded="default" />
                <Div className="h-3 w-2/3 bg-[var(--appkit-color-border)]" rounded="default" />
              </Stack>
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">No notifications match the current filters.</Text>
          </Div>
        );
      }
      return (
        <Stack gap="sm">
          {rows.map((notif) => (
            <NotifCard
              key={notif.id}
              notif={notif}
              onMarkRead={(id) => markRead(id)}
              onDelete={(id) => deleteNotif(id)}
            />
          ))}
        </Stack>
      );
    },
  };

  return <DataListingView config={config} />;
}
