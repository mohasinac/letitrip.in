"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  Filter,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserRole } from "@/types";

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [actionLoading, setActionLoading] = useState(false);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load users");
      }

      setUsers(result.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadUsers();
    }
  }, [currentUser, isAdmin, roleFilter, statusFilter]);

  // Update user
  const updateUser = async (userId: string, updates: any) => {
    try {
      setActionLoading(true);

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update user");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...result.data } : u))
      );

      return true;
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err instanceof Error ? err.message : "Failed to update user");
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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

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
                onChange={(e) => setRoleFilter(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name || user.email}
                              className="h-10 w-10 rounded-full object-cover"
                            />
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
                                <span className="h-4 w-4 text-gray-300">✕</span>
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
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ban Reason *
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
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
