/**
 * UserNotificationsView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/user/notifications/page.tsx (was 156 lines).
 * Displays and manages notifications for the authenticated user.
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import {
  useAuth,
  useApiQuery,
  useApiMutation,
  useMessage,
  useUrlTable,
  usePendingTable,
} from "@/hooks";
import { useTranslations } from "next-intl";
import { notificationService } from "@/services";
import {
  markNotificationReadAction,
  deleteNotificationAction,
  markAllNotificationsReadAction,
} from "@/actions";
import {
  ActiveFilterChips,
  EmptyState,
  FilterFacetSection,
  Heading,
  ListingLayout,
  Search,
  Spinner,
  TablePagination,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { getFilterLabel } from "@/components";
import { NotificationItem } from "./NotificationItem";
import { NotificationsBulkActions } from "./NotificationsBulkActions";
import type { NotificationDocument } from "@/db/schema";

const { themed, flex } = THEME_CONSTANTS;

const PAGE_SIZE = 20;

interface NotificationsResponse {
  notifications: NotificationDocument[];
  unreadCount: number;
  meta?: { total: number; totalPages: number; page: number };
}

const bellIcon = (
  <svg
    className="w-12 h-12 text-zinc-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

export function UserNotificationsView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const tNotifications = useTranslations("notifications");

  const table = useUrlTable({ defaults: { pageSize: String(PAGE_SIZE) } });
  const searchQ = table.get("q");
  const isReadFilter = table.get("isRead");
  const page = table.getNumber("page", 1);

  // ── Staged filter state (via usePendingTable) ──────────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["isRead"]);

  const readStatusOptions = useMemo(
    () => [
      { value: "false", label: tNotifications("filterUnread") },
      { value: "true", label: tNotifications("filterRead") },
    ],
    [tNotifications],
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () =>
      isReadFilter
        ? [
            {
              key: "isRead",
              label: tNotifications("filterLabel"),
              value:
                getFilterLabel(readStatusOptions, isReadFilter) ?? isReadFilter,
            },
          ]
        : [],
    [isReadFilter, readStatusOptions, tNotifications],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (searchQ) p.set("q", searchQ);
    if (isReadFilter) p.set("isRead", isReadFilter);
    return p.toString();
  }, [page, searchQ, isReadFilter]);

  const { data, isLoading, refetch } = useApiQuery<NotificationsResponse>({
    queryKey: ["notifications", "page", queryParams],
    queryFn: () => notificationService.list(queryParams),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: markRead } = useApiMutation<unknown, string>({
    mutationFn: (id: string) => markNotificationReadAction(id),
  });

  const { mutate: deleteOne } = useApiMutation<unknown, string>({
    mutationFn: (id: string) => deleteNotificationAction(id),
  });

  const { mutate: markAllRead, isLoading: isMarkingAll } = useApiMutation<
    unknown,
    void
  >({
    mutationFn: () => markAllNotificationsReadAction(),
  });

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markRead(id);
        refetch();
        showSuccess(tNotifications("markRead"));
      } catch {
        showError(tNotifications("error"));
      }
    },
    [markRead, refetch, showError, tNotifications],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteOne(id);
        refetch();
        showSuccess(tNotifications("deleted"));
      } catch {
        showError(tNotifications("error"));
      }
    },
    [deleteOne, refetch, showSuccess, showError, tNotifications],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      refetch();
      showSuccess(tNotifications("markAllRead"));
    } catch {
      showError(tNotifications("error"));
    }
  }, [markAllRead, refetch, showSuccess, showError, tNotifications]);

  if (authLoading || !user) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" />
      </div>
    );
  }

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? notifications.length;

  return (
    <ListingLayout
      headerSlot={
        <div>
          <Heading level={3}>{tNotifications("title")}</Heading>
          <Text variant="secondary" className="mt-1">
            {unreadCount > 0
              ? tNotifications("unreadCount", { count: unreadCount })
              : tNotifications("subtitle")}
          </Text>
        </div>
      }
      searchSlot={
        <Search
          value={searchQ}
          onChange={(v) => table.set("q", v)}
          placeholder={tNotifications("searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      }
      filterContent={
        <FilterFacetSection
          title={tNotifications("filterLabel")}
          options={readStatusOptions}
          selected={
            pendingTable.get("isRead") ? [pendingTable.get("isRead")] : []
          }
          onChange={(vals) => pendingTable.set("isRead", vals[0] ?? "")}
          selectionMode="single"
          searchable={false}
        />
      }
      filterActiveCount={filterActiveCount}
      onFilterApply={onFilterApply}
      onFilterClear={onFilterClear}
      activeFiltersSlot={
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(key) => table.set(key, "")}
            onClearAll={onFilterClear}
          />
        ) : undefined
      }
      actionsSlot={
        <NotificationsBulkActions
          unreadCount={unreadCount}
          isMarkingAll={isMarkingAll}
          onMarkAllRead={handleMarkAllRead}
        />
      }
      paginationSlot={
        totalPages > 1 ? (
          <TablePagination
            total={total}
            currentPage={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={table.setPage}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
            pageSizeOptions={[10, 20, 50]}
          />
        ) : undefined
      }
      loading={isLoading}
    >
      {!isLoading && notifications.length === 0 ? (
        <EmptyState
          icon={bellIcon}
          title={tNotifications("empty")}
          description={tNotifications("emptyDesc")}
        />
      ) : (
        <div
          className={`rounded-xl border ${themed.border} overflow-hidden divide-y ${themed.border}`}
        >
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-16 bg-zinc-100 dark:bg-slate-800"
                />
              ))
            : notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
        </div>
      )}
    </ListingLayout>
  );
}
