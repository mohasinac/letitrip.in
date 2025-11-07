"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FolderTree,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";

// TODO: Replace with real data from API (admin only)
const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    parent_id: null,
    level: 0,
    product_count: 245,
    status: "active",
    featured: true,
    homepage_display: true,
    image: "/placeholder-category.jpg",
  },
  {
    id: "2",
    name: "Smartphones",
    slug: "smartphones",
    parent_id: "1",
    level: 1,
    product_count: 89,
    status: "active",
    featured: false,
    homepage_display: false,
    image: "/placeholder-category.jpg",
  },
  {
    id: "3",
    name: "Gaming",
    slug: "gaming",
    parent_id: null,
    level: 0,
    product_count: 156,
    status: "active",
    featured: true,
    homepage_display: true,
    image: "/placeholder-category.jpg",
  },
];

export default function CategoriesPage() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories (Admin Only)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search categories..."
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockCategories.map((category) => (
            <div
              key={category.id}
              className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Level {category.level}
                    </p>
                  </div>
                  <StatusBadge status={category.status} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {category.featured && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Featured
                    </span>
                  )}
                  {category.homepage_display && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Homepage
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">{category.product_count}</span>{" "}
                  products
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/categories/${category.slug}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View
                  </Link>
                </div>
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mockCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full rounded object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            /{category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.product_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={category.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {category.featured && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Featured
                          </span>
                        )}
                        {category.homepage_display && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Homepage
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/categories/${category.slug}`}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/categories/${category.slug}/edit`}
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
              href="/admin/categories/create"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
