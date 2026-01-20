"use client";

import Link from "next/link";
import React, { useState } from "react";

/**
 * Admin Coupons Page
 *
 * Global coupon management interface for admins with:
 * - All coupons (global + shop-specific)
 * - CRUD operations (create, edit, delete)
 * - Coupon code generation
 * - Discount type management (percentage/fixed)
 * - Expiry date tracking
 * - Usage limits and counts
 * - Active/inactive status
 * - Shop assignment
 * - Grid/Table view toggle
 *
 * Features:
 * - Search by coupon code or description
 * - Filter by type (global/shop-specific), status, discount type
 * - Sort by various criteria
 * - Create new coupons with modal form
 * - Inline edit for quick updates
 * - Bulk activate/deactivate/delete
 * - Usage statistics
 *
 * @example
 * ```tsx
 * // Route: /admin/coupons
 * <AdminCouponsPage />
 * ```
 */

// Types
interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isGlobal: boolean;
  shopName?: string;
  shopId?: string;
  status: "active" | "inactive" | "expired";
  expiresAt: Date;
  createdAt: Date;
}

// Mock data
const MOCK_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "WELCOME50",
    description: "Welcome discount for new users",
    discountType: "percentage",
    discountValue: 50,
    minOrderValue: 999,
    maxDiscount: 500,
    usageLimit: 1000,
    usedCount: 342,
    isGlobal: true,
    status: "active",
    expiresAt: new Date("2026-12-31"),
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "2",
    code: "SAVE100",
    description: "Flat ₹100 off on orders above ₹500",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 500,
    usageLimit: 500,
    usedCount: 234,
    isGlobal: true,
    status: "active",
    expiresAt: new Date("2026-06-30"),
    createdAt: new Date("2026-01-05"),
  },
  {
    id: "3",
    code: "ANTIQUE20",
    description: "20% off on antiques",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 1000,
    maxDiscount: 1000,
    usageLimit: 100,
    usedCount: 45,
    isGlobal: false,
    shopName: "Antique Paradise",
    shopId: "shop1",
    status: "active",
    expiresAt: new Date("2026-03-31"),
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "4",
    code: "NEWYEAR2026",
    description: "New Year special discount",
    discountType: "percentage",
    discountValue: 30,
    minOrderValue: 1500,
    maxDiscount: 750,
    usageLimit: 2000,
    usedCount: 1890,
    isGlobal: true,
    status: "expired",
    expiresAt: new Date("2026-01-15"),
    createdAt: new Date("2025-12-20"),
  },
  {
    id: "5",
    code: "ETHNIC15",
    description: "15% off on ethnic wear",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 800,
    maxDiscount: 500,
    usageLimit: 50,
    usedCount: 12,
    isGlobal: false,
    shopName: "Ethnic Treasures",
    shopId: "shop2",
    status: "inactive",
    expiresAt: new Date("2026-02-28"),
    createdAt: new Date("2026-01-08"),
  },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Code (A-Z)", value: "code_asc" },
  { label: "Most Used", value: "usage_desc" },
  { label: "Expiring Soon", value: "expiry_asc" },
];

// Extract unique shops
const SHOPS = Array.from(
  new Set(
    MOCK_COUPONS.filter((c) => !c.isGlobal && c.shopId).map((c) => ({
      id: c.shopId!,
      name: c.shopName!,
    })),
  ),
);

