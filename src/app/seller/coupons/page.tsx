"use client";

import { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { Coupon } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export default function SellerCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");

  useEffect(() => {
    if (user) {
      loadCoupons();
    }
  }, [user, filter]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, fetch from API
      const mockCoupons: Coupon[] = [
        {
          id: "1",
          code: "SAVE20",
          name: "Save 20%",
          description: "Get 20% off on all products",
          type: "percentage",
          value: 20,
          minimumAmount: 100,
          maximumAmount: 500,
          maxUses: 100,
          maxUsesPerUser: 1,
          usedCount: 25,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          combinable: false,
          priority: 1,
          createdBy: user?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          code: "FLAT50",
          name: "Flat ₹50 Off",
          description: "Get flat ₹50 off on orders above ₹200",
          type: "fixed",
          value: 50,
          minimumAmount: 200,
          maxUses: 50,
          maxUsesPerUser: 2,
          usedCount: 18,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          combinable: true,
          priority: 2,
          createdBy: user?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          code: "FREESHIP",
          name: "Free Shipping",
          description: "Free shipping on all orders",
          type: "free_shipping",
          value: 0,
          minimumAmount: 50,
          maxUses: 200,
          maxUsesPerUser: 5,
          usedCount: 78,
          startDate: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "expired",
          combinable: true,
          priority: 3,
          createdBy: user?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const filteredCoupons =
        filter === "all"
          ? mockCoupons
          : mockCoupons.filter((coupon) => {
              if (filter === "expired") {
                return new Date(coupon.endDate) < new Date();
              }
              return coupon.status === filter;
            });

      setCoupons(filteredCoupons);
    } catch (error) {
      console.error("Error loading coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      setCoupons(coupons.filter((c) => c.id !== couponId));
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    setCoupons(
      coupons.map((c) =>
        c.id === couponId
          ? {
              ...c,
              status:
                c.status === "active"
                  ? "inactive"
                  : ("active" as "active" | "inactive"),
            }
          : c
      )
    );
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (new Date(coupon.endDate) < new Date()) {
      return "bg-red-100 text-red-800";
    }
    if (coupon.status === "active") {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (coupon: Coupon) => {
    if (new Date(coupon.endDate) < new Date()) {
      return "Expired";
    }
    return coupon.status === "active" ? "Active" : "Inactive";
  };

  const getCouponTypeText = (type: string) => {
    switch (type) {
      case "percentage":
        return "%";
      case "fixed":
        return "₹";
      case "free_shipping":
        return "Free Ship";
      case "bogo":
        return "BOGO";
      default:
        return type;
    }
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Coupons & Promotions
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage discount codes for your customers
              </p>
            </div>
            <Link
              href="/seller/coupons/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Coupon
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "All Coupons" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
              { key: "expired", label: "Expired" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No coupons found.</p>
            <Link
              href="/seller/coupons/new"
              className="text-blue-600 hover:text-blue-500"
            >
              Create your first coupon
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white shadow rounded-lg border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <TagIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {coupon.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        coupon
                      )}`}
                    >
                      {getStatusText(coupon)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {coupon.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Discount</p>
                      <p className="font-semibold">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : coupon.type === "fixed"
                          ? `₹${coupon.value}`
                          : coupon.type === "free_shipping"
                          ? "Free Shipping"
                          : "BOGO"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Usage</p>
                      <p className="font-semibold">
                        {coupon.usedCount}/{coupon.maxUses || "∞"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Usage Progress</span>
                      <span>
                        {Math.round(
                          (coupon.usedCount / (coupon.maxUses || 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (coupon.usedCount / (coupon.maxUses || 1)) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>
                      Valid until{" "}
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                    <span>Min: ₹{coupon.minimumAmount || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          coupon.status === "active"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {coupon.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                    <div className="flex space-x-1">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-600 p-1">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
