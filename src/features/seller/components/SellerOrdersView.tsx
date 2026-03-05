/**
 * SellerOrdersView
 *
 * Feature view for seller orders/sales listing.
 * Supports:
 *   - Status-tab filtering + pagination (URL state)
 *   - Per-row "Ship" action for confirmed/processing orders (custom shipping)
 *   - Row checkboxes + bulk "Request Payout" for eligible delivered orders
 */

"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Alert,
  Badge,
  Button,
  Caption,
  Card,
  DataTable,
  AdminPageHeader,
  FormField,
  ListingLayout,
  Modal,
  Spinner,
  StatusBadge,
  TablePagination,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components";
import { useAuth, useUrlTable, useMessage, useApiMutation } from "@/hooks";
import {
  useSellerOrders,
  useSellerShipping,
  useSellerPayoutSettings,
} from "@/features/seller";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { sellerService } from "@/services";
import type { OrderDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

// ─── Ship-Order modal (custom shipping) ──────────────────────────────────────

interface ShipOrderModalProps {
  order: OrderDocument | null;
  onClose: () => void;
  onShipped: () => void;
}

function ShipOrderModal({ order, onClose, onShipped }: ShipOrderModalProps) {
  const t = useTranslations("sellerOrders");
  const { showError } = useMessage();
  const [form, setForm] = useState({
    shippingCarrier: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  const { mutate: shipOrder, isLoading } = useApiMutation({
    mutationFn: (data: typeof form & { method: "custom" }) =>
      sellerService.shipOrder(order!.id!, data),
    onSuccess: () => { onShipped(); onClose(); },
    onError: (err: { message?: string }) =>
      showError(err?.message ?? t("shipError")),
  });

  const handleSubmit = () => {
    if (!form.shippingCarrier.trim() || !form.trackingNumber.trim() || !form.trackingUrl.trim()) {
      showError(t("shipFormRequired"));
      return;
    }
    shipOrder({ method: "custom", ...form });
  };

  if (!order) return null;

  return (
    <Modal isOpen={!!order} onClose={onClose} title={t("shipModalTitle")} size="md">
      <div className={spacing.stack}>
        <FormField
          type="text"
          name="shippingCarrier"
          label={t("shipCarrierLabel")}
          value={form.shippingCarrier}
          onChange={(v) => setForm((f) => ({ ...f, shippingCarrier: v }))}
          placeholder={t("shipCarrierPlaceholder")}
        />
        <FormField
          type="text"
          name="trackingNumber"
          label={t("shipTrackingNumberLabel")}
          value={form.trackingNumber}
          onChange={(v) => setForm((f) => ({ ...f, trackingNumber: v }))}
          placeholder={t("shipTrackingNumberPlaceholder")}
        />
        <FormField
          type="text"
          name="trackingUrl"
          label={t("shipTrackingUrlLabel")}
          value={form.trackingUrl}
          onChange={(v) => setForm((f) => ({ ...f, trackingUrl: v }))}
          placeholder="https://courier.com/track/AWB123"
        />
        <div className={`${flex.end} gap-2 pt-1`}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button variant="primary" isLoading={isLoading} onClick={handleSubmit}>
            {t("markShipped")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Bulk action bar ──────────────────────────────────────────────────────────

interface BulkActionBarProps {
  selectedCount: number;
  eligibleCount: number;
  isPayoutConfigured: boolean;
  onRequestPayout: () => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

function BulkActionBar({
  selectedCount,
  eligibleCount,
  isPayoutConfigured,
  onRequestPayout,
  onClearSelection,
  isLoading,
}: BulkActionBarProps) {
  const t = useTranslations("sellerOrders");
  if (selectedCount === 0) return null;

  return (
    <Card className="p-3 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
      <div className={`${flex.between} gap-3 flex-wrap`}>
        <div className={`${flex.rowCenter} gap-2`}>
          <Badge variant="secondary">{t("bulkSelected", { count: selectedCount })}</Badge>
          {eligibleCount < selectedCount && (
            <Text size="sm" variant="secondary">
              {t("bulkEligible", { count: eligibleCount })}
            </Text>
          )}
        </div>
        <div className={`${flex.rowCenter} gap-2`}>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            {t("bulkClear")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={eligibleCount === 0 || !isPayoutConfigured}
            isLoading={isLoading}
            onClick={onRequestPayout}
          >
            {t("bulkRequestPayout", { count: eligibleCount })}
          </Button>
        </div>
      </div>
      {!isPayoutConfigured && (
        <Alert variant="warning" className="mt-2">
          {t("payoutNotConfiguredWarning")}
        </Alert>
      )}
    </Card>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

function SellerOrdersContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerOrders");
  const { showSuccess, showError } = useMessage();
  const { shippingConfig } = useSellerShipping();
  const { isConfigured: isPayoutConfigured } = useSellerPayoutSettings();

  const STATUS_TABS = [
    { key: "", label: t("tabAll") },
    { key: "pending", label: t("tabPending") },
    { key: "confirmed", label: t("tabConfirmed") },
    { key: "shipped", label: t("tabShipped") },
    { key: "delivered", label: t("tabDelivered") },
    { key: "cancelled", label: t("tabCancelled") },
  ];

  const table = useUrlTable({ defaults: { pageSize: "25" } });
  const statusFilter = table.get("status");
  const page = table.getNumber("page", 1);
  const PAGE_SIZE = 25;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shipModalOrder, setShipModalOrder] = useState<OrderDocument | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const orderParams = useMemo(() => {
    const p = new URLSearchParams({
      sorts: "-orderDate",
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (statusFilter) p.set("filters", `status==${statusFilter}`);
    return p.toString();
  }, [page, statusFilter]);

  const { orders, meta, isLoading, refetch } = useSellerOrders(orderParams);

  // Eligible = selected + delivered + custom shipped + payoutStatus=eligible or unset
  const eligibleForPayout = useMemo(
    () =>
      orders.filter(
        (o) =>
          selectedIds.includes(o.id!) &&
          o.status === "delivered" &&
          o.shippingMethod === "custom" &&
          o.payoutStatus !== "requested" &&
          o.payoutStatus !== "paid",
      ),
    [orders, selectedIds],
  );

  const { mutate: requestBulkPayout, isLoading: isBulkLoading } = useApiMutation({
    mutationFn: (orderIds: string[]) =>
      sellerService.bulkOrderAction({ action: "request_payout", orderIds }),
    onSuccess: (res) => {
      const data = res as { requested: string[]; skipped: string[] };
      showSuccess(t("payoutRequested", { count: data.requested?.length ?? 0 }));
      setSelectedIds([]);
      refetch();
    },
    onError: (err: { message?: string }) =>
      showError(err?.message ?? t("payoutRequestError")),
  });

  const handleRequestPayout = useCallback(() => {
    const ids = eligibleForPayout.map((o) => o.id!);
    if (ids.length === 0) return;
    requestBulkPayout(ids);
  }, [eligibleForPayout, requestBulkPayout]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: t("colOrderId"),
        render: (o: OrderDocument) => (
          <Text size="sm" className="font-mono">{o.id?.slice(-8)}</Text>
        ),
      },
      {
        key: "status",
        header: t("colStatus"),
        render: (o: OrderDocument) => (
          <Badge
            variant={
              o.status === "delivered" ? "success" :
              o.status === "shipped"   ? "info"    :
              o.status === "cancelled" ? "danger"  :
              o.status === "confirmed" ? "primary" : "secondary"
            }
          >
            {o.status}
          </Badge>
        ),
      },
      {
        key: "totalPrice",
        header: t("colAmount"),
        render: (o: OrderDocument) => (
          <Text weight="medium">{formatCurrency(o.totalPrice ?? 0)}</Text>
        ),
      },
      {
        key: "payoutStatus",
        header: t("colPayoutStatus"),
        render: (o: OrderDocument) =>
          o.payoutStatus ? (
            <Badge
              variant={
                o.payoutStatus === "paid"      ? "success"  :
                o.payoutStatus === "requested" ? "warning"  : "secondary"
              }
            >
              {o.payoutStatus}
            </Badge>
          ) : null,
      },
      {
        key: "shippingMethod",
        header: t("colShipping"),
        render: (o: OrderDocument) =>
          o.shippingMethod ? (
            <Text size="xs" variant="secondary">{o.shippingMethod}</Text>
          ) : null,
      },
    ],
    [t],
  );

  // Row-level actions
  const rowActions = useCallback(
    (order: OrderDocument) => {
      if (
        order.status === "confirmed" &&
        shippingConfig?.method === "custom"
      ) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShipModalOrder(order)}
          >
            {t("actionShip")}
          </Button>
        );
      }
      return null;
    },
    [t, shippingConfig?.method],
  );

  if (authLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <ListingLayout
        headerSlot={
          <>
            <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
            {/* Summary stats */}
            {!isLoading && orders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {(
                  [
                    { label: t("statTotal"),     count: orders.length,                                         color: "text-indigo-600 dark:text-indigo-400" },
                    { label: t("statPending"),   count: orders.filter((o) => o.status === "pending").length,   color: "text-yellow-600 dark:text-yellow-400" },
                    { label: t("statConfirmed"), count: orders.filter((o) => o.status === "confirmed").length, color: "text-blue-600 dark:text-blue-400" },
                    { label: t("statDelivered"), count: orders.filter((o) => o.status === "delivered").length, color: "text-green-600 dark:text-green-400" },
                  ] as const
                ).map(({ label, count, color }) => (
                  <Card key={label} className="p-4 text-center">
                    <Text weight="bold" className={`text-2xl ${color}`}>{count}</Text>
                    <Text size="sm" className={themed.textSecondary}>{label}</Text>
                  </Card>
                ))}
              </div>
            )}
          </>
        }
        statusTabsSlot={
          <Tabs
            value={statusFilter}
            onChange={(id) => { table.set("status", id); setSelectedIds([]); }}
          >
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        paginationSlot={
          (meta?.totalPages ?? 1) > 1 ? (
            <TablePagination
              currentPage={page}
              totalPages={meta?.totalPages ?? 1}
              pageSize={PAGE_SIZE}
              total={meta?.total ?? 0}
              onPageChange={table.setPage}
              isLoading={isLoading}
            />
          ) : undefined
        }
      >
        {/* Bulk action bar — only visible when rows selected */}
        <BulkActionBar
          selectedCount={selectedIds.length}
          eligibleCount={eligibleForPayout.length}
          isPayoutConfigured={isPayoutConfigured}
          onRequestPayout={handleRequestPayout}
          onClearSelection={() => setSelectedIds([])}
          isLoading={isBulkLoading}
        />

        {/* Orders table */}
        <DataTable<OrderDocument>
          data={orders}
          columns={columns}
          keyExtractor={(o) => o.id!}
          loading={isLoading}
          emptyTitle={t("emptyTitle")}
          emptyMessage={t("emptySubtitle")}
          externalPagination
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={rowActions}
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(order) => (
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Caption className="font-mono">
                  #{(order.id ?? "").slice(-8).toUpperCase()}
                </Caption>
                <StatusBadge status={order.status as any} />
              </div>
              <Text weight="medium" size="sm" className="line-clamp-1">
                {order.productTitle}
              </Text>
              <Caption>{order.userName}</Caption>
              <div className="flex items-center justify-between">
                <Caption>{formatDate(order.createdAt)}</Caption>
                <Text weight="semibold" size="sm">
                  {formatCurrency(order.totalPrice)}
                </Text>
              </div>
            </Card>
          )}
        />

        {/* Revenue summary */}
        {!isLoading && orders.length > 0 && (
          <Card className={`p-4 ${themed.bgSecondary}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Text className={`font-medium ${themed.textPrimary}`}>
                {statusFilter
                  ? t("revenueFiltered", { status: statusFilter })
                  : t("revenueThisPage")}
              </Text>
              <Text weight="bold" className="text-2xl text-indigo-600 dark:text-indigo-400">
                {formatCurrency(orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0))}
              </Text>
            </div>
          </Card>
        )}
      </ListingLayout>

      {/* Ship-order modal (custom shipping only) */}
      <ShipOrderModal
        order={shipModalOrder}
        onClose={() => setShipModalOrder(null)}
        onShipped={refetch}
      />
    </>
  );
}

export function SellerOrdersView() {
  return (
    <Suspense>
      <SellerOrdersContent />
    </Suspense>
  );
}
