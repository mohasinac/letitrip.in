"use client";

import { SellerResourcePage } from "@/components/seller/SellerResourcePage";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE } from "@/types/frontend/order.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Price, DateDisplay } from "@/components/common/values";
import Link from "next/link";
import { Eye, Package } from "lucide-react";

export default function SellerOrdersPage() {
  return (
    <SellerResourcePage<OrderCardFE>
      resourceName="Order"
      resourceNamePlural="Orders"
      loadData={async (options) => {
        const response = await ordersService.getSellerOrders({
          search: options.search,
          ...options.filters,
          limit: 50,
        } as any);
        return {
          items: response.data || [],
          nextCursor: null,
          hasNextPage: false,
        };
      }}
      columns={[
        {
          key: "orderNumber",
          label: "Order #",
          sortable: true,
          render: (order) => (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                #{order.orderNumber}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {order.id.substring(0, 8)}
              </div>
            </div>
          ),
        },
        {
          key: "customer",
          label: "Customer",
          render: (order) => (
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {order.customer?.name || "N/A"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {order.customer?.email}
              </div>
            </div>
          ),
        },
        {
          key: "totalAmount",
          label: "Total",
          sortable: true,
          render: (order) => (
            <div className="font-medium text-gray-900 dark:text-white">
              <Price amount={order.totalAmount} />
            </div>
          ),
        },
        {
          key: "itemCount",
          label: "Items",
          render: (order) => (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Package className="h-4 w-4" />
              <span className="text-sm">{order.itemCount}</span>
            </div>
          ),
        },
        {
          key: "paymentStatus",
          label: "Payment",
          render: (order) => <StatusBadge status={order.paymentStatus} />,
        },
        {
          key: "fulfillmentStatus",
          label: "Fulfillment",
          render: (order) => <StatusBadge status={order.fulfillmentStatus} />,
        },
        {
          key: "createdAt",
          label: "Date",
          sortable: true,
          render: (order) => (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <DateDisplay date={order.createdAt} format="medium" />
            </div>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (order) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/seller/orders/${order.id}`}
                className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          ),
        },
      ]}
      fields={[
        {
          name: "fulfillmentStatus",
          label: "Fulfillment Status",
          type: "select",
          required: true,
        },
        {
          name: "trackingNumber",
          label: "Tracking Number",
          type: "text",
        },
      ]}
      bulkActions={[]}
      onSave={async (id: string, data: any) => {
        await ordersService.update(id, data);
      }}
      renderMobileCard={(order) => (
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.customer?.name}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {order.itemCount} items
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              <Price amount={order.totalAmount} />
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <DateDisplay date={order.createdAt} format="medium" />
          </div>
          <div className="mt-3">
            <Link
              href={`/seller/orders/${order.id}`}
              className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        </div>
      )}
      renderGridCard={(order) => (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.customer?.name}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {order.itemCount} items
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              <Price amount={order.totalAmount} />
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            <DateDisplay date={order.createdAt} format="medium" />
          </div>
          <Link
            href={`/seller/orders/${order.id}`}
            className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      )}
    />
  );
}
