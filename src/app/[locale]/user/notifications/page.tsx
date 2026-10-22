"use client";
import { useEffect, Suspense, type ReactNode } from "react";
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
  setUserNotificationRead,
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
  relatedType?: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string | Date;
  priority?: number;
}

/**
 * The label for a notification's link, when the stored row has none.
 *
 * `sendNotification` resolves `actionUrl` centrally (see appkit's
 * `resolveNotificationActionUrl`) but never writes an `actionLabel` — measured
 * on live data 2026-10-21: **38 of 48 notifications carry a URL and only 2
 * carry a label**, both hand-written at their call site. This card used to
 * require BOTH, so 36 perfectly good destinations rendered as dead text while
 * the bell dropdown — which falls back to a generic label — showed every one of
 * them as clickable. The gate is now `actionUrl` alone, with the label derived
 * here.
 *
 * Derived at RENDER, deliberately not persisted by the writer: a label is
 * presentation, and storing one would freeze today's wording into every old row
 * (Root Cause #104 — never persist a render-time transform).
 *
 * Keyed on `relatedType`, because that is what decides the destination. A
 * caller-supplied `actionLabel` always wins — `bid_won` points at
 * `/checkout?lane=auction` and says "Pay now", which no generic rule would
 * guess.
 */
const ACTION_LABEL_BY_RELATED_TYPE: Record<string, string> = {
  order: "View order",
  product: "View listing",
  bid: "View your bids",
  offer: "View offer",
  review: "View review",
  blog: "Read article",
  user: "View profile",
  support_ticket: "View ticket",
  scammer: "View report",
  catalogueItem: "View item",
  payout: "View payout",
  store: "View store",
  event: "View event",
  conversation: "Open conversation",
};

function actionLabelFor(notif: NotifItem): string {
  return (
    notif.actionLabel ??
    (notif.relatedType ? ACTION_LABEL_BY_RELATED_TYPE[notif.relatedType] : undefined) ??
    "View details"
  );
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
  bids: new Set(["bid_placed", "bid_outbid", "bid_won", "bid_lost", "auction_ended"]),
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

/**
 * Render `children` as a link when there is a destination, and as plain
 * content when there is not — so a `promotion` or a `welcome`, which point at
 * no record, stays honestly unclickable instead of linking to the page the
 * reader is already on.
 */
function MaybeLink({
  href,
  onClick,
  className,
  children,
}: {
  href?: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  if (!href) return <>{children}</>;
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

function NotifCard({
  notif,
  onSetRead,
  onDelete,
}: {
  notif: NotifItem;
  onSetRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
}) {
  /*
   * Opening a notification marks it read, the way the bell dropdown already
   * does. Fire-and-forget on purpose: navigation must not wait on — or be
   * cancelled by — a failed write, and the row is being left behind anyway.
   */
  const onOpen = () => {
    if (!notif.isRead) onSetRead(notif.id, true);
  };

  return (
    <Stack
      className={`border transition-colors ${notif.isRead ? "border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]" : "border-[var(--appkit-color-primary)] bg-[var(--appkit-color-surface)]"}`} gap="sm" rounded="xl" shadow="sm" paddingX="x-5" paddingY="y-md"
    >
      <Row justify="between" wrap gap="3" align="start">
        {/*
         * The text block IS the navigation target when there is somewhere to
         * go — a notification you can only read is a dead end, and a small
         * link in the footer row is not the affordance anyone reaches for.
         * The action buttons stay OUTSIDE this anchor: nesting a <button>
         * inside an <a> is invalid markup and breaks keyboard activation for
         * both.
         */}
        <Stack gap="none" className="min-w-0">
          <Row gap="sm" align="center">
            {!notif.isRead && (
              <Span className="inline-block h-2 w-2 bg-primary shrink-0" rounded="full" />
            )}
            <MaybeLink href={notif.actionUrl} onClick={onOpen} className="block min-w-0 hover:underline">
              <Text className="text-[var(--appkit-color-text)] line-clamp-1" size="sm" weight="semibold">
                {notif.title}
              </Text>
            </MaybeLink>
          </Row>
          <MaybeLink href={notif.actionUrl} onClick={onOpen} className="block min-w-0 hover:underline">
            <Text variant="secondary" className="line-clamp-2" size="sm">{notif.message}</Text>
          </MaybeLink>
        </Stack>
        <Text variant="secondary" className="shrink-0 mt-0.5" size="xs">
          {timeAgo(notif.createdAt)}
        </Text>
      </Row>
      <Row gap="3" padding="t-2xs">
        {notif.actionUrl && (
          <Link
            href={notif.actionUrl}
            onClick={onOpen}
            className="text-[length:var(--appkit-text-xs)] font-medium text-primary hover:underline"
          >
            {actionLabelFor(notif)}
          </Link>
        )}
        {/*
          🛑 Two-way. This rendered only when `!notif.isRead`, and the route
          behind it hard-coded `markAsRead` with no body — so opening a
          notification by accident removed it from the unread list for good,
          with the "Unread" filter above now unable to find it.
        */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetRead(notif.id, !notif.isRead)}
          className="text-[length:var(--appkit-text-xs)]"
        >
          {notif.isRead ? "Mark unread" : "Mark read"}
        </Button>
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

function NotificationsPageInner() {
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

  const { mutate: setRead } = useApiMutation({
    errorMessage: "Could not change that notification.",
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      setUserNotificationRead(API_ROUTES.USER.NOTIFICATION_BY_ID(id), isRead),
    onSuccess: invalidateNotifications,
  });

  const { mutate: markAllRead, isPending: markingAll } = useApiMutation({
    errorMessage: "Could not mark notifications as read.",
    mutationFn: () => markAllUserNotificationsRead(API_ROUTES.USER.NOTIFICATIONS_READ_ALL),
    onSuccess: () => {
      invalidateNotifications();
      showToast("All notifications marked as read.", "success");
    },
  });

  const { mutate: deleteNotif } = useApiMutation({
    errorMessage: "Could not delete notification.",
    mutationFn: (id: string) => deleteUserNotification(API_ROUTES.USER.NOTIFICATION_BY_ID(id)),
    onSuccess: () => {
      invalidateNotifications();
      showToast("Notification deleted.", "info");
    },
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
              onSetRead={(id, isRead) => setRead({ id, isRead })}
              onDelete={(id) => deleteNotif(id)}
            />
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
export default function NotificationsPage() {
  return (
    <Suspense>
      <NotificationsPageInner />
    </Suspense>
  );
}
