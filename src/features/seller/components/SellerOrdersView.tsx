/**
 * SellerOrdersView
 *
 * Feature view for seller orders/sales listing.
 * Extracted from /seller/orders page — Rule 16 (page < 150 lines).
 */

"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Spinner,
  Card,
  DataTable,
  AdminPageHeader,
  TablePagination,
  Text,
  useOrderTableColumns,
} from "@/components";
import { useAuth, useUrlTable } from "@/hooks";
import { useSellerOrders } from "@/features/seller";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import type { OrderDocument } from "@/db/schema";
import { formatCurrency } from "@/utils";

const { themed, spacing } = THEME_CONSTANTS;

function SellerOrdersContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerOrders");

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
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

  const { orders, meta, isLoading } = useSellerOrders(orderParams);

  const { columns } = useOrderTableColumns(() => {
    /* view only — no drawer needed */
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={spacing.stack}>
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Summary Stats */}
      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {(
            [
              {
                label: t("statTotal"),
                count: orders.length,
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                label: t("statPending"),
                count: orders.filter((o) => o.status === "pending").length,
                color: "text-yellow-600 dark:text-yellow-400",
              },
              {
                label: t("statConfirmed"),
                count: orders.filter((o) => o.status === "confirmed").length,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: t("statDelivered"),
                count: orders.filter((o) => o.status === "delivered").length,
                color: "text-green-600 dark:text-green-400",
              },
            ] as const
          ).map(({ label, count, color }) => (
            <Card key={label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <Text size="sm" className={themed.textSecondary}>
                {label}
              </Text>
            </Card>
          ))}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div
        className={`flex gap-1 overflow-x-auto border-b ${themed.borderColor} pb-0`}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => table.set("status", tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : THEME_CONSTANTS.tab.inactive
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <DataTable<OrderDocument>
        data={orders}
        columns={columns}
        keyExtractor={(o) => o.id}
        loading={isLoading}
        emptyTitle={t("emptyTitle")}
        emptyMessage={t("emptySubtitle")}
        externalPagination
      />

      {(meta?.totalPages ?? 1) > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={meta?.totalPages ?? 1}
          pageSize={PAGE_SIZE}
          total={meta?.total ?? 0}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      )}

      {/* Revenue Summary */}
      {!isLoading && orders.length > 0 && (
        <Card className={`p-4 ${themed.bgSecondary}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Text className={`font-medium ${themed.textPrimary}`}>
              {statusFilter
                ? t("revenueFiltered", { status: statusFilter })
                : t("revenueThisPage")}
            </Text>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(
                orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0),
              )}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export function SellerOrdersView() {
  return (
    <Suspense>
      <SellerOrdersContent />
    </Suspense>
  );
}
