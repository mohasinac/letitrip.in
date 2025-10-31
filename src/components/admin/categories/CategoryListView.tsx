"use client";

import React, { useMemo, useState } from "react";
import { Edit, Trash2, Eye, EyeOff, Search, Database } from "lucide-react";
import type { Category } from "@/types";

interface CategoryListViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryListView({
  categories,
  onEdit,
  onDelete,
}: CategoryListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories]
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [categories, searchTerm]
  );

  const sortedCategories = useMemo(
    () =>
      [...filteredCategories].sort((a, b) => {
        const aMinLevel = a.minLevel !== undefined ? a.minLevel : 0;
        const bMinLevel = b.minLevel !== undefined ? b.minLevel : 0;
        if (aMinLevel !== bMinLevel) return aMinLevel - bMinLevel;
        return a.sortOrder - b.sortOrder;
      }),
    [filteredCategories]
  );

  const paginatedCategories = useMemo(
    () =>
      sortedCategories.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [sortedCategories, page, rowsPerPage]
  );

  const getParentInfo = (
    category: Category
  ): { names: string[]; slugs: string[] } => {
    if (!category.parentIds || category.parentIds.length === 0) {
      return { names: ["—"], slugs: [] };
    }

    const names = category.parentIds
      .map((pid) => categoryMap.get(pid)?.name)
      .filter(Boolean) as string[];

    const slugs = category.parentSlugs || [];

    return {
      names: names.length > 0 ? names : ["Unknown"],
      slugs,
    };
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setPage(0);
  };

  const totalPages = Math.ceil(sortedCategories.length / rowsPerPage);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Parent
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Level
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Products
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {getParentInfo(category).names.map((name, idx) => (
                        <div key={idx}>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {name}
                          </div>
                          {getParentInfo(category).slugs[idx] && (
                            <code className="text-xs text-gray-500 dark:text-gray-400">
                              {getParentInfo(category).slugs[idx]}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
                      title={`Min Level: ${
                        category.minLevel || 0
                      }, Max Level: ${category.maxLevel || 0}`}
                    >
                      {category.minLevel || 0}-{category.maxLevel || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className="inline-flex items-center justify-center relative cursor-pointer"
                      title={`${category.inStockCount || 0} in stock, ${
                        category.outOfStockCount || 0
                      } out of stock`}
                    >
                      <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      {(category.productCount || 0) > 0 && (
                        <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {category.productCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center justify-center">
                      {category.featured && (
                        <span className="px-2 py-1 text-xs border border-blue-500 text-blue-600 dark:text-blue-400 rounded">
                          Featured
                        </span>
                      )}
                      {category.isActive ? (
                        <span title="Active">
                          <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </span>
                      ) : (
                        <span title="Inactive">
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Rows per page:
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleChangeRowsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {page * rowsPerPage + 1}-
              {Math.min((page + 1) * rowsPerPage, sortedCategories.length)} of{" "}
              {sortedCategories.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
