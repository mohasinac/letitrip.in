"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { ordersService } from "@/services/orders.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import { Price } from "@/components/common/values/Price";
import { Package, User, Store } from "lucide-react";
import { getOrderBulkActions } from "@/constants/bulk-actions";
import { toInlineFields } from "@/constants/form-fields";
import type { Order } from "@/types/frontend/order.types";

// Order fields configuration
const ORDER_FIELDS = [
  {
    name: "paymentStatus",
    label: "Payment Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ],
  },
  {
    name: "fulfillmentStatus",
    label: "Fulfillment Status",
    type: "select",
    required: true,
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
      key: "order",
      label: "Order",
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
      key: "customer",
      label: "Customer",
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {order.customer?.name || order.customer?.email || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Seller",
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-sm">
          <Store className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {order.seller?.name || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (order: Order) => <Price amount={order.total || 0} />,
    },
    {
      key: "payment",
      label: "Payment",
      render: (order: Order) => (
        <div className="text-sm">
          <StatusBadge
            status={order.paymentStatus || "pending"}
            label={order.paymentStatus || "pending"}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {order.paymentMethod || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "fulfillment",
      label: "Fulfillment",
      render: (order: Order) => (
        <StatusBadge
          status={order.fulfillmentStatus || "pending"}
          label={order.fulfillmentStatus || "pending"}
        />
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (order: Order) => (
        <DateDisplay date={new Date(order.createdAt)} format="relative" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      key: "fulfillmentStatus",
      label: "Fulfillment Status",
      type: "select" as const,
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
      key: "minTotal",
      label: "Min Total",
      type: "text" as const,
    },
    {
      key: "maxTotal",
      label: "Max Total",
      type: "text" as const,
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      page: options.cursor ? parseInt(options.cursor) : 1,
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
      items: (response.data || []) as Order[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<Order>) => {
    await ordersService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await ordersService.delete(id);
  };

  return (
    <AdminResourcePage<Order>
      resourceName="Order"
      resourceNamePlural="Orders"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(ORDER_FIELDS)}
      bulkActions={getOrderBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
