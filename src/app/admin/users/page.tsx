"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FormTextarea, FormSelect } from "@/components/forms";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  Loader2,
  Search,
  UserCog,
  Shield,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/useMobile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserRole } from "@/types/shared/common.types";
import {
  InlineEditRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
} from "@/components/common/inline-edit";
import { getUserBulkActions } from "@/constants/bulk-actions";
import { usersService } from "@/services/users.service";
import { DateDisplay } from "@/components/common/values";
import {
  USER_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";

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
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Track if we've loaded data to prevent initial duplicate calls
  const hasLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  // Actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const [actionLoading, setActionLoading] = useState(false);

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load users with ref check to prevent duplicate calls
  const loadUsers = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      console.log("[Users] Already loading, skipping...");
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const startAfter = cursors[currentPage - 1];
      const filters: any = {
        startAfter,
        limit: 20,
      };
      if (roleFilter !== "all") filters.role = roleFilter;
      if (statusFilter !== "all") filters.status = statusFilter;

      console.log("[Users] Loading users with filters:", filters);
      const response = await usersService.list(filters);
      setUsers((response.data || []) as any);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }

      hasLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [roleFilter, statusFilter, currentPage, cursors]);

  useEffect(() => {
    if (currentUser?.uid && isAdmin && !loadingRef.current) {
      loadUsers();
    }
  }, [
    currentUser?.uid,
    isAdmin,
    roleFilter,
    statusFilter,
    currentPage,
    loadUsers,
  ]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    setCursors([null]);
  };

  // Fields configuration for inline edit - using centralized config
  const fields: InlineField[] = toInlineFields(
    getFieldsForContext(USER_FIELDS, "table")
  );

  // Bulk actions configuration
  const bulkActions = getUserBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);

      if (actionId === "export") {
        // Export selected users as CSV
        const selectedUsers = users.filter((u) => selectedIds.includes(u.id));
        const csv = [
          ["Email", "Name", "Role", "Phone", "Status", "Joined"].join(","),
          ...selectedUsers.map((u) =>
            [
              u.email,
              u.name || "",
              u.role,
              u.phone || "",
              u.is_banned ? "Banned" : "Active",
              new Date(u.createdAt).toLocaleDateString(),
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = globalThis.URL?.createObjectURL(blob) || "";
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        globalThis.URL?.revokeObjectURL(url);

        setSelectedIds([]);
        return;
      }

      // Use appropriate usersService method based on action
      if (actionId === "ban") {
        await Promise.all(selectedIds.map((id) => usersService.ban(id, true)));
      } else if (actionId === "unban") {
        await Promise.all(selectedIds.map((id) => usersService.ban(id, false)));
      }
      // Note: delete action not supported by usersService yet

      await loadUsers();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  // Update user
  const updateUser = async (userId: string, updates: any) => {
    try {
      setActionLoading(true);

      await usersService.update(userId, updates);
      await loadUsers();
      return true;
    } catch (err) {
      console.error("Failed to update user:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update user");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Ban user
  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return;

    const success = await updateUser(selectedUser.id, {
      is_banned: true,
      ban_reason: banReason,
    });

    if (success) {
      setShowBanDialog(false);
      setSelectedUser(null);
      setBanReason("");
    }
  };

  // Unban user
  const handleUnban = async () => {
    if (!selectedUser) return;

    const success = await updateUser(selectedUser.id, {
      is_banned: false,
    });

    if (success) {
      setShowUnbanDialog(false);
      setSelectedUser(null);
    }
  };

  // Change role
  const handleRoleChange = async () => {
    if (!selectedUser) return;

    const success = await updateUser(selectedUser.id, {
      role: newRole,
    });

    if (success) {
      setShowRoleDialog(false);
      setSelectedUser(null);
    }
  };

  // Filter users - use debounced search query
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !debouncedSearchQuery ||
      user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.phone?.includes(debouncedSearchQuery);

    return matchesSearch;
  });

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Admin access check
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="h-8 w-8" />
            User Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage users, roles, and access permissions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="sticky top-16 z-10 mb-4">
            <BulkActionBar
              selectedCount={selectedIds.length}
              actions={bulkActions}
              onAction={handleBulkAction}
              onClearSelection={() => setSelectedIds([])}
              loading={actionLoading}
              resourceName="user"
            />
          </div>
        )}

        {/* Mobile User Cards */}
        {isMobile && (
          <div className="space-y-3 lg:hidden">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users found"}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const canEdit = user.id !== currentUser?.uid;
                return (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                  >
                    {/* Header with avatar and name */}
                    <div className="flex items-start gap-3">
                      {canEdit && (
                        <TableCheckbox
                          checked={selectedIds.includes(user.id)}
                          onChange={(checked) => {
                            setSelectedIds((prev) =>
                              checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id)
                            );
                          }}
                          aria-label={`Select ${user.name || user.email}`}
                        />
                      )}
                      {user.avatar ? (
                        <div className="relative h-12 w-12">
                          <OptimizedImage
                            src={user.avatar}
                            alt={user.name || user.email}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-300 font-semibold">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {user.name || "No name"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={user.role} />
                      {user.is_banned ? (
                        <StatusBadge status="banned" />
                      ) : (
                        <StatusBadge status="active" />
                      )}
                      {user.emailVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Email verified
                        </span>
                      )}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Joined:
                        </span>{" "}
                        <DateDisplay
                          date={user.createdAt}
                          format="medium"
                          className="text-gray-900 dark:text-white"
                        />
                      </div>
                      {user.ban_reason && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            Ban reason:
                          </span>{" "}
                          <span className="text-red-600 dark:text-red-400">
                            {user.ban_reason}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canEdit && (
                      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleDialog(true);
                          }}
                          className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          Change Role
                        </button>
                        {user.is_banned ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUnbanDialog(true);
                            }}
                            className="flex-1 py-2 px-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanDialog(true);
                            }}
                            className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Ban
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Mobile Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Users Table - Desktop Only */}
        <div
          className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
            isMobile ? "hidden" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <TableCheckbox
                      checked={
                        selectedIds.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredUsers.length
                      }
                      onChange={(checked) => {
                        setSelectedIds(
                          checked
                            ? filteredUsers
                                .filter((u) => u.id !== currentUser?.uid)
                                .map((u) => u.id)
                            : []
                        );
                      }}
                      aria-label="Select all users"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isEditing = editingId === user.id;
                    const canEdit = user.id !== currentUser?.uid;

                    if (isEditing && canEdit) {
                      return (
                        <InlineEditRow
                          key={user.id}
                          fields={fields}
                          initialValues={{
                            role: user.role,
                            is_banned: user.is_banned || false,
                          }}
                          onSave={async (values) => {
                            try {
                              // Validate form fields
                              const fieldsToValidate = getFieldsForContext(
                                USER_FIELDS,
                                "table"
                              );
                              const { isValid } = validateForm(
                                values,
                                fieldsToValidate
                              );

                              if (!isValid) {
                                throw new Error("Please fix validation errors");
                              }

                              await updateUser(user.id, values);
                              await loadUsers();
                              setEditingId(null);
                            } catch (error) {
                              console.error("Failed to update user:", error);
                              throw error;
                            }
                          }}
                          onCancel={() => setEditingId(null)}
                          resourceName="user"
                        />
                      );
                    }

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50"
                        onDoubleClick={() => canEdit && setEditingId(user.id)}
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canEdit && (
                            <TableCheckbox
                              checked={selectedIds.includes(user.id)}
                              onChange={(checked) => {
                                setSelectedIds((prev) =>
                                  checked
                                    ? [...prev, user.id]
                                    : prev.filter((id) => id !== user.id)
                                );
                              }}
                              aria-label={`Select ${user.name || user.email}`}
                            />
                          )}
                        </td>

                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <div className="relative h-10 w-10">
                                <OptimizedImage
                                  src={user.avatar}
                                  alt={user.name || user.email}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {(user.name || user.email)[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name || "No name"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <StatusBadge status={user.role} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {user.is_banned ? (
                            <div>
                              <StatusBadge status="banned" />
                              {user.ban_reason && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.ban_reason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <StatusBadge status="active" />
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              {user.emailVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="h-4 w-4 text-gray-300">✕</span>
                              )}
                              <span
                                className={
                                  user.emailVerified
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }
                              >
                                Email
                              </span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                {user.phoneVerified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <span className="h-4 w-4 text-gray-300">
                                    ✕
                                  </span>
                                )}
                                <span
                                  className={
                                    user.phoneVerified
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  Phone
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <DateDisplay
                              date={user.createdAt}
                              format="medium"
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Change Role */}
                            {user.id !== currentUser?.uid && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setShowRoleDialog(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Change Role"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}

                            {/* Ban/Unban */}
                            {user.id !== currentUser?.uid &&
                              (user.is_banned ? (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUnbanDialog(true);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Unban User"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowBanDialog(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Ban User"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} • {filteredUsers.length} users
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ban Dialog */}
      {showBanDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ban User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to ban{" "}
              {selectedUser.name || selectedUser.email}?
            </p>
            <div className="mb-4">
              <FormTextarea
                label="Ban Reason"
                required
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for banning this user..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBanDialog(false);
                  setSelectedUser(null);
                  setBanReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading || !banReason.trim()}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Dialog */}
      <ConfirmDialog
        isOpen={showUnbanDialog}
        onClose={() => {
          setShowUnbanDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUnban}
        title="Unban User"
        description={`Are you sure you want to unban ${
          selectedUser?.name || selectedUser?.email
        }?`}
        confirmLabel="Unban User"
        variant="info"
        isLoading={actionLoading}
      />

      {/* Role Change Dialog */}
      {showRoleDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Change User Role
            </h3>
            <p className="text-gray-600 mb-4">
              Change role for {selectedUser.name || selectedUser.email}
            </p>
            <div className="mb-4">
              <FormSelect
                label="Select New Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                options={[
                  { value: "user", label: "User" },
                  { value: "seller", label: "Seller" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRoleDialog(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
