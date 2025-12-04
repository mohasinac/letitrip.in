"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { couponsService } from "@/services/coupons.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import { Ticket, Percent } from "lucide-react";
import { getCouponBulkActions } from "@/constants/bulk-actions";
import { COUPON_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { CouponFE } from "@/types/frontend/coupon.types";
type Coupon = CouponFE;

export default function AdminCouponsPage() {
  // Define columns
  const columns = [
    {
      key: "coupon",
      label: "Coupon",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <div className="font-mono font-bold text-gray-900 dark:text-white">
              {coupon.code}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {coupon.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-1 text-gray-900 dark:text-white">
          {coupon.type === "percentage" ? (
            <>
              <Percent className="w-4 h-4" />
              <span>{coupon.discountValue}%</span>
            </>
          ) : (
            <span>₹{coupon.discountValue}</span>
          )}
        </div>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (coupon: Coupon) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {coupon.usageCount || 0} / {coupon.usageLimit || "∞"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {coupon.usageLimitPerUser &&
              `Max ${coupon.usageLimitPerUser} per user`}
          </div>
        </div>
      ),
    },
    {
      key: "validity",
      label: "Validity",
      render: (coupon: Coupon) => (
        <div className="text-sm">
          {coupon.startDate && (
            <div className="text-gray-600 dark:text-gray-400">
              From: <DateDisplay date={coupon.startDate} format="short" />
            </div>
          )}
          {coupon.endDate && (
            <div className="text-gray-600 dark:text-gray-400">
              Until: <DateDisplay date={coupon.endDate} format="short" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (coupon: Coupon) => {
        const now = new Date();
        const isExpired = coupon.endDate && new Date(coupon.endDate) < now;
        const isNotStarted =
          coupon.startDate && new Date(coupon.startDate) > now;
        const isMaxedOut =
          coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

        if (!coupon.isActive) {
          return <StatusBadge status="inactive" />;
        } else if (isExpired) {
          return <StatusBadge status="error" />;
        } else if (isMaxedOut) {
          return <StatusBadge status="warning" />;
        } else if (isNotStarted) {
          return <StatusBadge status="pending" />;
        } else {
          return <StatusBadge status="active" />;
        }
      },
    },
    {
      key: "created",
      label: "Created",
      render: (coupon: Coupon) => (
        <DateDisplay date={coupon.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      key: "discountType",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "all", label: "All Types" },
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed Amount" },
      ],
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

    if (options.filters?.isActive && options.filters.isActive !== "all") {
      apiFilters.isActive = options.filters.isActive === "true";
    }
    if (
      options.filters?.discountType &&
      options.filters.discountType !== "all"
    ) {
      apiFilters.discountType = options.filters.discountType;
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await couponsService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      items: (response.data || []) as Coupon[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<Coupon>) => {
    await couponsService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await couponsService.delete(id);
  };

  return (
    <AdminResourcePage<Coupon>
      resourceName="Coupon"
      resourceNamePlural="Coupons"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(COUPON_FIELDS)}
      bulkActions={getCouponBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
