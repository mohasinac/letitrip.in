/**
 * Admin Users Management Page
 * Path: /admin/users
 *
 * View, search, filter, and manage all users
 * - Search by email
 * - Filter by role, status
 * - Change roles
 * - Enable/disable accounts
 * - Pagination
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Select } from "@/components";
import { Heading } from "@/components/typography/Typography";
import Text from "@/components/Text";
import FormField from "@/components/FormField";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";
import { apiClient } from "@/lib/api-client";
import type { UserDocument } from "@/db/schema/users";

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { themed, colors } = THEME_CONSTANTS;

  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState(
    searchParams?.get("email") || "",
  );
  const [filterRole, setFilterRole] = useState(searchParams?.get("role") || "");
  const [filterStatus, setFilterStatus] = useState(
    searchParams?.get("status") || "",
  );
  const [page, setPage] = useState(parseInt(searchParams?.get("page") || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadUsers();
    }
  }, [user, page, searchEmail, filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
      });

      if (searchEmail) params.append("email", searchEmail);
      if (filterRole) params.append("role", filterRole);
      if (filterStatus) params.append("status", filterStatus);

      const response = await apiClient.get(
        `/api/admin/users?${params.toString()}`,
      );

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        throw new Error(response.error || "Failed to load users");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (
    uid: string,
    updates: { role?: string; disabled?: boolean },
  ) => {
    try {
      setUpdatingUserId(uid);

      const response = await apiClient.patch(
        `/api/admin/users/${uid}`,
        updates,
      );

      if (response.success) {
        // Refresh users list
        await loadUsers();
      } else {
        throw new Error(response.error || "Failed to update user");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleFilterChange = (newFilters: {
    role?: string;
    status?: string;
  }) => {
    if (newFilters.role !== undefined) setFilterRole(newFilters.role);
    if (newFilters.status !== undefined) setFilterStatus(newFilters.status);
    setPage(1);
  };

  if (authLoading || loading) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}
      >
        <Heading level={3} variant="primary">
          Loading users...
        </Heading>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Heading level={1} variant="primary" className="mb-2">
              User Management
            </Heading>
            <Text className={themed.textSecondary}>
              View and manage all user accounts
            </Text>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search by email */}
              <div className="md:col-span-2">
                <FormField
                  name="searchField"
                  label="Search by Email"
                  type="text"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(value: string) => setSearchEmail(value)}
                />
              </div>

              {/* Filter by role */}
              <div>
                <label className={`block mb-2 text-sm ${themed.textPrimary}`}>
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => handleFilterChange({ role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded ${themed.bgSecondary} ${themed.textPrimary}`}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Filter by status */}
              <div>
                <label className={`block mb-2 text-sm ${themed.textPrimary}`}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    handleFilterChange({ status: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded ${themed.bgSecondary} ${themed.textPrimary}`}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/20">
            <Heading level={3} variant="primary" className="text-red-600">
              {error}
            </Heading>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${themed.borderColor}`}>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Email
                  </th>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Name
                  </th>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Role
                  </th>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Status
                  </th>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Joined
                  </th>
                  <th className={`text-left p-4 ${themed.textPrimary}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.uid}
                    className={`border-b ${themed.borderColor} hover:${themed.bgSecondary}`}
                  >
                    <td className={`p-4 ${themed.textPrimary}`}>
                      {u.email}
                      {u.emailVerified && (
                        <Text className="ml-2 text-green-600" title="Verified">
                          ✓
                        </Text>
                      )}
                    </td>
                    <td className={`p-4 ${themed.textPrimary}`}>
                      {u.displayName || "-"}
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleUpdateUser(u.uid, { role: e.target.value })
                        }
                        disabled={
                          updatingUserId === u.uid || u.uid === user.uid
                        }
                        className={`px-2 py-1 border rounded text-sm ${themed.bgSecondary} ${themed.textPrimary}`}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <Text
                        className={`px-2 py-1 rounded text-xs ${
                          u.disabled
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {u.disabled ? "Disabled" : "Active"}
                      </Text>
                    </td>
                    <td className={`p-4 text-sm ${themed.textSecondary}`}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleUpdateUser(u.uid, { disabled: !u.disabled })
                        }
                        disabled={
                          updatingUserId === u.uid || u.uid === user.uid
                        }
                        className="text-sm"
                      >
                        {updatingUserId === u.uid
                          ? "Updating..."
                          : u.disabled
                            ? "Enable"
                            : "Disable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-8">
                <Text className={themed.textSecondary}>No users found</Text>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>

              <Text>
                Page {page} of {totalPages}
              </Text>

              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
