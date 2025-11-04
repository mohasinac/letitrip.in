"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Database,
  Search,
} from "lucide-react";
import type { Category } from "@/types/shared";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

interface CategoryNodeProps {
  category: Category;
  allCategories: Category[];
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  searchTerm?: string;
}

function CategoryNode({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
  searchTerm = "",
}: CategoryNodeProps) {
  const [expanded, setExpanded] = React.useState(true);

  const children = useMemo(
    () => allCategories.filter((cat) => cat.parentIds?.includes(category.id)),
    [allCategories, category.id]
  );

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return children;
    return children.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [children, searchTerm]);

  const hasChildren = filteredChildren.length > 0;

  // Check if current category or any descendant matches search
  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const directMatch =
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower);

    if (directMatch) return true;

    // Check if any descendant matches
    const hasMatchingDescendant = (cats: Category[]): boolean => {
      return cats.some((cat) => {
        const matches =
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower);
        if (matches) return true;

        const subChildren = allCategories.filter((c) =>
          c.parentIds?.includes(cat.id)
        );
        return hasMatchingDescendant(subChildren);
      });
    };

    return hasMatchingDescendant(children);
  }, [category, searchTerm, children, allCategories]);

  // Auto-expand if search is active and has matching descendants
  React.useEffect(() => {
    if (searchTerm && hasChildren) {
      setExpanded(true);
    }
  }, [searchTerm, hasChildren]);

  if (!matchesSearch) return null;

  return (
    <>
      <tr
        className={`${
          level % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-50 dark:bg-gray-700"
        } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
      >
        <td
          className="py-3 border-b border-gray-200 dark:border-gray-700"
          style={{ paddingLeft: `${level * 32 + 16}px`, width: "40%" }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-8" />
            )}
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

        {/* Slug */}
        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {category.slug}
        </td>

        {/* Products */}
        <td className="py-3 px-4 text-center border-b border-gray-200 dark:border-gray-700">
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

        {/* Status */}
        <td className="py-3 px-4 text-center border-b border-gray-200 dark:border-gray-700">
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

        {/* Actions */}
        <td
          className="py-3 px-4 text-right border-b border-gray-200 dark:border-gray-700"
          style={{ width: "15%" }}
        >
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

      {/* Children */}
      {hasChildren && expanded && (
        <>
          {filteredChildren.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              searchTerm={searchTerm}
            />
          ))}
        </>
      )}
    </>
  );
}

export default function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const rootCategories = useMemo(
    () =>
      categories
        .filter((cat) => !cat.parentIds || cat.parentIds.length === 0)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  style={{ width: "40%" }}
                >
                  Category Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Slug
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Products
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white"
                  style={{ width: "15%" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rootCategories.map((category) => (
                <CategoryNode
                  key={category.id}
                  category={category}
                  allCategories={categories}
                  level={0}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  searchTerm={searchTerm}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
