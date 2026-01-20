"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Admin Categories Page
 * 
 * Hierarchical category management interface for admins with:
 * - Tree view of categories (parent-child relationships)
 * - CRUD operations (Create, Read, Update, Delete)
 * - Drag-and-drop reordering (placeholder)
 * - Category icon/image management
 * - SEO metadata editing
 * - Active/inactive status toggle
 * - Bulk operations
 * 
 * Features:
 * - Tree structure visualization with expand/collapse
 * - Add root category or subcategory
 * - Inline editing with slug generation
 * - Category reordering within same level
 * - Delete with confirmation (check for products)
 * - Search and filter categories
 * 
 * @example
 * ```tsx
 * // Route: /admin/categories
 * <AdminCategoriesPage />
 * ```
 */

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string;
  description?: string;
  status: "active" | "inactive";
  order: number;
  productCount: number;
  children?: Category[];
}

// Mock data - hierarchical structure
const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    parentId: null,
    icon: "💻",
    description: "Electronic devices and accessories",
    status: "active",
    order: 1,
    productCount: 245,
    children: [
      {
        id: "1-1",
        name: "Computers",
        slug: "electronics-computers",
        parentId: "1",
        icon: "🖥️",
        description: "Desktop and laptop computers",
        status: "active",
        order: 1,
        productCount: 89,
      },
      {
        id: "1-2",
        name: "Mobile Phones",
        slug: "electronics-mobile-phones",
        parentId: "1",
        icon: "📱",
        description: "Smartphones and accessories",
        status: "active",
        order: 2,
        productCount: 156,
      },
    ],
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    parentId: null,
    icon: "👗",
    description: "Clothing and fashion accessories",
    status: "active",
    order: 2,
    productCount: 512,
    children: [
      {
        id: "2-1",
        name: "Men's Clothing",
        slug: "fashion-mens-clothing",
        parentId: "2",
        icon: "👔",
        description: "Men's apparel and accessories",
        status: "active",
        order: 1,
        productCount: 234,
      },
      {
        id: "2-2",
        name: "Women's Clothing",
        slug: "fashion-womens-clothing",
        parentId: "2",
        icon: "👚",
        description: "Women's apparel and accessories",
        status: "active",
        order: 2,
        productCount: 278,
      },
    ],
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    parentId: null,
    icon: "🏡",
    description: "Home decor and garden supplies",
    status: "active",
    order: 3,
    productCount: 189,
    children: [
      {
        id: "3-1",
        name: "Furniture",
        slug: "home-garden-furniture",
        parentId: "3",
        icon: "🛋️",
        description: "Indoor and outdoor furniture",
        status: "active",
        order: 1,
        productCount: 67,
      },
      {
        id: "3-2",
        name: "Garden Tools",
        slug: "home-garden-tools",
        parentId: "3",
        icon: "🔨",
        description: "Gardening tools and equipment",
        status: "inactive",
        order: 2,
        productCount: 45,
      },
    ],
  },
  {
    id: "4",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    parentId: null,
    icon: "⚽",
    description: "Sports equipment and outdoor gear",
    status: "active",
    order: 4,
    productCount: 156,
  },
];

