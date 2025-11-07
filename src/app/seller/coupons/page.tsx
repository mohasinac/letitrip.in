"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Copy, Eye } from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";

// TODO: Replace with real data from API
const mockCoupons = [
  {
    id: "1",
    code: "WELCOME10",
    type: "percentage",
    discount: 10,
    description: "Welcome discount for new customers",
    start_date: "2024-11-01",
    end_date: "2024-12-31",
    usage_limit: 100,
    usage_count: 45,
    status: "active",
    shop: "TechStore",
  },
  {
    id: "2",
    code: "FLASH500",
    type: "flat",
    discount: 500,
    description: "Flash sale discount",
    start_date: "2024-11-07",
    end_date: "2024-11-10",
    usage_limit: 50,
    usage_count: 12,
    status: "active",
    shop: "TechStore",
  },
  {
    id: "3",
    code: "EXPIRED20",
    type: "percentage",
    discount: 20,
    description: "Expired discount",
    start_date: "2024-10-01",
    end_date: "2024-10-31",
    usage_limit: 200,
    usage_count: 156,
    status: "expired",
    shop: "TechStore",
  },
];

export default function CouponsPage() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your discount coupons
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/seller/coupons/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search coupons..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-blue-50 px-3 py-1 text-lg font-mono font-bold text-blue-700">
                      {coupon.code}
                    </code>
                    <button
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                      title="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {coupon.description}
                  </p>
                </div>
                <StatusBadge status={coupon.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.type === "percentage"
                      ? `${coupon.discount}%`
                      : `₹${coupon.discount}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.usage_count} / {coupon.usage_limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(coupon.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/seller/coupons/${coupon.code}/edit`}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mockCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-blue-50 px-2 py-1 font-mono text-sm font-bold text-blue-700">
                          {coupon.code}
                        </code>
                        <button
                          className="rounded p-1 text-gray-600 hover:bg-gray-100"
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {coupon.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {coupon.type === "percentage"
                        ? `${coupon.discount}%`
                        : `₹${coupon.discount}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {coupon.usage_count} / {coupon.usage_limit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(coupon.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={coupon.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/seller/coupons/${coupon.code}/edit`}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Create Row */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Link
              href="/seller/coupons/create"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Coupon
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
