/**
 * UserOrdersView
 *
 * Extracted from src/app/[locale]/user/orders/page.tsx
 * Lists the current user's orders with status filter tabs, search, sort,
 * filter drawer, URL-driven selection, and bulk cancel.
 * Uses the unified ListingLayout shell.
 */

"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useMessage, usePendingTable, useUrlTable } from "@/hooks";
import { useUserOrders } from "../hooks";
import {
  ActiveFilterChips,
  Button,
  DataTable,
  EmptyState,
  Heading,
  ListingLayout,
  OrderCard,
  OrderFilters,
  Search,
  SortDropdown,
  Spinner,
  StatusBadge,
  TablePagination,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
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

const ORDER_SORT_OPTIONS_KEYS = [
  { value: "-orderDate", key: "sortNewest" },
  { value: "orderDate", key: "sortOldest" },
  { value: "-totalPrice", key: "sortHighest" },
  { value: "totalPrice", key: "sortLowest" },
] as const;

const FILTER_KEYS: string[] = [
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
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 10);
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-orderDate";

  // ── Staged filter state via usePendingTable ──────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, FILTER_KEYS);

  const STATUS_TABS = [
    { key: "", label: tOrders("tabAll") },
    { key: "pending", label: tOrders("tabPending") },
    { key: "confirmed", label: tOrders("tabConfirmed") },
    { key: "shipped", label: tOrders("tabShipped") },
    { key: "delivered", label: tOrders("tabDelivered") },
    { key: "cancelled", label: tOrders("tabCancelled") },
  ];

  const ordersParams = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (paymentStatusFilter) p.set("paymentStatus", paymentStatusFilter);
    if (minAmount) p.set("minAmount", minAmount);
    if (maxAmount) p.set("maxAmount", maxAmount);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    if (search) p.set("q", search);
    if (sortParam) p.set("sorts", sortParam);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [
    statusFilter,
    paymentStatusFilter,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    search,
    sortParam,
    page,
    pageSize,
  ]);

  const {
    orders,
    totalPages,
    total: totalOrders,
    isLoading,
  } = useUserOrders(ordersParams);

  const sortOptions = useMemo(
    () =>
      ORDER_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: tOrders(o.key),
      })),
    [tOrders],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const chips: ActiveFilter[] = [];
    if (statusFilter) {
      chips.push({
        key: "status",
        label: tOrders("tabAll"),
        value:
          STATUS_TABS.find((t) => t.key === statusFilter)?.label ??
          statusFilter,
      });
    }
    if (paymentStatusFilter) {
      chips.push({
        key: "paymentStatus",
        label: tOrders("paymentStatus"),
        value: paymentStatusFilter,
      });
    }
    if (minAmount || maxAmount) {
      chips.push({
        key: "amount",
        label: tOrders("total"),
        value: [minAmount && `₹${minAmount}`, maxAmount && `₹${maxAmount}`]
          .filter(Boolean)
          .join(" – "),
      });
    }
    if (dateFrom || dateTo) {
      chips.push({
        key: "date",
        label: tOrders("orderDate"),
        value: [dateFrom, dateTo].filter(Boolean).join(" – "),
      });
    }
    return chips;
  }, [
    statusFilter,
    paymentStatusFilter,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    tOrders,
  ]);

  // ── Bulk cancel handler ──────────────────────────────────────────────
  const handleBulkCancel = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => cancelOrderAction(id, "Cancelled by user")),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  // Only show bulk cancel when at least one selected order is cancellable
  const cancellableSelected = useMemo(
    () =>
      orders.filter(
        (o) =>
          selectedIds.includes(o.id ?? "") &&
          (o.status === "pending" || o.status === "confirmed"),
      ),
    [orders, selectedIds],
  );

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  return (
    <ListingLayout
      headerSlot={
        <div>
          <Heading level={3}>{tOrders("title")}</Heading>
          <Text variant="secondary" className="mt-1">
            {totalOrders > 0
              ? tOrders("subtitleWithCount", { count: totalOrders })
              : tOrders("empty")}
          </Text>
        </div>
      }
      statusTabsSlot={
        <Tabs
          variant="line"
          value={statusFilter}
          onChange={(v) => table.set("status", v)}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      searchSlot={
        <Search
          value={search}
          onChange={(v) => table.set("q", v)}
          placeholder={tOrders("searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      }
      filterContent={<OrderFilters table={pendingTable} variant="user" />}
      filterActiveCount={filterActiveCount}
      onFilterApply={onFilterApply}
      onFilterClear={onFilterClear}
      sortSlot={
        <SortDropdown
          value={sortParam}
          onChange={(v) => table.set("sorts", v)}
          options={sortOptions}
        />
      }
      paginationSlot={
        totalPages > 1 ? (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={totalOrders}
            onPageChange={table.setPage}
            isLoading={isLoading}
          />
        ) : undefined
      }
      activeFiltersSlot={
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(key) => {
              if (key === "amount") {
                table.setMany({ minAmount: "", maxAmount: "" });
              } else if (key === "date") {
                table.setMany({ dateFrom: "", dateTo: "" });
              } else {
                table.set(key, "");
              }
            }}
            onClearAll={onFilterClear}
          />
        ) : undefined
      }
      selectedCount={selectedIds.length}
      onClearSelection={() => setSelectedIds([])}
      bulkActions={
        cancellableSelected.length > 0 ? (
          <Button variant="danger" size="sm" onClick={handleBulkCancel}>
            {tActions("bulkCancel", { count: cancellableSelected.length })}
          </Button>
        ) : undefined
      }
      loading={isLoading}
    >
      <DataTable
        data={orders}
        keyExtractor={(o: OrderDocument) => o.id ?? ""}
        loading={isLoading}
        columns={[
          { key: "productTitle", header: tOrders("colProduct") },
          {
            key: "id",
            header: tOrders("orderNumber"),
            render: (o) => (
              <Text size="sm" className="font-mono">
                #{(o.id ?? "").slice(0, 8).toUpperCase()}
              </Text>
            ),
          },
          {
            key: "status",
            header: tOrders("tabAll"),
            render: (o) => (
              <StatusBadge
                status={STATUS_MAP[o.status] ?? "pending"}
                label={o.status.charAt(0).toUpperCase() + o.status.slice(1)}
              />
            ),
          },
          {
            key: "totalPrice",
            header: tOrders("sortHighest"),
            render: (o) => (
              <Text weight="semibold">
                {formatCurrency(o.totalPrice, o.currency)}
              </Text>
            ),
          },
        ]}
        defaultViewMode="list"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<ShoppingBag className="w-16 h-16" />}
            title={tOrders("noOrders")}
            description={tOrders("emptySubtitle")}
            actionLabel={tActions("browseProducts")}
            onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
          />
        }
        mobileCardRender={(order) => (
          <OrderCard
            order={order}
            selectable
            isSelected={selectedIds.includes(order.id ?? "")}
            onSelect={(id, checked) =>
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((x) => x !== id),
              )
            }
          />
        )}
      />
    </ListingLayout>
  );
}

export function UserOrdersView() {
  return (
    <Suspense>
      <UserOrdersContent />
    </Suspense>
  );
}
