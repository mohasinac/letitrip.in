/**
 * @fileoverview React Component
 * @module src/app/admin/orders/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { ordersService } from "@/services/orders.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import { Package, User, Store } from "lucide-react";
import { getOrderBulkActions } from "@/constants/bulk-actions";
import { toInlineFields } from "@/constants/form-fields";
import type { OrderFE } from "@/types/frontend/order.types";
/**
 * Order type
 * 
 * @typedef {Object} Order
 * @description Type definition for Order
 */
type Order = OrderFE;

// Order fields configuration
const ORDER_FIELDS = [
  {
    /** Key */
    key: "paymentStatus",
    /** Label */
    label: "Payment Status",
    /** Type */
    type: "select" as const,
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ],
  },
  {
    /** Key */
    key: "fulfillmentStatus",
    /** Label */
    label: "Fulfillment Status",
    /** Type */
    type: "select" as const,
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export default function AdminOrdersPage() {
  // Define columns
  const columns = [
    {
      /** Key */
      key: "order",
      /** Label */
      label: "Order",
      /** Render */
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-600 dark:text-orange-300" />
          </div>
          <div>
            <div className="font-mono font-medium text-gray-900 dark:text-white">
              {order.orderNumber || order.id.substring(0, 8).toUpperCase()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {order.items?.length || 0} items
            </div>
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
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {order.userName || order.userEmail || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      /** Key */
      key: "seller",
      /** Label */
      label: "Shop",
      /** Render */
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-sm">
          <Store className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {order.shopName || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      /** Key */
      key: "total",
      /** Label */
      label: "Total",
      /** Render */
      render: (order: Order) => <Price amount={order.total || 0} />,
    },
    {
      /** Key */
      key: "payment",
      /** Label */
      label: "Payment",
      /** Render */
      render: (order: Order) => (
        <div className="text-sm">
          <StatusBadge status={order.paymentStatus || "pending"} />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {order.paymentMethod || "N/A"}
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "fulfillment",
      /** Label */
      label: "Fulfillment",
      /** Render */
      render: (order: Order) => (
        <StatusBadge status={order.status || "pending"} />
      ),
    },
    {
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (order: Order) => (
        <DateDisplay date={order.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "paymentStatus",
      /** Label */
      label: "Payment Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      /** Key */
      key: "fulfillmentStatus",
      /** Label */
      label: "Fulfillment Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      /** Key */
      key: "minTotal",
      /** Label */
      label: "Min Total",
      /** Type */
      type: "text" as const,
    },
    {
      /** Key */
      key: "maxTotal",
      /** Label */
      label: "Max Total",
      /** Type */
      type: "text" as const,
    },
  ];

  // Load data function
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      /** Page */
      page: options.cursor ? parseInt(options.cursor) : 1,
      /** Limit */
      limit: 20,
    };

    if (
      options.filters?.paymentStatus &&
      options.filters.paymentStatus !== "all"
    ) {
      apiFilters.paymentStatus = options.filters.paymentStatus;
    }
    if (
      options.filters?.fulfillmentStatus &&
      options.filters.fulfillmentStatus !== "all"
    ) {
      apiFilters.fulfillmentStatus = options.filters.fulfillmentStatus;
    }
    if (options.filters?.minTotal) {
      apiFilters.minTotal = parseFloat(options.filters.minTotal);
    }
    if (options.filters?.maxTotal) {
      apiFilters.maxTotal = parseFloat(options.filters.maxTotal);
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await ordersService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      /** Items */
      items: (response.data || []) as any as Order[],
      /** Next Cursor */
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      /** Has Next Page */
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<Order>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<Order>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<Order>) => {
    // Orders don't have update method, only status updates
    // await ordersService.updateStatus(id, data.paymentStatus);
  };

  // Handle delete
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async (id: string) => {
    // Orders cannot be deleted, only cancelled
    // await ordersService.updateStatus(id, "cancelled");
  };

  return (
    <AdminResourcePage<Order>
      resourceName="Order"
      resourceNamePlural="Orders"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(ORDER_FIELDS as any)}
      bulkActions={getOrderBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
