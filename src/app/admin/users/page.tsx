"use client";

import Link from "next/link";
import React, { useState } from "react";

/**
 * Admin Users Page
 *
 * Comprehensive user management interface for admins with:
 * - Complete user list with role-based filtering
 * - Inline editing for user details and roles
 * - Bulk operations (activate/deactivate, delete, role change)
 * - Advanced filtering (role, status, date range, search)
 * - User impersonation capability
 * - Account status management
 * - Grid/Table view toggle
 *
 * Features:
 * - Search by name, email, or phone
 * - Filter by role (all, user, seller, admin)
 * - Filter by status (active, inactive, suspended)
 * - Sort by various criteria
 * - Bulk role updates and account status changes
 * - User detail view and edit
 * - Registration date tracking
 *
 * @example
 * ```tsx
 * // Route: /admin/users
 * <AdminUsersPage />
 * ```
 */

// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "seller" | "admin";
  status: "active" | "inactive" | "suspended";
  verified: boolean;
  joinedAt: Date;
  lastLogin: Date;
}

// Mock data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98765 43210",
    role: "user",
    status: "active",
    verified: true,
    joinedAt: new Date("2025-12-15"),
    lastLogin: new Date("2026-01-20T14:30:00"),
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 87654 32109",
    role: "seller",
    status: "active",
    verified: true,
    joinedAt: new Date("2025-11-20"),
    lastLogin: new Date("2026-01-20T12:15:00"),
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 76543 21098",
    role: "user",
    status: "inactive",
    verified: false,
    joinedAt: new Date("2026-01-10"),
    lastLogin: new Date("2026-01-15T09:20:00"),
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 65432 10987",
    role: "admin",
    status: "active",
    verified: true,
    joinedAt: new Date("2025-10-05"),
    lastLogin: new Date("2026-01-20T16:45:00"),
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 54321 09876",
    role: "seller",
    status: "suspended",
    verified: true,
    joinedAt: new Date("2025-12-01"),
    lastLogin: new Date("2026-01-18T11:30:00"),
  },
];

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Last Login (Recent)", value: "login_desc" },
  { label: "Last Login (Oldest)", value: "login_asc" },
];

export default function AdminUsersPage() {
  // State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredUsers.map((u) => u.id));
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle individual selection
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  // Start inline editing
  const handleStartEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  };

  // Save inline edit
  const handleSaveEdit = () => {
    if (!editingUser) return;

    const updatedUsers = users.map((u) =>
      u.id === editingUser ? { ...u, ...editForm } : u,
    );
    setUsers(updatedUsers);

    setEditingUser(null);
    setEditForm({});
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedUsers);

    if (selectedIds.length === 0) {
      alert("Please select at least one user");
      return;
    }

    switch (action) {
      case "activate":
        const activatedUsers = users.map((u) =>
          selectedIds.includes(u.id) ? { ...u, status: "active" as const } : u,
        );
        setUsers(activatedUsers);
        break;

      case "deactivate":
        const deactivatedUsers = users.map((u) =>
          selectedIds.includes(u.id)
            ? { ...u, status: "inactive" as const }
            : u,
        );
        setUsers(deactivatedUsers);
        break;

      case "suspend":
        const suspendedUsers = users.map((u) =>
          selectedIds.includes(u.id)
            ? { ...u, status: "suspended" as const }
            : u,
        );
        setUsers(suspendedUsers);
        break;

      case "make_seller":
        const sellerUsers = users.map((u) =>
          selectedIds.includes(u.id) ? { ...u, role: "seller" as const } : u,
        );
        setUsers(sellerUsers);
        break;

      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedIds.length} user(s)?`,
          )
        ) {
          const remainingUsers = users.filter(
            (u) => !selectedIds.includes(u.id),
          );
          setUsers(remainingUsers);
          setSelectedUsers(new Set());
        }
        break;
    }
  };

  // Handle delete single user
  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const remainingUsers = users.filter((u) => u.id !== userId);
      setUsers(remainingUsers);
    }
  };

  // Handle impersonate user
  const handleImpersonate = (userId: string, userName: string) => {
    console.log(`Impersonating user: ${userName} (${userId})`);
    alert(`Impersonation mode: Now viewing as ${userName}`);
  };

  // Handle search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchQuery);
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((user) => {
      // Role filter
      if (roleFilter === "all") return true;
      return user.role === roleFilter;
    })
    .filter((user) => {
      // Status filter
      if (statusFilter === "all") return true;
      return user.status === statusFilter;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc":
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        case "date_desc":
          return b.joinedAt.getTime() - a.joinedAt.getTime();
        case "login_asc":
          return a.lastLogin.getTime() - b.lastLogin.getTime();
        case "login_desc":
          return b.lastLogin.getTime() - a.lastLogin.getTime();
        default:
          return 0;
      }
    });

  const allSelected =
    filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;
  const someSelected =
    selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

  // Get role badge color
  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      case "seller":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "user":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "inactive":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "suspended":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    }
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
                Users Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredUsers.length} user(s) • {selectedUsers.size} selected
              </p>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("suspend")}
                  className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction("make_seller")}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Make Seller
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
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Search users
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name, email, or phone (press Enter)..."
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

              {/* Role Filter */}
              <div>
                <label htmlFor="role-filter" className="sr-only">
                  Filter by role
                </label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
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
                  <option value="suspended">Suspended</option>
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
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => {
                      const isEditing = editingUser === user.id;
                      const isSelected = selectedUsers.has(user.id);

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectUser(user.id, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
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
                                <input
                                  type="email"
                                  value={editForm.email || ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      email: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                  placeholder="Email"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                  </span>
                                  {user.verified && (
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editForm.phone || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-sm text-gray-900 dark:text-white">
                                {user.phone}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <select
                                value={editForm.role || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    role: e.target.value as User["role"],
                                  })
                                }
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="user">User</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                                  user.role,
                                )}`}
                              >
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <select
                                value={editForm.status || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    status: e.target.value as User["status"],
                                  })
                                }
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                  user.status,
                                )}`}
                              >
                                {user.status.charAt(0).toUpperCase() +
                                  user.status.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {user.joinedAt.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
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
                                    onClick={() => handleStartEdit(user)}
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
                                      handleImpersonate(user.id, user.name)
                                    }
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                    title="Impersonate"
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
                                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      console.log("View:", user.id)
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
                                    onClick={() => handleDeleteUser(user.id)}
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

              {filteredUsers.length === 0 && (
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No users found
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
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.has(user.id);

                return (
                  <div
                    key={user.id}
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
                          handleSelectUser(user.id, e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                            user.role,
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            user.status,
                          )}`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </h3>
                          {user.verified && (
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Joined: {user.joinedAt.toLocaleDateString("en-IN")}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleImpersonate(user.id, user.name)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Impersonate"
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
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

              {filteredUsers.length === 0 && (
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No users found
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
