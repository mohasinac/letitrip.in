"use client";

import { useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage, useUrlTable } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  getOrderTableColumns,
  OrderStatusForm,
  TablePagination,
} from "@/components";
import type { OrderStatusFormState } from "@/components";
import type { OrderDocument } from "@/db/schema";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminOrdersPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const t = useTranslations("adminOrders");
  const { showSuccess, showError } = useMessage();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const statusFilter = table.get("status");

  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<OrderStatusFormState | null>(null);

  const filtersParam = statusFilter ? `status==${statusFilter}` : undefined;

  const { data, isLoading, error, refetch } = useApiQuery<{
    orders: OrderDocument[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["admin", "orders", table.params.toString()],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS}${table.buildSieveParams(filtersParam ?? "")}`,
      ),
  });

  const updateMutation = useApiMutation<
    any,
    { id: string; data: OrderStatusFormState }
  >({
    mutationFn: ({ id, data: update }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.ORDER_BY_ID(id), update),
  });

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
      await updateMutation.mutate({ id: selectedOrder.id, data: formState });
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

  const STATUS_TABS = [
    { key: "", label: t("filterAll") },
    { key: "pending", label: t("filterPending") },
    { key: "confirmed", label: t("filterConfirmed") },
    { key: "shipped", label: t("filterShipped") },
    { key: "delivered", label: t("filterDelivered") },
    { key: "cancelled", label: t("filterCancelled") },
  ];

  const { columns } = getOrderTableColumns(handleView);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${data?.meta.total ?? 0} total`}
      />

      {/* Status filter tabs */}
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

      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          emptyMessage={
            error ? ERROR_MESSAGES.ORDER.FETCH_FAILED : "No orders found"
          }
          keyExtractor={(order: OrderDocument) => order.id}
          externalPagination
        />
        <TablePagination
          currentPage={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          pageSize={table.getNumber("pageSize", 25)}
          total={data?.meta?.total ?? 0}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Card>

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
              isLoading={updateMutation.isLoading}
              submitLabel={t("updateOrder")}
            />
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
