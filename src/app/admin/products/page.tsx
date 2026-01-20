"use client";

import Link from "next/link";
import React, { useState } from "react";

/**
 * Admin Products Page
 *
 * Global product management interface for admins with:
 * - All products across all shops and sellers
 * - Approval workflow (pending/approved/rejected)
 * - Shop and seller filtering
 * - Inline editing with admin override
 * - Bulk approval and rejection
 * - Product detail view with seller info
 * - Grid/Table view toggle
 *
 * Features:
 * - Search by product name, SKU, or category
 * - Filter by shop, seller, approval status, category
 * - Sort by various criteria
 * - Bulk approve/reject/delete operations
 * - View seller information
 * - Product status management
 *
 * @example
 * ```tsx
 * // Route: /admin/products
 * <AdminProductsPage />
 * ```
 */

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  category: string;
  image: string;
  status: "active" | "inactive" | "out_of_stock";
  approvalStatus: "pending" | "approved" | "rejected";
  shopName: string;
  shopId: string;
  sellerName: string;
  sellerId: string;
  createdAt: Date;
}

// Mock data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vintage Brass Lamp",
    sku: "VBL-001",
    price: 2999,
    comparePrice: 3999,
    stock: 15,
    category: "Home Decor",
    image: "/products/lamp.jpg",
    status: "active",
    approvalStatus: "approved",
    shopName: "Antique Paradise",
    shopId: "shop1",
    sellerName: "Priya Sharma",
    sellerId: "seller1",
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "2",
    name: "Handwoven Cotton Saree",
    sku: "HCS-002",
    price: 4999,
    stock: 8,
    category: "Fashion",
    image: "/products/saree.jpg",
    status: "active",
    approvalStatus: "pending",
    shopName: "Ethnic Treasures",
    shopId: "shop2",
    sellerName: "Rajesh Kumar",
    sellerId: "seller2",
    createdAt: new Date("2026-01-18"),
  },
  {
    id: "3",
    name: "Wooden Chess Set",
    sku: "WCS-003",
    price: 1299,
    comparePrice: 1599,
    stock: 0,
    category: "Toys & Games",
    image: "/products/chess.jpg",
    status: "out_of_stock",
    approvalStatus: "approved",
    shopName: "Game Zone",
    shopId: "shop3",
    sellerName: "Amit Patel",
    sellerId: "seller3",
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "4",
    name: "Premium Tea Collection",
    sku: "PTC-004",
    price: 899,
    stock: 50,
    category: "Food & Beverages",
    image: "/products/tea.jpg",
    status: "active",
    approvalStatus: "rejected",
    shopName: "Tea House",
    shopId: "shop4",
    sellerName: "Sneha Reddy",
    sellerId: "seller4",
    createdAt: new Date("2026-01-12"),
  },
  {
    id: "5",
    name: "Copper Water Bottle",
    sku: "CWB-005",
    price: 599,
    comparePrice: 799,
    stock: 30,
    category: "Health & Wellness",
    image: "/products/bottle.jpg",
    status: "inactive",
    approvalStatus: "pending",
    shopName: "Wellness Store",
    shopId: "shop5",
    sellerName: "Vikram Singh",
    sellerId: "seller5",
    createdAt: new Date("2026-01-19"),
  },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
  { label: "Stock (Low to High)", value: "stock_asc" },
];

// Extract unique shops and sellers for filters
const SHOPS = Array.from(
  new Set(MOCK_PRODUCTS.map((p) => ({ id: p.shopId, name: p.shopName }))),
);
const SELLERS = Array.from(
  new Set(MOCK_PRODUCTS.map((p) => ({ id: p.sellerId, name: p.sellerName }))),
);
const CATEGORIES = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)));