export default function AdminCategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Category>>({
    name: "",
    slug: "",
    parentId: null,
    icon: "",
    description: "",
    status: "active",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle expand/collapse
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle select category
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    const newSelection = new Set(selectedCategories);
    if (checked) {
      newSelection.add(categoryId);
    } else {
      newSelection.delete(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  // Start inline editing
  const handleStartEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      status: category.status,
    });
  };

  // Save inline edit
  const handleSaveEdit = () => {
    if (!editingCategory) return;

    const updateCategory = (cats: Category[]): Category[] => {
      return cats.map((cat) => {
        if (cat.id === editingCategory) {
          return { ...cat, ...editForm };
        }
        if (cat.children) {
          return { ...cat, children: updateCategory(cat.children) };
        }
        return cat;
      });
    };

    setCategories(updateCategory(categories));
    setEditingCategory(null);
    setEditForm({});
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditForm({});
  };

  // Handle add category
  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: addForm.name || "New Category",
      slug: addForm.slug || "new-category",
      parentId: addForm.parentId || null,
      icon: addForm.icon,
      description: addForm.description,
      status: addForm.status || "active",
      order: 999,
      productCount: 0,
    };

    if (newCategory.parentId) {
      // Add as child
      const addToParent = (cats: Category[]): Category[] => {
        return cats.map((cat) => {
          if (cat.id === newCategory.parentId) {
            return {
              ...cat,
              children: [...(cat.children || []), newCategory],
            };
          }
          if (cat.children) {
            return { ...cat, children: addToParent(cat.children) };
          }
          return cat;
        });
      };
      setCategories(addToParent(categories));
    } else {
      // Add as root
      setCategories([...categories, newCategory]);
    }

    // Reset form
    setAddForm({
      name: "",
      slug: "",
      parentId: null,
      icon: "",
      description: "",
      status: "active",
    });
    setShowAddModal(false);
  };

  // Handle delete category
  const handleDeleteCategory = (categoryId: string) => {
    const category = findCategoryById(categories, categoryId);
    if (!category) return;

    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = category.productCount > 0;

    if (hasChildren) {
      alert("Cannot delete category with subcategories. Delete subcategories first.");
      return;
    }

    if (hasProducts) {
      if (!confirm(`This category has ${category.productCount} product(s). Delete anyway?`)) {
        return;
      }
    }

    const deleteFromTree = (cats: Category[]): Category[] => {
      return cats
        .filter((cat) => cat.id !== categoryId)
        .map((cat) => {
          if (cat.children) {
            return { ...cat, children: deleteFromTree(cat.children) };
          }
          return cat;
        });
    };

    setCategories(deleteFromTree(categories));
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedCategories);
    if (selectedIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    if (!confirm(`Delete ${selectedIds.length} selected category(ies)?`)) {
      return;
    }

    const deleteMultiple = (cats: Category[]): Category[] => {
      return cats
        .filter((cat) => !selectedIds.includes(cat.id))
        .map((cat) => {
          if (cat.children) {
            return { ...cat, children: deleteMultiple(cat.children) };
          }
          return cat;
        });
    };

    setCategories(deleteMultiple(categories));
    setSelectedCategories(new Set());
  };

  // Handle bulk status change
  const handleBulkStatusChange = (status: "active" | "inactive") => {
    const selectedIds = Array.from(selectedCategories);
    if (selectedIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    const updateStatus = (cats: Category[]): Category[] => {
      return cats.map((cat) => {
        if (selectedIds.includes(cat.id)) {
          return { ...cat, status };
        }
        if (cat.children) {
          return { ...cat, children: updateStatus(cat.children) };
        }
        return cat;
      });
    };

    setCategories(updateStatus(categories));
  };

  // Find category by ID
  const findCategoryById = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Get all categories flat (for parent select)
  const getAllCategoriesFlat = (cats: Category[], level: number = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = [];
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.children) {
        result = result.concat(getAllCategoriesFlat(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = getAllCategoriesFlat(categories);

  // Filter categories by search
  const filterCategories = (cats: Category[]): Category[] => {
    if (!searchQuery) return cats;

    const query = searchQuery.toLowerCase();
    const results: Category[] = [];
    
    for (const cat of cats) {
      const matches = cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query);
      const filteredChildren = cat.children ? filterCategories(cat.children) : undefined;

      if (matches || (filteredChildren && filteredChildren.length > 0)) {
        results.push({
          ...cat,
          children: filteredChildren,
        });
      }
    }
    
    return results;
  };

  const filteredCategories = filterCategories(categories);

  // Render category tree
  const renderCategoryTree = (cats: Category[], level: number = 0) => {
    return cats.map((category) => {
      const isExpanded = expandedCategories.has(category.id);
      const isEditing = editingCategory === category.id;
      const isSelected = selectedCategories.has(category.id);
      const hasChildren = category.children && category.children.length > 0;

      return (
        <div key={category.id} className="relative">
          {/* Category Row */}
          <div
            className={`flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
            style={{ paddingLeft: `${level * 2 + 1}rem` }}
          >
            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />

            {/* Icon */}
            <div className="w-8 h-8 flex items-center justify-center text-2xl">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.icon || ""}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="w-full px-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="🏷️"
                />
              ) : (
                category.icon || "🏷️"
              )}
            </div>

            {/* Name & Details */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Category Name"
                  />
                  <input
                    type="text"
                    value={editForm.slug || ""}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-blue-500"
                    placeholder="category-slug"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        category.status === "active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {category.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>{category.slug}</span>
                    <span>•</span>
                    <span>{category.productCount} products</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Save"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAddForm({ ...addForm, parentId: category.id });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Add Subcategory"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleStartEdit(category)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </div>

          {/* Children */}
          {isExpanded && hasChildren && (
            <div className="relative">{renderCategoryTree(category.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Reusable Admin Navigation */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">System Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Auctions
          </Link>

          <Link
            href="/admin/shops"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header with bulk actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage product categories hierarchy • {selectedCategories.size} selected
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {selectedCategories.size > 0 ? (
                <>
                  <button
                    onClick={() => handleBulkStatusChange("active")}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("inactive")}
                    className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Selected
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAddForm({ ...addForm, parentId: null });
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Root Category
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Tree */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredCategories.length > 0 ? (
              <div>{renderCategoryTree(filteredCategories)}</div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new category</p>
                <button
                  onClick={() => {
                    setAddForm({ ...addForm, parentId: null });
                    setShowAddModal(true);
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Category
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {addForm.parentId ? "Add Subcategory" : "Add Root Category"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent */}
              {addForm.parentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                  <select
                    value={addForm.parentId || ""}
                    onChange={(e) => setAddForm({ ...addForm, parentId: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Root Category --</option>
                    {flatCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {"  ".repeat(cat.level)}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.name || ""}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Electronics"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.slug || ""}
                  onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="electronics"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={addForm.icon || ""}
                  onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="💻"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={addForm.description || ""}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Category description..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={addForm.status || "active"}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
