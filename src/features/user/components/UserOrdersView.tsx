"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/SessionContext";
import { useMessage } from "@mohasinac/appkit/react";
import { useUrlTable } from "@/hooks/useUrlTable";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useUserOrders } from "../hooks";
import { UserOrdersView as AppkitUserOrdersView } from "@mohasinac/appkit/features/account";
import {
  EmptyState,
  OrderCard,
  Search,
} from "@/components";
import { OrderFilters } from "@mohasinac/appkit/features/orders";
import {
  TablePagination,
  Span,
  Button,
  ListingLayout,
  SortDropdown,
  Spinner,
  StatusBadge,
  ActiveFilterChips,
  SectionTabs,
  DataTable,
} from "@mohasinac/appkit/ui";
import type { ActiveFilter } from "@mohasinac/appkit/ui";
import { ROUTES } from "@/constants";
import { cancelOrderAction } from "@/actions";
import type { OrderDocument } from "@/db/schema";

const STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

const FILTER_KEYS = [
  "status",
  "paymentStatus",
  "minAmount",
  "maxAmount",
  "dateFrom",
  "dateTo",
];

function UserOrdersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const table = useUrlTable({ defaults: { pageSize: "10" } });
  const tOrders = useTranslations("orders");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const statusFilter = table.get("status");
  const paymentStatusFilter = table.get("paymentStatus");
  const minAmount = table.get("minAmount");
  const maxAmount = table.get("maxAmount");
  const dateFrom = table.get("dateFrom");
  const dateTo = table.get("dateTo");
  const searchQ = table.get("q");
  const sortValue = table.get("sorts") || "-orderDate";
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 10);

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, FILTER_KEYS);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (searchQ) params.set("q", searchQ);
    params.set("sorts", sortValue);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [
    statusFilter,
    paymentStatusFilter,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    searchQ,
    sortValue,
    page,
    pageSize,
  ]);

  const { orders, total, totalPages, isLoading, error, refetch } =
    useUserOrders(queryString);

  const ORDER_SORT_OPTIONS = [
    { value: "-orderDate", label: tOrders("sortNewest") },
    { value: "orderDate", label: tOrders("sortOldest") },
    { value: "-totalPrice", label: tOrders("sortHighest") },
    { value: "totalPrice", label: tOrders("sortLowest") },
  ];

  const STATUS_TABS = [
    { value: "", label: tOrders("allOrders") },
    { value: "pending", label: tOrders("statusPending") },
    { value: "confirmed", label: tOrders("statusConfirmed") },
    { value: "shipped", label: tOrders("statusShipped") },
    { value: "delivered", label: tOrders("statusDelivered") },
    { value: "cancelled", label: tOrders("statusCancelled") },
  ];

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (paymentStatusFilter)
      filters.push({
        key: "paymentStatus",
        label: tOrders("paymentStatus"),
        value: paymentStatusFilter,
      });
    if (minAmount)
      filters.push({
        key: "minAmount",
        label: tOrders("minAmount"),
        value: minAmount,
      });
    if (maxAmount)
      filters.push({
        key: "maxAmount",
        label: tOrders("maxAmount"),
        value: maxAmount,
      });
    if (dateFrom)
      filters.push({
        key: "dateFrom",
        label: tOrders("dateFrom"),
        value: dateFrom,
      });
    if (dateTo)
      filters.push({ key: "dateTo", label: tOrders("dateTo"), value: dateTo });
    return filters;
  }, [paymentStatusFilter, minAmount, maxAmount, dateFrom, dateTo, tOrders]);

  const handleBulkCancel = useCallback(async () => {
    for (const id of selectedIds) {
      try {
        await cancelOrderAction(id);
      } catch {}
    }
    showSuccess(tOrders("bulkCancelSuccess"));
    setSelectedIds([]);
    refetch();
  }, [selectedIds, showSuccess, tOrders, refetch]);

  return (
    <AppkitUserOrdersView
      renderToolbar={() => (
        <Search
          value={searchQ}
          onChange={(v) => table.set("q", v)}
          placeholder={tOrders("searchPlaceholder")}
        />
      )}
      renderTabs={() => (
        <SectionTabs
          tabs={STATUS_TABS.map((t) => ({ label: t.label, value: t.value }))}
          value={statusFilter || ""}
          onChange={(v) => table.setMany({ status: v, page: "1" })}
        />
      )}
      renderActiveFilters={() =>
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(k) => table.set(k, "")}
            onClearAll={() =>
              table.setMany(Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])))
            }
          />
        ) : null
      }
      renderTable={() =>
        isLoading ? (
          <Spinner />
        ) : !orders?.length ? (
          <EmptyState
            title={tOrders("noOrders")}
            description={tOrders("noOrdersDescription")}
            actionLabel={tActions("shopNow")}
            onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
          />
        ) : (
          <DataTable<OrderDocument>
            columns={[
              {
                key: "id",
                header: tOrders("orderId"),
                render: (o: OrderDocument) => (
                  <Span>#{o.id.slice(-8).toUpperCase()}</Span>
                ),
              },
              {
                key: "status",
                header: tOrders("status"),
                render: (o: OrderDocument) => (
                  <StatusBadge status={STATUS_MAP[o.status] ?? "pending"} />
                ),
              },
              { key: "totalPrice", header: tOrders("total") },
              { key: "orderDate", header: tOrders("date") },
            ]}
            data={orders}
            loading={isLoading}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            mobileCardRender={(o: OrderDocument) => <OrderCard order={o} />}
          />
        )
      }
      renderPagination={() => (
        <TablePagination
          total={total}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(p) => table.setPage(p)}
          onPageSizeChange={(s) =>
            table.setMany({ pageSize: String(s), page: "1" })
          }
        />
      )}
    />
  );
}

export function UserOrdersView() {
  return (
    <Suspense>
      <UserOrdersContent />
    </Suspense>
  );
}

