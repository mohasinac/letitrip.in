/**
 * Admin Coupon Management Page
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping" | "bogo";
  value: number;
  minimumAmount?: number;
  maximumAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
  createdAt: string;
  updatedAt: string;
}

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    loadCoupons();
  }, [user]);

  const loadCoupons = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/coupons", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.data?.coupons || []);
      } else {
        toast.error("Failed to load coupons");
      }
    } catch (error) {
      console.error("Load coupons error:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Coupon deleted successfully");
        loadCoupons();
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedCoupons.map((id) =>
          fetch(`/api/coupons/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );

      toast.success(`${selectedCoupons.length} coupons deleted successfully`);
      setSelectedCoupons([]);
      loadCoupons();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete coupons");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "expired":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeDisplay = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}% off`;
      case "fixed":
        return `₹${value} off`;
      case "free_shipping":
        return "Free shipping";
      case "bogo":
        return "Buy 1 Get 1";
      default:
        return type;
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || coupon.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="admin-layout py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Coupon Management
              </h1>
              <p className="text-secondary mt-2">
                Create and manage discount coupons
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/coupons/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Coupon
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-background rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {selectedCoupons.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <span className="text-sm text-blue-700">
                {selectedCoupons.length} coupon(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Coupons Table */}
        <div className="bg-background rounded-lg shadow-sm overflow-hidden">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No coupons found
              </h3>
              <p className="text-secondary mb-4">
                Create your first coupon to get started
              </p>
              <button
                onClick={() => router.push("/admin/coupons/new")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Coupon
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedCoupons.length === filteredCoupons.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCoupons(
                              filteredCoupons.map((c) => c.id)
                            );
                          } else {
                            setSelectedCoupons([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover: bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCoupons.includes(coupon.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCoupons([
                                ...selectedCoupons,
                                coupon.id,
                              ]);
                            } else {
                              setSelectedCoupons(
                                selectedCoupons.filter((id) => id !== coupon.id)
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-primary">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="ml-2 text-muted hover: text-secondary"
                            title="Copy code"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary">
                          {coupon.name}
                        </div>
                        {coupon.description && (
                          <div className="text-sm text-muted truncate max-w-xs">
                            {coupon.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-primary">
                          {getTypeDisplay(coupon.type, coupon.value)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary">
                          {coupon.usedCount} / {coupon.maxUses || "∞"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            coupon.status
                          )}`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/coupons/${coupon.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/coupons/${coupon.id}/edit`)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit coupon"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCouponToDelete(coupon.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete coupon"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-primary mb-4">
                Delete Coupon
              </h3>
              <p className="text-secondary mb-6">
                Are you sure you want to delete this coupon? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCouponToDelete(null);
                  }}
                  className="px-4 py-2 text-secondary border border-border rounded-md hover: bg-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (couponToDelete) {
                      handleDeleteCoupon(couponToDelete);
                    }
                    setShowDeleteModal(false);
                    setCouponToDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
