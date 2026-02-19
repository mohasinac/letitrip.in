"use client";

import { useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  UI_LABELS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  getOrderTableColumns,
  OrderStatusForm,
} from "@/components";
import type { OrderStatusFormState } from "@/components";
import type { OrderDocument } from "@/db/schema";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.ORDERS;

// Status filter tabs
const STATUS_TABS = [
  { key: "", label: LABELS.FILTER_ALL },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  const [statusFilter, setStatusFilter] = useState("");
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
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS}?pageSize=200${
          filtersParam ? `&filters=${encodeURIComponent(filtersParam)}` : ""
        }`,
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

  const { columns } = getOrderTableColumns(handleView);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={LABELS.TITLE}
        subtitle={`${LABELS.SUBTITLE} — ${data?.meta.total ?? 0} total`}
      />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.key)}
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
        />
      </Card>

      {/* Update order status drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={LABELS.UPDATE_STATUS}
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
              submitLabel={LABELS.UPDATE_ORDER}
            />
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
