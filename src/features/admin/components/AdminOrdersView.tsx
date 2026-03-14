/**
 * AdminOrdersView
 *
 * Extracted from src/app/[locale]/admin/orders/[[...action]]/page.tsx
 * Order management with status filter tabs, DataTable, paginated Sieve query,
 * and URL-driven status update drawer.
 *
 * Uses ListingLayout for a unified listing shell.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUrlTable, useMessage, usePendingTable } from "@/hooks";
import { buildSieveFilters } from "@/helpers";
import { useAdminOrders } from "@/features/admin/hooks";
import {
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { flex } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  Caption,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  ListingLayout,
  OrderFilters,
  Search,
  StatusBadge,
  TablePagination,
  Text,
} from "@/components";
import { useOrderTableColumns, OrderStatusForm } from ".";
import type { OrderStatusFormState } from ".";
import type { OrderDocument } from "@/db/schema";
import { formatCurrency, formatDate } from "@/utils";

interface AdminOrdersViewProps {
  action?: string[];
}

export function AdminOrdersView({ action }: AdminOrdersViewProps) {
  const router = useRouter();
  const t = useTranslations("adminOrders");
  const { showSuccess, showError } = useMessage();

  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const statusFilter = table.get("status");
  const paymentStatusFilter = table.get("paymentStatus");
  const payoutStatusFilter = table.get("payoutStatus");
  const minAmount = table.get("minAmount");
  const maxAmount = table.get("maxAmount");
  const dateFrom = table.get("dateFrom");
  const dateTo = table.get("dateTo");

  // ── Pending filter state (values staged until Apply is clicked) ──────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "status",
      "paymentStatus",
      "payoutStatus",
      "minAmount",
      "maxAmount",
      "dateFrom",
      "dateTo",
    ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<OrderStatusFormState | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────
  const sieveParams = table.buildSieveParams(
    buildSieveFilters(
      ["status==", statusFilter],
      ["paymentStatus==", paymentStatusFilter],
      ["payoutStatus==", payoutStatusFilter],
      ["totalPrice>=", minAmount],
      ["totalPrice<=", maxAmount],
      ["createdAt>=", dateFrom],
      ["createdAt<=", dateTo],
    ),
  );

  const { data, isLoading, error, refetch, updateMutation } =
    useAdminOrders(sieveParams);

  const orders = data?.orders || [];

  const handleView = useCallback(
    (order: OrderDocument) => {
      setSelectedOrder(order);
      setFormState({
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber ?? "",
        notes: order.notes ?? "",
        cancellationReason: order.cancellationReason ?? "",
      });
      setIsDrawerOpen(true);
      if (order.id && action?.[0] !== "view") {
        router.push(`${ROUTES.ADMIN.ORDERS}/view/${order.id}`, {
          scroll: false,
        });
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
    setFormState(null);
    router.push(ROUTES.ADMIN.ORDERS, { scroll: false });
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!selectedOrder || !formState) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedOrder.id,
        data: formState,
      });
      showSuccess(SUCCESS_MESSAGES.ORDER.UPDATED);
      setIsDrawerOpen(false);
      setSelectedOrder(null);
      setFormState(null);
      router.push(ROUTES.ADMIN.ORDERS, { scroll: false });
      refetch();
    } catch {
      showError(ERROR_MESSAGES.ORDER.UPDATE_FAILED);
    }
  }, [
    selectedOrder,
    formState,
    updateMutation,
    showSuccess,
    showError,
    router,
    refetch,
  ]);

  // ── Status tabs rendered in statusTabsSlot ──────────────────────────
  const STATUS_TABS = useMemo(
    () => [
      { key: "", label: t("filterAll") },
      { key: "pending", label: t("filterPending") },
      { key: "confirmed", label: t("filterConfirmed") },
      { key: "shipped", label: t("filterShipped") },
      { key: "delivered", label: t("filterDelivered") },
      { key: "cancelled", label: t("filterCancelled") },
    ],
    [t],
  );

  const statusTabsSlot = (
    <div className="flex flex-wrap gap-2">
      {STATUS_TABS.map((tab) => (
        <Button
          key={tab.key}
          variant={statusFilter === tab.key ? "primary" : "outline"}
          size="sm"
          onClick={() => table.set("status", tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );

  const { columns } = useOrderTableColumns(handleView);

  return (
    <>
      <ListingLayout
        headerSlot={
          <AdminPageHeader
            title={t("title")}
            subtitle={`${t("subtitle")} — ${data?.meta.total ?? 0} total`}
          />
        }
        statusTabsSlot={statusTabsSlot}
        searchSlot={
          <Search
            value={table.get("q")}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={<OrderFilters table={pendingTable} variant="admin" />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        loading={isLoading}
        errorSlot={
          error ? (
            <Card>
              <div className="text-center py-8">
                <Text variant="error">{ERROR_MESSAGES.ORDER.FETCH_FAILED}</Text>
              </div>
            </Card>
          ) : undefined
        }
        paginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
      >
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          emptyMessage={t("noOrders")}
          keyExtractor={(order: OrderDocument) => order.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(order) => (
            <Card className="p-4 space-y-2">
              <div className={`${flex.between}`}>
                <Caption className="font-mono text-xs">
                  #{(order.id ?? "").slice(-8).toUpperCase()}
                </Caption>
                <StatusBadge status={order.status as any} />
              </div>
              <Text weight="medium" size="sm" className="truncate">
                {order.productTitle}
              </Text>
              <Caption>{order.userName}</Caption>
              <div className={`${flex.between} pt-1`}>
                <Caption>{formatDate(order.createdAt)}</Caption>
                <Text weight="bold" size="sm">
                  {formatCurrency(order.totalPrice)}
                </Text>
              </div>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Update order status drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={t("updateStatus")}
        side="right"
      >
        {selectedOrder && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <OrderStatusForm order={selectedOrder} onChange={setFormState} />
            </div>
            <DrawerFormFooter
              onCancel={handleCloseDrawer}
              onSubmit={handleSave}
              isLoading={updateMutation.isPending}
              submitLabel={t("updateOrder")}
            />
          </div>
        )}
      </SideDrawer>
    </>
  );
}
