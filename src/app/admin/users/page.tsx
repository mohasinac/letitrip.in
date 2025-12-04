"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { usersService } from "@/services/users.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Mail, Phone, Shield, CheckCircle } from "lucide-react";
import { UserRole } from "@/types/shared/common.types";
import { getUserBulkActions } from "@/constants/bulk-actions";
import { USER_FIELDS, toInlineFields } from "@/constants/form-fields";

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  is_banned?: boolean;
  ban_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  // Define columns for the resource page
  const columns = [
    {
      key: "user",
      label: "User",
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
      key: "role",
      label: "Role",
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
      key: "verification",
      label: "Verification",
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
      key: "status",
      label: "Status",
      render: (user: User) =>
        user.is_banned ? (
          <StatusBadge status="banned" label="Banned" />
        ) : (
          <StatusBadge status="active" label="Active" />
        ),
    },
    {
      key: "created",
      label: "Joined",
      render: (user: User) => (
        <DateDisplay date={new Date(user.createdAt)} format="relative" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "role",
      label: "Role",
      type: "select" as const,
      options: [
        { value: "all", label: "All Roles" },
        { value: "user", label: "User" },
        { value: "seller", label: "Seller" },
        { value: "admin", label: "Admin" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "banned", label: "Banned" },
      ],
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      startAfter: options.cursor,
      limit: 20,
    };

    if (options.filters?.role && options.filters.role !== "all") {
      apiFilters.role = options.filters.role;
    }
    if (options.filters?.status && options.filters.status !== "all") {
      apiFilters.status = options.filters.status;
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await usersService.list(apiFilters);
    return {
      items: (response.data || []) as User[],
      nextCursor:
        "nextCursor" in response.pagination
          ? (response.pagination as any).nextCursor
          : null,
      hasNextPage: response.pagination.hasNextPage || false,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<User>) => {
    await usersService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await usersService.delete(id);
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
