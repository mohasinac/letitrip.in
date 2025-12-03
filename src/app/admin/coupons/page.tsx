"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  BulkActionBar,
  TableCheckbox,
  InlineEditRow,
  QuickCreateRow,
} from "@/components/common/inline-edit";
import { StatsCardGrid, StatsCard } from "@/components/common/StatsCard";
import { COUPON_FILTERS } from "@/constants/filters";
import { getCouponBulkActions } from "@/constants/bulk-actions";
import { couponsService } from "@/services/coupons.service";
import {
  COUPON_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { toast } from "@/components/admin/Toast";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Copy,
  Tag,
  Calendar,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { useLoadingState } from "@/hooks/useLoadingState";
import { DateDisplay } from "@/components/common/values";

export default function AdminCouponsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    data: coupons,
    isLoading: loading,
    execute: loadCoupons,
  } = useLoadingState<any[]>({ initialData: [] });
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get inline fields for table context
  const fields = toInlineFields(getFieldsForContext(COUPON_FIELDS, "table"));

  const fetchCoupons = useCallback(async () => {
    const response = await couponsService.list({
      ...filterValues,
      search: searchQuery || undefined,
      page: currentPage,
      limit: 20,
    });
    setTotalPages(Math.ceil((response.count || 0) / 20));
    setTotalCoupons(response.count || 0);
    return response.data || [];
  }, [filterValues, currentPage, searchQuery]);

  useEffect(() => {
    loadCoupons(fetchCoupons);
  }, [fetchCoupons, loadCoupons]);

  const handleBulkAction = async (actionId: string) => {
    if (selectedCoupons.size === 0) {
      // toast.error("Please select coupons first");
      return;
    }

    try {
      const couponIds = Array.from(selectedCoupons);

      switch (actionId) {
        case "activate":
          await Promise.all(
            couponIds.map((id) =>
              couponsService.update(id, { is_active: true } as any)
            )
          );
          toast.success(
            `${couponIds.length} coupon${
              couponIds.length > 1 ? "s" : ""
            } activated successfully`
          );
          break;
        case "deactivate":
          await Promise.all(
            couponIds.map((id) =>
              couponsService.update(id, { is_active: false } as any)
            )
          );
          toast.success(
            `${couponIds.length} coupon${
              couponIds.length > 1 ? "s" : ""
            } deactivated successfully`
          );
          break;
        case "delete":
          if (
            !confirm(
              `Delete ${couponIds.length} coupon${
                couponIds.length > 1 ? "s" : ""
              }?`
            )
          )
            return;
          await Promise.all(couponIds.map((id) => couponsService.delete(id)));
          toast.success(
            `${couponIds.length} coupon${
              couponIds.length > 1 ? "s" : ""
            } deleted successfully`
          );
          break;
      }

      setSelectedCoupons(new Set());
      loadCoupons(fetchCoupons);
    } catch (error: any) {
      toast.error(error.message || "Bulk action failed");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    try {
      await couponsService.delete(id);
      toast.success("Coupon deleted successfully");
      loadCoupons(fetchCoupons);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const toggleSelectAll = () => {
    if (selectedCoupons.size === (coupons || []).length) {
      setSelectedCoupons(new Set());
    } else {
      setSelectedCoupons(new Set((coupons || []).map((c) => c.id)));
    }
  };

  const bulkActions = getCouponBulkActions(selectedCoupons.size);

  const formatDiscount = (coupon: any) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}% OFF`;
    } else if (coupon.type === "flat") {
      return `₹${coupon.value} OFF`;
    } else if (coupon.type === "free-shipping") {
      return "FREE SHIPPING";
    }
    return coupon.type;
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Filter Sidebar */}
          <UnifiedFilterSidebar
            sections={COUPON_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalCoupons}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search coupons..."
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Coupon Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Create and manage discount coupons
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/coupons/create")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Create Coupon
              </button>
            </div>

            {/* Stats Cards */}
            <StatsCardGrid columns={4} className="mb-6">
              <StatsCard title="Total Coupons" value={totalCoupons} />
              <StatsCard
                title="Active"
                value={(coupons || []).filter((c) => c.isActive).length}
                className="[&_p:last-child]:!text-green-600"
              />
              <StatsCard
                title="Expired"
                value={
                  (coupons || []).filter(
                    (c) => new Date(c.validTo) < new Date()
                  ).length
                }
                className="[&_p:last-child]:!text-red-600"
              />
              <StatsCard
                title="Total Uses"
                value={(coupons || []).reduce(
                  (sum, c) => sum + (c.usageCount || 0),
                  0
                )}
              />
            </StatsCardGrid>

            {/* Bulk Action Bar */}
            {selectedCoupons.size > 0 && (
              <BulkActionBar
                selectedCount={selectedCoupons.size}
                actions={bulkActions}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedCoupons(new Set())}
              />
            )}

            {/* Mobile Coupon Cards */}
            {isMobile && (
              <div className="space-y-3 lg:hidden">
                {loading ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : (coupons || []).length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                    <p>No coupons found</p>
                    <button
                      onClick={() => router.push("/admin/coupons/create")}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create First Coupon
                    </button>
                  </div>
                ) : (
                  <>
                    {(coupons || []).map((coupon) => {
                      const isExpired = new Date(coupon.validTo) < new Date();
                      return (
                        <div
                          key={coupon.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                        >
                          {/* Header with code and checkbox */}
                          <div className="flex items-start gap-3">
                            <TableCheckbox
                              checked={selectedCoupons.has(coupon.id)}
                              onChange={(checked) => {
                                const newSelected = new Set(selectedCoupons);
                                if (checked) {
                                  newSelected.add(coupon.id);
                                } else {
                                  newSelected.delete(coupon.id);
                                }
                                setSelectedCoupons(newSelected);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-600" />
                                <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                                  {coupon.code}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(coupon.code);
                                    toast.success("Code copied!");
                                  }}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Copy className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {coupon.description || "No description"}
                              </p>
                            </div>
                          </div>

                          {/* Status badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                coupon.isActive && !isExpired
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {coupon.isActive && !isExpired
                                ? "Active"
                                : "Inactive"}
                            </span>
                            {isExpired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Expired
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                              <Percent className="h-3 w-3" />
                              {coupon.type === "percentage"
                                ? `${coupon.value}% off`
                                : `₹${coupon.value} off`}
                            </span>
                          </div>

                          {/* Info grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Uses:
                              </span>{" "}
                              <span className="text-gray-900 dark:text-white">
                                {coupon.usageCount || 0} /{" "}
                                {coupon.maxUses || "∞"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 dark:text-gray-400">
                                Expires:
                              </span>{" "}
                              <DateDisplay
                                date={coupon.validTo}
                                format="short"
                                className={
                                  isExpired
                                    ? "text-red-600"
                                    : "text-gray-900 dark:text-white"
                                }
                              />
                            </div>
                            {coupon.minOrderValue && (
                              <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Min order:
                                </span>{" "}
                                <span className="text-gray-900 dark:text-white">
                                  ₹{coupon.minOrderValue}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                              onClick={() =>
                                router.push(`/admin/coupons/${coupon.id}/edit`)
                              }
                              className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mobile Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1 || loading}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Prev
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages || loading}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Coupons Table - Desktop Only */}
            <div
              className={`bg-white rounded-lg shadow overflow-hidden ${
                isMobile ? "hidden" : ""
              }`}
            >
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (coupons || []).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No coupons found</p>
                  <button
                    onClick={() => router.push("/admin/coupons/create")}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create First Coupon
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <TableCheckbox
                          checked={
                            selectedCoupons.size === (coupons || []).length
                          }
                          indeterminate={
                            selectedCoupons.size > 0 &&
                            selectedCoupons.size < (coupons || []).length
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Discount Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Discount Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usage Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Expires At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Quick Create Row */}
                    <QuickCreateRow
                      fields={fields}
                      onSave={async (values) => {
                        try {
                          await couponsService.create(values as any);
                          loadCoupons(fetchCoupons);
                        } catch (error: any) {
                          throw error;
                        }
                      }}
                      resourceName="coupon"
                    />
                    {(coupons || []).map((coupon) => {
                      const isEditing = editingId === coupon.id;

                      if (isEditing) {
                        return (
                          <InlineEditRow
                            key={coupon.id}
                            fields={fields}
                            initialValues={{
                              code: coupon.code,
                              discountType: coupon.type,
                              discountValue: coupon.value,
                              usageLimit: coupon.maxUses,
                              expiresAt: coupon.validTo,
                              isActive: coupon.isActive,
                            }}
                            onSave={async (values) => {
                              try {
                                await couponsService.update(
                                  coupon.id,
                                  values as any
                                );
                                setEditingId(null);
                                loadCoupons(fetchCoupons);
                              } catch (error: any) {
                                throw error;
                              }
                            }}
                            onCancel={() => {
                              setEditingId(null);
                            }}
                            resourceName="coupon"
                          />
                        );
                      }

                      return (
                        <tr key={coupon.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <TableCheckbox
                              checked={selectedCoupons.has(coupon.id)}
                              onChange={(checked) => {
                                const newSelected = new Set(selectedCoupons);
                                if (checked) {
                                  newSelected.add(coupon.id);
                                } else {
                                  newSelected.delete(coupon.id);
                                }
                                setSelectedCoupons(newSelected);
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {coupon.type === "percentage"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">
                            {formatDiscount(coupon)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {coupon.usageCount || 0} / {coupon.maxUses || "∞"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <DateDisplay date={coupon.validTo} format="short" />
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                coupon.isActive &&
                                new Date(coupon.validTo) > new Date()
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {coupon.isActive &&
                              new Date(coupon.validTo) > new Date()
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  router.push(`/admin/coupons/${coupon.id}`)
                                }
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setEditingId(coupon.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(coupon.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
