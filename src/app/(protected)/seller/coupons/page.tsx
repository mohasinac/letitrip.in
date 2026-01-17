"use client";

import { toast } from "@/components/admin/Toast";
import type { FilterSection } from "@/components/common/FilterSidebar";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { couponsService } from "@/services/coupons.service";
import type { CouponFE } from "@/types/frontend/coupon.types";
import {
  DateDisplay,
  PageState,
  Percentage,
  Price,
  StatusBadge,
  UnifiedFilterSidebar,
  useIsMobile,
  useLoadingState,
} from "@letitrip/react-library";
import { Copy, Edit, Filter, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const COUPON_FILTERS: FilterSection[] = [
  {
    title: "Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "checkbox",
        options: [
          { label: "Active", value: "active" },
          { label: "Expired", value: "expired" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
  },
  {
    title: "Type",
    fields: [
      {
        key: "type",
        label: "Coupon Type",
        type: "checkbox",
        options: [
          { label: "Percentage", value: "percentage" },
          { label: "Fixed Amount", value: "fixed" },
        ],
      },
    ],
  },
];

export default function CouponsPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [coupons, setCoupons] = useState<CouponFE[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  useEffect(() => {
    loadCoupons();
  }, [user]);

  const loadCoupons = useCallback(async () => {
    if (!user) return;

    await execute(async () => {
      // API will automatically filter by user's shop from session
      const response = await couponsService.list({});
      setCoupons(response.data || []);
    });
  }, [user, execute]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await couponsService.delete(code);
      setCoupons(coupons.filter((c) => c.code !== code));
      toast.success("Coupon deleted successfully");
    } catch (err) {
      logError(err as Error, {
        component: "SellerCoupons.handleDeleteCoupon",
        metadata: { code },
      });
      toast.error("Failed to delete coupon");
    }
  };

  // Filter coupons based on search query
  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <PageState.Loading message="Loading coupons..." fullPage={false} />;
  }

  if (error) {
    return (
      <PageState.Error
        message={error.message}
        onRetry={loadCoupons}
        fullPage={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your discount coupons
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/seller/coupons/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={COUPON_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={() => {}}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={filteredCoupons.length}
            isLoading={isLoading}
            showInlineSearch={true}
            onInlineSearchChange={setSearchQuery}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search coupons..."
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Grid View */}
          {view === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No coupons found
                  </p>
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-lg font-mono font-bold text-blue-700 dark:text-blue-400">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="rounded p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {coupon.description}
                        </p>
                      </div>
                      <StatusBadge status={coupon.status} />
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Discount:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.type === "percentage" ? (
                            <Percentage value={coupon.discountValue || 0} />
                          ) : (
                            <Price amount={coupon.discountValue || 0} />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Usage:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.usageCount || 0} / {coupon.usageLimit || "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Valid Until:
                        </span>
                        <DateDisplay
                          date={coupon.endDate}
                          format="short"
                          className="font-medium text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/seller/coupons/${coupon.code}/edit`}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.code)}
                        className="flex-1 rounded-lg border border-red-300 dark:border-red-700 px-3 py-2 text-center text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Table View */}
          {view === "table" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Valid Until
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filteredCoupons.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No coupons found
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon) => (
                        <tr
                          key={coupon.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <code className="rounded bg-blue-50 dark:bg-blue-900/30 px-2 py-1 font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                                {coupon.code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="rounded p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                title="Copy code"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {coupon.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {coupon.type === "percentage" ? (
                              <Percentage value={coupon.discountValue || 0} />
                            ) : (
                              <Price amount={coupon.discountValue || 0} />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {coupon.usageCount || 0} /{" "}
                            {coupon.usageLimit || "∞"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <DateDisplay date={coupon.endDate} format="short" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={coupon.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/seller/coupons/${coupon.code}/edit`}
                                className="rounded p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(coupon.code)}
                                className="rounded p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Inline Create Row */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-4">
                <Link
                  href="/seller/coupons/create"
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Plus className="h-4 w-4" />
                  Create New Coupon
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={COUPON_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={() => setShowFilters(false)}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
            }}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={filteredCoupons.length}
            isLoading={isLoading}
            showInlineSearch={true}
            onInlineSearchChange={setSearchQuery}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search coupons..."
          />
        )}
      </div>
    </div>
  );
}