export default function AdminProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedProducts(allIds);
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Handle individual selection
  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    setSelectedProducts(newSelection);
  };

  // Start inline editing
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      status: product.status,
      approvalStatus: product.approvalStatus,
    });
  };

  // Save inline edit
  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map((p) =>
      p.id === editingProduct ? { ...p, ...editForm } : p,
    );
    setProducts(updatedProducts);

    setEditingProduct(null);
    setEditForm({});
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedProducts);

    if (selectedIds.length === 0) {
      alert("Please select at least one product");
      return;
    }

    switch (action) {
      case "approve":
        const approvedProducts = products.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, approvalStatus: "approved" as const }
            : p,
        );
        setProducts(approvedProducts);
        alert(`${selectedIds.length} product(s) approved`);
        break;

      case "reject":
        const rejectedProducts = products.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, approvalStatus: "rejected" as const }
            : p,
        );
        setProducts(rejectedProducts);
        alert(`${selectedIds.length} product(s) rejected`);
        break;

      case "activate":
        const activatedProducts = products.map((p) =>
          selectedIds.includes(p.id) ? { ...p, status: "active" as const } : p,
        );
        setProducts(activatedProducts);
        break;

      case "deactivate":
        const deactivatedProducts = products.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, status: "inactive" as const }
            : p,
        );
        setProducts(deactivatedProducts);
        break;

      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedIds.length} product(s)?`,
          )
        ) {
          const remainingProducts = products.filter(
            (p) => !selectedIds.includes(p.id),
          );
          setProducts(remainingProducts);
          setSelectedProducts(new Set());
        }
        break;
    }
  };

  // Handle delete single product
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const remainingProducts = products.filter((p) => p.id !== productId);
      setProducts(remainingProducts);
    }
  };

  // Handle search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchQuery);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((product) => {
      // Shop filter
      if (shopFilter === "all") return true;
      return product.shopId === shopFilter;
    })
    .filter((product) => {
      // Seller filter
      if (sellerFilter === "all") return true;
      return product.sellerId === sellerFilter;
    })
    .filter((product) => {
      // Approval filter
      if (approvalFilter === "all") return true;
      return product.approvalStatus === approvalFilter;
    })
    .filter((product) => {
      // Category filter
      if (categoryFilter === "all") return true;
      return product.category === categoryFilter;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "date_desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "stock_asc":
          return a.stock - b.stock;
        default:
          return 0;
      }
    });

  const allSelected =
    filteredProducts.length > 0 &&
    selectedProducts.size === filteredProducts.length;
  const someSelected =
    selectedProducts.size > 0 &&
    selectedProducts.size < filteredProducts.length;

  // Get approval status badge
  const getApprovalBadge = (status: Product["approvalStatus"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    }
  };

  // Get status badge
  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
      case "out_of_stock":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400";
    }
  };

  // Get stock color
  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600 dark:text-red-400";
    if (stock < 10) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
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
          {/* Header with bulk actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Products Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredProducts.length} product(s) • {selectedProducts.size}{" "}
                selected
              </p>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("approve")}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction("reject")}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              {/* Row 1: Search + View Toggle */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search products
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by name, SKU, or category (press Enter)..."
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
                {/* Shop Filter */}
                <div>
                  <label htmlFor="shop-filter" className="sr-only">
                    Filter by shop
                  </label>
                  <select
                    id="shop-filter"
                    value={shopFilter}
                    onChange={(e) => setShopFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Shops</option>
                    {SHOPS.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seller Filter */}
                <div>
                  <label htmlFor="seller-filter" className="sr-only">
                    Filter by seller
                  </label>
                  <select
                    id="seller-filter"
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Sellers</option>
                    {SELLERS.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Approval Status Filter */}
                <div>
                  <label htmlFor="approval-filter" className="sr-only">
                    Filter by approval status
                  </label>
                  <select
                    id="approval-filter"
                    value={approvalFilter}
                    onChange={(e) => setApprovalFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label htmlFor="category-filter" className="sr-only">
                    Filter by category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Shop/Seller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Approval
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => {
                      const isEditing = editingProduct === product.id;
                      const isSelected = selectedProducts.has(product.id);

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectProduct(
                                  product.id,
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-400 text-xs">
                                  IMG
                                </span>
                              </div>
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editForm.name || ""}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Name"
                                  />
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.sku}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.sku}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {product.category}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.shopName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {product.sellerName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="number"
                                  value={editForm.price || ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      price: parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  ₹{product.price.toLocaleString()}
                                </div>
                                {product.comparePrice && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                    ₹{product.comparePrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.stock || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    stock: parseInt(e.target.value),
                                  })
                                }
                                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <span
                                className={`font-medium ${getStockColor(
                                  product.stock,
                                )}`}
                              >
                                {product.stock}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <select
                                value={editForm.approvalStatus || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    approvalStatus: e.target
                                      .value as Product["approvalStatus"],
                                  })
                                }
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadge(
                                  product.approvalStatus,
                                )}`}
                              >
                                {product.approvalStatus
                                  .charAt(0)
                                  .toUpperCase() +
                                  product.approvalStatus.slice(1)}
                              </span>
                            )}
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
                                    onClick={handleCancelEdit}
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
                                    onClick={() => handleStartEdit(product)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
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
                                    onClick={() =>
                                      console.log("View:", product.id)
                                    }
                                    className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="View"
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
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

              {filteredProducts.length === 0 && (
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No products found
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.has(product.id);

                return (
                  <div
                    key={product.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                      isSelected
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-700"
                    } overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">IMG</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectProduct(product.id, e.target.checked)
                        }
                        className="absolute top-3 left-3 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadge(
                            product.approvalStatus,
                          )}`}
                        >
                          {product.approvalStatus.charAt(0).toUpperCase() +
                            product.approvalStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {product.sku} • {product.category}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                            ₹{product.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${getStockColor(
                            product.stock,
                          )}`}
                        >
                          Stock: {product.stock}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${getStatusBadge(
                            product.status,
                          )}`}
                        >
                          {product.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div>{product.shopName}</div>
                          <div>{product.sellerName}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(product)}
                          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => console.log("View:", product.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
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
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No products found
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
    </div>
  );
}