export default function AdminCouponsPage() {
  // State
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(
    new Set(),
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string>("all"); // all, global, shop
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // all, percentage, fixed
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Form states
  const [addForm, setAddForm] = useState<Partial<Coupon>>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    usageLimit: 100,
    isGlobal: true,
    status: "active",
  });

  const [editForm, setEditForm] = useState<Partial<Coupon>>({});

  // Filter and sort coupons
  const filteredCoupons = coupons
    .filter((coupon) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          coupon.code.toLowerCase().includes(query) ||
          coupon.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((coupon) => {
      // Scope filter
      if (scopeFilter === "global") return coupon.isGlobal;
      if (scopeFilter === "shop") return !coupon.isGlobal;
      return true;
    })
    .filter((coupon) => {
      // Status filter
      if (statusFilter === "all") return true;
      return coupon.status === statusFilter;
    })
    .filter((coupon) => {
      // Type filter
      if (typeFilter === "all") return true;
      return coupon.discountType === typeFilter;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "date_asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "date_desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "code_asc":
          return a.code.localeCompare(b.code);
        case "usage_desc":
          return b.usedCount - a.usedCount;
        case "expiry_asc":
          return a.expiresAt.getTime() - b.expiresAt.getTime();
        default:
          return 0;
      }
    });

  // Update expired status
  React.useEffect(() => {
    const now = new Date();
    const updatedCoupons = coupons.map((c) => {
      if (c.expiresAt < now && c.status !== "expired") {
        return { ...c, status: "expired" as const };
      }
      return c;
    });
    if (JSON.stringify(updatedCoupons) !== JSON.stringify(coupons)) {
      setCoupons(updatedCoupons);
    }
  }, [coupons]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredCoupons.map((c) => c.id));
      setSelectedCoupons(allIds);
    } else {
      setSelectedCoupons(new Set());
    }
  };

  // Handle individual selection
  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    const newSelection = new Set(selectedCoupons);
    if (checked) {
      newSelection.add(couponId);
    } else {
      newSelection.delete(couponId);
    }
    setSelectedCoupons(newSelection);
  };

  // Handle add coupon
  const handleAddCoupon = () => {
    if (!addForm.code || !addForm.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newCoupon: Coupon = {
      id: `${coupons.length + 1}`,
      code: addForm.code!.toUpperCase(),
      description: addForm.description!,
      discountType: addForm.discountType || "percentage",
      discountValue: addForm.discountValue || 0,
      minOrderValue: addForm.minOrderValue || 0,
      maxDiscount: addForm.maxDiscount,
      usageLimit: addForm.usageLimit || 100,
      usedCount: 0,
      isGlobal: addForm.isGlobal || true,
      shopName: addForm.shopName,
      shopId: addForm.shopId,
      status: "active",
      expiresAt:
        addForm.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    setCoupons([...coupons, newCoupon]);
    setShowAddModal(false);
    setAddForm({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      usageLimit: 100,
      isGlobal: true,
      status: "active",
    });
  };

  // Handle start edit
  const handleStartEdit = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon) {
      setEditingCoupon(couponId);
      setEditForm(coupon);
    }
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingCoupon) return;

    const updatedCoupons = coupons.map((c) =>
      c.id === editingCoupon ? { ...c, ...editForm } : c,
    );
    setCoupons(updatedCoupons);
    setEditingCoupon(null);
    setEditForm({});
  };

  // Handle delete
  const handleDelete = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon && coupon.usedCount > 0) {
      if (
        !confirm(
          `This coupon has been used ${coupon.usedCount} times. Are you sure you want to delete it?`,
        )
      ) {
        return;
      }
    }
    setCoupons(coupons.filter((c) => c.id !== couponId));
  };

  // Handle bulk activate
  const handleBulkActivate = () => {
    const updatedCoupons = coupons.map((c) =>
      selectedCoupons.has(c.id) && c.status !== "expired"
        ? { ...c, status: "active" as const }
        : c,
    );
    setCoupons(updatedCoupons);
    setSelectedCoupons(new Set());
  };

  // Handle bulk deactivate
  const handleBulkDeactivate = () => {
    const updatedCoupons = coupons.map((c) =>
      selectedCoupons.has(c.id) ? { ...c, status: "inactive" as const } : c,
    );
    setCoupons(updatedCoupons);
    setSelectedCoupons(new Set());
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedCoupons.size} coupon(s)?`)) return;
    setCoupons(coupons.filter((c) => !selectedCoupons.has(c.id)));
    setSelectedCoupons(new Set());
  };

  // Handle search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchQuery);
    }
  };

  const allSelected =
    filteredCoupons.length > 0 &&
    selectedCoupons.size === filteredCoupons.length;
  const someSelected =
    selectedCoupons.size > 0 && selectedCoupons.size < filteredCoupons.length;

  // Get status badge
  const getStatusBadge = (status: Coupon["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
      case "expired":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    }
  };

  // Get discount display
  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% off${
        coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""
      }`;
    }
    return `₹${coupon.discountValue} off`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Reusable Admin Navigation */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System Management
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Users
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Products
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Categories
          </Link>

          <Link
            href="/admin/auctions"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Auctions
          </Link>

          <Link
            href="/admin/shops"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Shops
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Orders
          </Link>

          <Link
            href="/admin/coupons"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Coupons
          </Link>

          <Link
            href="/admin/blogs"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Blogs
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coupons Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredCoupons.length} coupon(s)
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Coupon
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedCoupons.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {selectedCoupons.size} coupon(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkActivate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Activate
                  </button>
                  <button
                    onClick={handleBulkDeactivate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              {/* Row 1: Search + View Toggle */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search coupons
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by coupon code or description (press Enter)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg border ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    } transition-colors`}
                    title="Table View"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg border ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    } transition-colors`}
                    title="Grid View"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Row 2: Filters */}
              <div className="flex flex-wrap gap-4">
                {/* Scope Filter */}
                <div>
                  <label htmlFor="scope-filter" className="sr-only">
                    Filter by scope
                  </label>
                  <select
                    id="scope-filter"
                    value={scopeFilter}
                    onChange={(e) => setScopeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Coupons</option>
                    <option value="global">Global Only</option>
                    <option value="shop">Shop-Specific Only</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="status-filter" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label htmlFor="type-filter" className="sr-only">
                    Filter by discount type
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="sort" className="sr-only">
                    Sort by
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = someSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Scope
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCoupons.map((coupon) => {
                      const isSelected = selectedCoupons.has(coupon.id);
                      const isEditing = editingCoupon === coupon.id;

                      return (
                        <tr
                          key={coupon.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectCoupon(coupon.id, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.code || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    code: e.target.value.toUpperCase(),
                                  })
                                }
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <div>
                                <div className="font-mono font-bold text-gray-900 dark:text-white">
                                  {coupon.code}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {coupon.description}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {getDiscountDisplay(coupon)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Min: ₹{coupon.minOrderValue}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {coupon.usedCount} / {coupon.usageLimit}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (coupon.usedCount / coupon.usageLimit) *
                                        100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {coupon.isGlobal ? "Global" : "Shop-Specific"}
                              </div>
                              {!coupon.isGlobal && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {coupon.shopName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                  coupon.status,
                                )}`}
                              >
                                {coupon.status}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Expires:{" "}
                                {coupon.expiresAt.toLocaleDateString("en-IN")}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                    title="Save"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingCoupon(null);
                                      setEditForm({});
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(coupon.id)}
                                    className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredCoupons.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No coupons found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoupons.map((coupon) => {
                const isSelected = selectedCoupons.has(coupon.id);
                const usagePercent = Math.min(
                  (coupon.usedCount / coupon.usageLimit) * 100,
                  100,
                );

                return (
                  <div
                    key={coupon.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                      isSelected
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-700"
                    } overflow-hidden hover:shadow-md transition-shadow p-6`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectCoupon(coupon.id, e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          coupon.status,
                        )}`}
                      >
                        {coupon.status}
                      </span>
                    </div>

                    {/* Coupon Code */}
                    <div className="mb-4">
                      <div className="font-mono text-2xl font-bold text-gray-900 dark:text-white">
                        {coupon.code}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {coupon.description}
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                        {getDiscountDisplay(coupon)}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Min Order: ₹{coupon.minOrderValue}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Usage
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Scope & Expiry */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Scope
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.isGlobal ? "Global" : coupon.shopName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Expires
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.expiresAt.toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleStartEdit(coupon.id)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredCoupons.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No coupons found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Coupon
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Coupon Code */}
              <div>
                <label
                  htmlFor="add-code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Coupon Code *
                </label>
                <input
                  id="add-code"
                  type="text"
                  value={addForm.code || ""}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., SAVE50"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="add-desc"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description *
                </label>
                <input
                  id="add-desc"
                  type="text"
                  value={addForm.description || ""}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                  placeholder="e.g., Get 50% off on your first order"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="add-type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Discount Type
                  </label>
                  <select
                    id="add-type"
                    value={addForm.discountType || "percentage"}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="add-value"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Discount Value
                  </label>
                  <input
                    id="add-value"
                    type="number"
                    value={addForm.discountValue || 0}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        discountValue: Number(e.target.value),
                      })
                    }
                    placeholder={
                      addForm.discountType === "percentage" ? "10" : "100"
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="add-min"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Min Order Value (₹)
                  </label>
                  <input
                    id="add-min"
                    type="number"
                    value={addForm.minOrderValue || 0}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {addForm.discountType === "percentage" && (
                  <div>
                    <label
                      htmlFor="add-max"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Max Discount (₹)
                    </label>
                    <input
                      id="add-max"
                      type="number"
                      value={addForm.maxDiscount || ""}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          maxDiscount: Number(e.target.value) || undefined,
                        })
                      }
                      placeholder="1000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label
                  htmlFor="add-limit"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Usage Limit
                </label>
                <input
                  id="add-limit"
                  type="number"
                  value={addForm.usageLimit || 100}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label
                  htmlFor="add-expiry"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Expiry Date
                </label>
                <input
                  id="add-expiry"
                  type="date"
                  value={
                    addForm.expiresAt
                      ? addForm.expiresAt.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      expiresAt: new Date(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scope
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={addForm.isGlobal === true}
                      onChange={() =>
                        setAddForm({
                          ...addForm,
                          isGlobal: true,
                          shopId: undefined,
                          shopName: undefined,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Global (All Shops)
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={addForm.isGlobal === false}
                      onChange={() =>
                        setAddForm({ ...addForm, isGlobal: false })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Shop-Specific
                    </span>
                  </label>
                </div>
              </div>

              {/* Shop Selection (if shop-specific) */}
              {addForm.isGlobal === false && (
                <div>
                  <label
                    htmlFor="add-shop"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Select Shop
                  </label>
                  <select
                    id="add-shop"
                    value={addForm.shopId || ""}
                    onChange={(e) => {
                      const shop = SHOPS.find((s) => s.id === e.target.value);
                      setAddForm({
                        ...addForm,
                        shopId: shop?.id,
                        shopName: shop?.name,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a shop</option>
                    {SHOPS.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCoupon}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
