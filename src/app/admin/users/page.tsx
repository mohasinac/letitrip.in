/**
 * @fileoverview React Component
 * @module src/app/admin/users/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import OptimizedImage from "@/components/common/OptimizedImage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { getUserBulkActions } from "@/constants/bulk-actions";
import { USER_FIELDS, toInlineFields } from "@/constants/form-fields";
import { usersService } from "@/services/users.service";
import { UserRole } from "@/types/shared/common.types";
import { CheckCircle, Mail, Phone, Shield } from "lucide-react";

/**
 * User interface
 * 
 * @interface
 * @description Defines the structure and contract for User
 */
interface User {
  /** Id */
  id: string;
  /** Email */
  email: string;
  /** Name */
  name?: string;
  /** Role */
  role: UserRole;
  /** Avatar */
  avatar?: string;
  /** Phone */
  phone?: string;
  /** Email Verified */
  emailVerified: boolean;
  /** Phone Verified */
  phoneVerified: boolean;
  /** Is_banned */
  is_banned?: boolean;
  /** Ban_reason */
  ban_reason?: string;
  /** Created At */
  createdAt: string;
  /** Updated At */
  updatedAt: string;
}

export default /**
 * Performs admin users page operation
 *
 * @returns {any} The adminuserspage result
 *
 */
function AdminUsersPage() {
  // Define columns for the resource page
  /**
 * Performs columns operation
 *
 * @param {User} user - The user
 *
 * @returns {any} The columns result
 *
 */
const columns = [
    {
      /** Key */
      key: "user",
      /** Label */
      label: "User",
      /** Render */
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <OptimizedImage
              src={user.avatar}
              alt={user.name || user.email}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.name || "No name"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "role",
      /** Label */
      label: "Role",
      /** Render */
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="capitalize text-gray-900 dark:text-white">
            {user.role}
          </span>
        </div>
      ),
    },
    {
      /** Key */
      key: "verification",
      /** Label */
      label: "Verification",
      /** Render */
      render: (user: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            {user.emailVerified ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Mail className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-600 dark:text-gray-400">
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-sm">
              {user.phoneVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Phone className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {user.phoneVerified ? "Phone verified" : "Phone not verified"}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (user: User) =>
        user.is_banned ? (
          <StatusBadge status="banned" />
        ) : (
          <StatusBadge status="active" />
        ),
    },
    {
      /** Key */
      key: "created",
      /** Label */
      label: "Joined",
      /** Render */
      render: (user: User) => (
        <DateDisplay date={new Date(user.createdAt)} format="short" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "role",
      /** Label */
      label: "Role",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Roles" },
        { value: "user", label: "User" },
        { value: "seller", label: "Seller" },
        { value: "admin", label: "Admin" },
      ],
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "banned", label: "Banned" },
      ],
    },
  ];

  // Load data function
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      /** Start After */
      startAfter: options.cursor,
      /** Limit */
      limit: 20,
    };

    if (options.filters?.role && options.filters.role !== "all") {
      apiFilters.role = options.filters.role;
    }
    if (options.filters?.status && options.filters.status !== "all") {
      apiFilters.status /**
 * Performs response operation
 *
 * @param {any} apiFilters - The apifilters
 *
 * @returns {any} The response result
 *
 */
= options.filters.status;
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await usersService.list(apiFilters);
    return {
      /** Items */
      items: (response.data || []).map((user) => ({
        ...user,
        /** Created At */
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : user.createdAt,
        /** Updated At */
        updatedAt:
          user.updatedAt instanceof Date
            ? user.updatedAt.toISOString()
            : user.updatedAt,
      })) as User[],
      /** Next Cursor */
      nextCursor:
        "nextCursor" in response.pagination
          ? (response.pagination as any).nextCursor
          : null,
      /** Has Next Page */
      hasNextPage: response.pagination.hasNextPage || false,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<User>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<User>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<User>) => {
    // Convert to UserProfileFormFE format
    const formData = {
      /** Display Name */
      displayName: data.name || "",
      /** First Name */
      firstName: data.name?.split(" ")[0] || "",
      /** Last Name */
      lastName: data.name?.split(" ").slice(1).join(" ") || "",
      /** Phone Number */
      phoneNumber: data.phone || "",
      /** Email */
      email: data.email || "",
      /** Role */
      role: data.role || "user",
      /** Email Verified */
      emailVerified: data.emailVerified ?? false,
      /** Phone Verified */
      phoneVerified: data.phoneVerified ?? false,
    };
    await usersService.update(id, formData as any);
  };

  // Handle delete - Users cannot be deleted, use ban instead
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async (id: string) => {
    await usersService.ban(id, true, "Account deleted by admin");
  };

  return (
    <AdminResourcePage<User>
      resourceName="User"
      resourceNamePlural="Users"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(USER_FIELDS)}
      bulkActions={getUserBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
