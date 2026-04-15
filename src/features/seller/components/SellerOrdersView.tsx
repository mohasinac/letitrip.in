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
  Text,
  TablePagination,
  Badge,
  Button,
  ListingLayout,
  SortDropdown,
  Spinner,
  ActiveFilterChips,
  SectionTabs,
  DataTable,
} from "@mohasinac/appkit/ui";
import { usePendingTable } from "@mohasinac/appkit/react";
import { SellerOrdersView as AppkitSellerOrdersView } from "@mohasinac/appkit/features/seller";
import {
  Card,
  OrderCard,
  AdminPageHeader,
  FormField,
  SideDrawer,
  Search,
} from "@/components";
import { OrderFilters } from "@mohasinac/appkit/features/orders";
import type { ActiveFilter } from "@mohasinac/appkit/ui";
import { getFilterLabel } from "@/components";
import { useAuth, useUrlTable, useMessage } from "@/hooks";
import {
  useSellerOrders,
  useSellerShipping,
  useSellerPayoutSettings,
  useShipOrder,
  useBulkRequestPayout,
} from "@/features/seller";
import {
  ROUTES,
  THEME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import { formatCurrency } from "@/utils";
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
  const { showSuccess, showError } = useMessage();
  const [form, setForm] = useState({
    shippingCarrier: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  const { mutate: shipOrder, isPending: isLoading } = useShipOrder(
    order!.id!,
    () => {
      showSuccess(SUCCESS_MESSAGES.SHIPPING.ORDER_SHIPPED);
      onShipped();
      onClose();
    },
    (err) => showError(err?.message ?? t("shipError")),
  );

  const handleSubmit = () => {
    if (
      !form.shippingCarrier.trim() ||
      !form.trackingNumber.trim() ||
      !form.trackingUrl.trim()
    ) {
      showError(t("shipFormRequired"));
      return;
    }
    shipOrder({ method: "custom", ...form });
  };

  if (!order) return null;

  return (
    <SideDrawer
      isOpen={!!order}
      onClose={onClose}
      title={t("shipModalTitle")}
      mode="edit"
    >
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
        <div className={`${flex.start} gap-2 pt-1`}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            {t("markShipped")}
          </Button>
        </div>
      </div>
    </SideDrawer>
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

  const table = useUrlTable({
    defaults: { pageSize: "25", sorts: "-orderDate" },
  });
  const statusFilter = table.get("status");
  const searchQ = table.get("q");
  const sortParam = table.get("sorts") || "-orderDate";
  const paymentStatusParam = table.get("paymentStatus");
  const paymentMethodParam = table.get("paymentMethod");
  const page = table.getNumber("page", 1);
  const PAGE_SIZE = 25;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shipModalOrder, setShipModalOrder] = useState<OrderDocument | null>(
    null,
  );

  // ── Filter state (pending until Apply) ─────────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["paymentStatus", "paymentMethod"]);

  const sortOptions = useMemo(
    () => [
      { value: "-orderDate", label: t("sortNewest") },
      { value: "orderDate", label: t("sortOldest") },
      { value: "-totalPrice", label: t("sortHighestAmount") },
      { value: "totalPrice", label: t("sortLowestAmount") },
    ],
    [t],
  );

  const paymentStatusOptions = useMemo(
    () => [
      { value: "pending", label: t("filterPaymentStatusPending") },
      { value: "paid", label: t("filterPaymentStatusPaid") },
      { value: "failed", label: t("filterPaymentStatusFailed") },
    ],
    [t],
  );

  const paymentMethodOptions = useMemo(
    () => [
      { value: "razorpay", label: t("filterPaymentMethodRazorpay") },
      { value: "cod", label: t("filterPaymentMethodCod") },
    ],
    [t],
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () => [
      ...(paymentStatusParam
        ? [
            {
              key: "paymentStatus",
              label: t("colPayoutStatus"),
              value:
                getFilterLabel(paymentStatusOptions, paymentStatusParam) ??
                paymentStatusParam,
            },
          ]
        : []),
      ...(paymentMethodParam
        ? [
            {
              key: "paymentMethod",
              label: t("colShipping"),
              value:
                getFilterLabel(paymentMethodOptions, paymentMethodParam) ??
                paymentMethodParam,
            },
          ]
        : []),
    ],
    [
      paymentStatusParam,
      paymentMethodParam,
      paymentStatusOptions,
      paymentMethodOptions,
      t,
    ],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const orderParams = useMemo(() => {
    const filterParts: string[] = [];
    if (statusFilter) filterParts.push(`status==${statusFilter}`);
    if (paymentStatusParam)
      filterParts.push(`paymentStatus==${paymentStatusParam}`);
    if (paymentMethodParam)
      filterParts.push(`paymentMethod==${paymentMethodParam}`);

    const p = new URLSearchParams({
      sorts: sortParam,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (filterParts.length) p.set("filters", filterParts.join(","));
    if (searchQ) p.set("q", searchQ);
    return p.toString();
  }, [
    page,
    statusFilter,
    paymentStatusParam,
    paymentMethodParam,
    sortParam,
    searchQ,
  ]);

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

  const { mutate: requestBulkPayout, isPending: isBulkLoading } =
    useBulkRequestPayout(
      (res) => {
        const data = res as { requested: string[]; skipped: string[] };
        showSuccess(
          t("payoutRequested", { count: data.requested?.length ?? 0 }),
        );
        setSelectedIds([]);
        refetch();
      },
      (err) => showError(err?.message ?? t("payoutRequestError")),
    );

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
          <Text size="sm" className="font-mono">
            {o.id?.slice(-8)}
          </Text>
        ),
      },
      {
        key: "status",
        header: t("colStatus"),
        render: (o: OrderDocument) => (
          <Badge
            variant={
              o.status === "delivered"
                ? "success"
                : o.status === "shipped"
                  ? "info"
                  : o.status === "cancelled"
                    ? "danger"
                    : o.status === "confirmed"
                      ? "primary"
                      : "secondary"
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
                o.payoutStatus === "paid"
                  ? "success"
                  : o.payoutStatus === "requested"
                    ? "warning"
                    : "secondary"
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
            <Text size="xs" variant="secondary">
              {o.shippingMethod}
            </Text>
          ) : null,
      },
    ],
    [t],
  );

  // Row-level actions
  const rowActions = useCallback(
    (order: OrderDocument) => {
      if (order.status === "confirmed" && shippingConfig?.method === "custom") {
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
    <AppkitSellerOrdersView
      labels={{ title: t("title"), emptyText: t("emptyTitle") }}
      total={meta?.total ?? orders.length}
      isLoading={isLoading}
      renderTable={(_selected, _onSelectionChange, loading) => (
        <ListingLayout
          headerSlot={
            <>
              <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
              {!loading && orders.length > 0 && (
                <div className={THEME_CONSTANTS.grid.productCards}>
                  {(
                    [
                      {
                        label: t("statTotal"),
                        count: orders.length,
                        color: "text-primary",
                      },
                      {
                        label: t("statPending"),
                        count: orders.filter((o) => o.status === "pending")
                          .length,
                        color: "text-yellow-600 dark:text-yellow-400",
                      },
                      {
                        label: t("statConfirmed"),
                        count: orders.filter((o) => o.status === "confirmed")
                          .length,
                        color: "text-primary",
                      },
                      {
                        label: t("statDelivered"),
                        count: orders.filter((o) => o.status === "delivered")
                          .length,
                        color: "text-green-600 dark:text-green-400",
                      },
                    ] as const
                  ).map(({ label, count, color }) => (
                    <Card key={label} className="p-4 text-center">
                      <Text weight="bold" className={`text-2xl ${color}`}>
                        {count}
                      </Text>
                      <Text size="sm" className={themed.textSecondary}>
                        {label}
                      </Text>
                    </Card>
                  ))}
                </div>
              )}
            </>
          }
          searchSlot={
            <Search
              value={searchQ}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          filterContent={<OrderFilters table={pendingTable} variant="seller" />}
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
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={(key) => table.set(key, "")}
                onClearAll={onFilterClear}
              />
            ) : undefined
          }
          statusTabsSlot={
            <SectionTabs
              inline
              value={statusFilter}
              onChange={(id) => {
                table.set("status", id);
                setSelectedIds([]);
              }}
              tabs={STATUS_TABS.map((tab) => ({
                value: tab.key,
                label: tab.label,
              }))}
            />
          }
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActionItems={[
            {
              id: "payout",
              label: t("bulkRequestPayout", {
                count: eligibleForPayout.length,
              }),
              variant: "primary",
              onClick: handleRequestPayout,
              disabled: eligibleForPayout.length === 0 || !isPayoutConfigured,
              loading: isBulkLoading,
            },
          ]}
        >
          <DataTable<OrderDocument>
            data={orders}
            columns={columns}
            keyExtractor={(o) => o.id!}
            loading={loading}
            emptyTitle={t("emptyTitle")}
            emptyMessage={t("emptySubtitle")}
            externalPagination
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            actions={rowActions}
            showViewToggle
            viewMode={
              (table.get("view") || "table") as "table" | "grid" | "list"
            }
            onViewModeChange={(mode) => table.set("view", mode)}
            mobileCardRender={(order) => (
              <OrderCard
                order={order}
                variant={(table.get("view") as "grid" | "list") || "list"}
              />
            )}
          />

          {!loading && orders.length > 0 && (
            <Card className={`p-4 ${themed.bgSecondary}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Text className={`font-medium ${themed.textPrimary}`}>
                  {statusFilter
                    ? t("revenueFiltered", { status: statusFilter })
                    : t("revenueThisPage")}
                </Text>
                <Text weight="bold" className="text-2xl text-primary">
                  {formatCurrency(
                    orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0),
                  )}
                </Text>
              </div>
            </Card>
          )}
        </ListingLayout>
      )}
      renderPagination={() => (
        <TablePagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          total={meta?.total ?? orders.length}
          totalPages={meta?.totalPages ?? 1}
          onPageChange={(nextPage) => table.setPage(nextPage)}
          onPageSizeChange={(size) => table.set("pageSize", String(size))}
        />
      )}
      renderModal={() => (
        <ShipOrderModal
          order={shipModalOrder}
          onClose={() => setShipModalOrder(null)}
          onShipped={refetch}
        />
      )}
    />
  );
}

export function SellerOrdersView() {
  return (
    <Suspense>
      <SellerOrdersContent />
    </Suspense>
  );
}

