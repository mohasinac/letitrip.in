"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useMessage, useUrlTable } from "@/hooks";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useUserNotifications } from "../hooks/useUserNotifications";
import {
  ActiveFilterChips,
  EmptyState,
  FilterFacetSection,
  Search,
  Spinner,
  TablePagination,
} from "@/components";
import { UserNotificationsView as AppkitUserNotificationsView } from "@mohasinac/appkit/features/account";
import type { ActiveFilter } from "@/components";
import { getFilterLabel } from "@/components";
import { NotificationItem } from "./NotificationItem";
import { NotificationsBulkActions } from "./NotificationsBulkActions";
import { ROUTES, ERROR_MESSAGES } from "@/constants";

const PAGE_SIZE = 20;

function UserNotificationsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const tNotifications = useTranslations("notifications");
  const table = useUrlTable({ defaults: { pageSize: String(PAGE_SIZE) } });
  const searchQ = table.get("q");
  const isReadFilter = table.get("isRead");
  const page = table.getNumber("page", 1);

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
              label: tNotifications("readStatus"),
              value:
                getFilterLabel(readStatusOptions, isReadFilter) ?? isReadFilter,
            },
          ]
        : [],
    [isReadFilter, tNotifications, readStatusOptions],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const queryParams = new URLSearchParams(
    Object.fromEntries(
      [
        ["page", String(page)],
        ["pageSize", String(PAGE_SIZE)],
        searchQ && ["q", searchQ],
        isReadFilter && ["isRead", isReadFilter],
      ].filter(Boolean) as [string, string][],
    ),
  ).toString();

  const {
    data,
    isLoading,
    refetch,
    markRead,
    deleteOne,
    markAllRead,
    isMarkingAll,
  } = useUserNotifications(queryParams, !authLoading && !!user);

  const notifications = data?.notifications ?? [];
  const total = data?.meta?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <AppkitUserNotificationsView
      isEmpty={!isLoading && !notifications.length && !activeFilters.length}
      renderToolbar={() => (
        <Search
          value={searchQ}
          onChange={(v) => table.set("q", v)}
          placeholder={tNotifications("searchPlaceholder")}
        />
      )}
      renderFilters={() => (
        <FilterFacetSection
          title={tNotifications("readStatus")}
          options={readStatusOptions}
          selected={
            pendingTable.get("isRead") ? [pendingTable.get("isRead")] : []
          }
          onChange={(vals: string[]) =>
            pendingTable.set("isRead", vals[0] ?? "")
          }
        />
      )}
      renderActiveFilters={() =>
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(k) => table.set(k, "")}
            onClearAll={() => table.set("isRead", "")}
          />
        ) : null
      }
      renderBulkActions={() => (
        <NotificationsBulkActions
          onMarkAllRead={() => markAllRead()}
          unreadCount={unreadCount}
          isMarkingAll={isMarkingAll}
        />
      )}
      renderList={() =>
        isLoading ? (
          <Spinner />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-slate-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-slate-700">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={() => markRead(n.id)}
                onDelete={() => deleteOne(n.id)}
              />
            ))}
          </div>
        )
      }
      renderEmpty={() => (
        <EmptyState
          title={tNotifications("noNotifications")}
          description={tNotifications("noNotificationsDesc")}
        />
      )}
      renderPagination={() => (
        <TablePagination
          total={total}
          currentPage={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => table.setPage(p)}
        />
      )}
    />
  );
}

export function UserNotificationsView() {
  return (
    <Suspense>
      <UserNotificationsContent />
    </Suspense>
  );
}
