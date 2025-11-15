"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  BulkActionBar,
  TableCheckbox,
  InlineEditRow,
  QuickCreateRow,
} from "@/components/common/inline-edit";
import { COUPON_FILTERS } from "@/constants/filters";
import { getCouponBulkActions } from "@/constants/bulk-actions";
import { couponsService } from "@/services/coupons.service";
import {
  COUPON_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";
// TODO: Add toast notifications when library is configured
import { Eye, Edit, Trash2, Plus, Copy } from "lucide-react";

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get inline fields for table context
  const fields = toInlineFields(getFieldsForContext(COUPON_FIELDS, "table"));

  useEffect(() => {
    loadCoupons();
  }, [filterValues, currentPage]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponsService.list({
        ...filterValues,
        page: currentPage,
        limit: 20,
      });
      setCoupons(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCoupons(response.total || 0);
    } catch (error: any) {
      // toast.error(error.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

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
          // toast.success(`${couponIds.length} coupons activated`);
          break;
        case "deactivate":
          await Promise.all(
            couponIds.map((id) =>
              couponsService.update(id, { is_active: false } as any)
            )
          );
          // toast.success(`${couponIds.length} coupons deactivated`);
          break;
        case "delete":
          if (!confirm(`Delete ${couponIds.length} coupons?`)) return;
          await Promise.all(couponIds.map((id) => couponsService.delete(id)));
          // toast.success(`${couponIds.length} coupons deleted`);
          break;
      }

      setSelectedCoupons(new Set());
      loadCoupons();
    } catch (error: any) {
      // toast.error(error.message || "Bulk action failed");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // toast.success("Coupon code copied");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    try {
      await couponsService.delete(id);
      // toast.success("Coupon deleted");
      loadCoupons();
    } catch (error: any) {
      // toast.error(error.message || "Failed to delete coupon");
    }
  };

  const toggleSelectAll = () => {
    if (selectedCoupons.size === coupons.length) {
      setSelectedCoupons(new Set());
    } else {
      setSelectedCoupons(new Set(coupons.map((c) => c.id)));
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
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalCoupons}
            isLoading={loading}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Coupons</div>
                <div className="text-2xl font-bold">{totalCoupons}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter((c) => c.isActive).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Expired</div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    coupons.filter((c) => new Date(c.validTo) < new Date())
                      .length
                  }
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Uses</div>
                <div className="text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedCoupons.size > 0 && (
              <BulkActionBar
                selectedCount={selectedCoupons.size}
                actions={bulkActions}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedCoupons(new Set())}
              />
            )}

            {/* Coupons Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : coupons.length === 0 ? (
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
                          checked={selectedCoupons.size === coupons.length}
                          indeterminate={
                            selectedCoupons.size > 0 &&
                            selectedCoupons.size < coupons.length
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
                          loadCoupons();
                        } catch (error: any) {
                          throw error;
                        }
                      }}
                      resourceName="coupon"
                    />
                    {coupons.map((coupon) => {
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
                                loadCoupons();
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
                            {new Date(coupon.validTo).toLocaleDateString()}
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
