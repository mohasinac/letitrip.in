"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  useSession,
  UserNotificationsView,
  Div,
  Text,
  Row,
  Stack,
  Button,
} from "@mohasinac/appkit/client";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string | Date;
}

interface NotifResponse {
  items: NotifItem[];
  total: number;
  unreadCount: number;
}

type FilterKey = "all" | "unread" | "orders" | "bids" | "system";

const ORDER_TYPES = new Set(["order_placed", "order_confirmed", "order_shipped", "order_delivered", "order_cancelled"]);
const BID_TYPES   = new Set(["bid_placed", "bid_outbid", "bid_won", "bid_lost"]);
const SYSTEM_TYPES = new Set(["system", "welcome", "promotion"]);

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
      className={`rounded-xl border px-5 py-4 space-y-2 transition-colors ${
        notif.isRead
          ? "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          : "border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/10"
      }`}
    >
      <Row justify="between" wrap gap="3" align="start">
        <Div className="space-y-0.5 min-w-0">
          <Row gap="sm" align="center">
            {!notif.isRead && (
              <span className="inline-block h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
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
          <button
            type="button"
            onClick={() => onMarkRead(notif.id)}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            Mark read
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notif.id)}
          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ml-auto"
        >
          Delete
        </button>
      </Row>
    </Div>
  );
}

export default function NotificationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isLoading } = useQuery<NotifResponse>({
    queryKey: ["user-notifications"],
    queryFn: () =>
      fetch("/api/user/notifications?pageSize=50")
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/user/notifications/${id}`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] }),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () =>
      fetch("/api/user/notifications/read-all", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] }),
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/user/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] }),
  });

  const filtered = useMemo(() => {
    const all = data?.items ?? [];
    switch (filter) {
      case "unread":  return all.filter((n) => !n.isRead);
      case "orders":  return all.filter((n) => ORDER_TYPES.has(n.type));
      case "bids":    return all.filter((n) => BID_TYPES.has(n.type));
      case "system":  return all.filter((n) => SYSTEM_TYPES.has(n.type));
      default:        return all;
    }
  }, [data, filter]);

  const loading = sessionLoading || isLoading;
  const unreadCount = data?.unreadCount ?? 0;

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all",    label: "All" },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "orders", label: "Orders" },
    { key: "bids",   label: "Bids" },
    { key: "system", label: "System" },
  ];

  return (
    <UserNotificationsView
      labels={{ title: "Notifications" }}
      renderToolbar={() => (
        <Row justify="between" wrap gap="3" align="center">
          <Row gap="sm" className="flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-primary text-white"
                    : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </Row>
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
      )}
      renderList={() => {
        if (loading) {
          return (
            <Stack gap="md">
              {Array.from({ length: 5 }).map((_, i) => (
                <Div key={i} className="animate-pulse rounded-xl border border-zinc-200 dark:border-slate-700 p-4 space-y-2">
                  <Div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-slate-700" />
                  <Div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-slate-700" />
                </Div>
              ))}
            </Stack>
          );
        }
        if (filtered.length === 0) {
          return (
            <Div className="py-24 text-center">
              <Text variant="secondary">
                {filter === "all" ? "You have no notifications." : `No ${filter} notifications.`}
              </Text>
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
