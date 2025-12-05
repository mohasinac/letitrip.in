/**
 * @fileoverview React Component
 * @module src/app/seller/orders/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import { SellerResourcePage } from "@/components/seller/SellerResourcePage";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE } from "@/types/frontend/order.types";
import { Eye, Package } from "lucide-react";
import Link from "next/link";

/**
 * Performs seller orders page operation
 *
 * @returns {void} Function return value
 *
 * @example
 * const result = SellerOrdersPage();
 */
export default /**
 * Performs seller orders page operation
 *
 * @returns {any} The sellerorderspage result
 *
 */
function SellerOrdersPage() {
  return (
    <SellerResourcePage<OrderCardFE>
      resourceName="Order"
      resourceNamePlural="Orders"
      loadData={async (options) => {
        const response = await ordersService.getSellerOrders({
          /** Search */
          search: options.search,
          ...options.filters,
          /** Limit */
          limit: 50,
        } as any);
        return {
          /** Items */
          items: response.data || [],
          /** Next Cursor */
          nextCursor: null,
          /** Has Next Page */
          hasNextPage: false,
        };
      }}
      columns={[
        {
          /** Key */
          key: "orderNumber",
          /** Label */
          label: "Order #",
          /** Sortable */
          sortable: true,
          /** Render */
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
          /** Key */
          key: "customer",
          /** Label */
          label: "Customer",
          /** Render */
          render: (order) => (
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {order.shippingAddress?.name || "N/A"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {order.shippingAddress?.phone || "N/A"}
              </div>
            </div>
          ),
        },
        {
          /** Key */
          key: "totalAmount",
          /** Label */
          label: "Total",
          /** Sortable */
          sortable: true,
          /** Render */
          render: (order) => (
            <div className="font-medium text-gray-900 dark:text-white">
              <Price amount={order.total} />
            </div>
          ),
        },
        {
          /** Key */
          key: "itemCount",
          /** Label */
          label: "Items",
          /** Render */
          render: (order) => (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Package className="h-4 w-4" />
              <span className="text-sm">{order.itemCount}</span>
            </div>
          ),
        },
        {
          /** Key */
          key: "paymentStatus",
          /** Label */
          label: "Payment",
          /** Render */
          render: (order) => <StatusBadge status={order.paymentStatus} />,
        },
        {
          /** Key */
          key: "fulfillmentStatus",
          /** Label */
          label: "Fulfillment",
          /** Render */
          render: (order) => <StatusBadge status={order.status} />,
        },
        {
          /** Key */
          key: "createdAt",
          /** Label */
          label: "Date",
          /** Sortable */
          sortable: true,
          /** Render */
          render: (order) => (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <DateDisplay date={order.createdAt} format="medium" />
            </div>
          ),
        },
        {
          /** Key */
          key: "actions",
          /** Label */
          label: "Actions",
          /** Render */
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
          /** Name */
          name: "fulfillmentStatus",
          /** Label */
          label: "Fulfillment Status",
          /** Type */
          type: "select",
          /** Required */
          required: true,
        },
        {
          /** Name */
          name: "trackingNumber",
          /** Label */
          label: "Tracking Number",
          /** Type */
          type: "text",
        },
      ]}
      bulkActions={[]}
      onSave={async (id: string, data: any) => {
        await ordersService.updateStatus(id, data.status);
      }}
      renderMobileCard={(order) => (
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.shippingAddress?.name || "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {order.itemCount} items
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              <Price amount={order.total} />
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
                {order.shippingAddress?.name || "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {order.itemCount} items
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              <Price amount={order.total} />
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
