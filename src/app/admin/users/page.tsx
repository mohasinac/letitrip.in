"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { DataTable } from "@/components/admin";
import { Card, Button } from "@/components";

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "seller" | "moderator" | "admin";
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  metadata?: {
    loginCount?: number;
  };
}

type UserTab = "all" | "active" | "banned" | "admins";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const queryParams = new URLSearchParams();
  if (activeTab === "active") queryParams.append("disabled", "false");
  if (activeTab === "banned") queryParams.append("disabled", "true");
  if (activeTab === "admins") queryParams.append("role", "admin");
  if (searchTerm) queryParams.append("search", searchTerm);
  if (roleFilter !== "all") queryParams.append("role", roleFilter);

  const { data, isLoading, error, refetch } = useApiQuery<{
    users: User[];
    total: number;
  }>({
    queryKey: ["admin", "users", activeTab, searchTerm, roleFilter],
    queryFn: () => apiClient.get(`/api/admin/users?${queryParams.toString()}`),
  });

  const updateUserMutation = useApiMutation<any, { uid: string; data: any }>({
    mutationFn: ({ uid, data }) =>
      apiClient.patch(`/api/admin/users/${uid}`, data),
  });

  const deleteUserMutation = useApiMutation<any, string>({
    mutationFn: (uid) => apiClient.delete(`/api/admin/users/${uid}`),
  });

  const users = data?.users || [];
  const total = data?.total || 0;

  const handleRoleChange = async (user: User, newRole: string) => {
    if (
      !confirm(`Change ${user.displayName || user.email}'s role to ${newRole}?`)
    )
      return;
    try {
      await updateUserMutation.mutate({
        uid: user.uid,
        data: { role: newRole },
      });
      await refetch();
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...user, role: newRole as User["role"] });
      }
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const handleToggleBan = async (user: User) => {
    const action = user.disabled ? "unban" : "ban";
    if (
      !confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${user.displayName || user.email}?`,
      )
    )
      return;
    try {
      await updateUserMutation.mutate({
        uid: user.uid,
        data: { disabled: !user.disabled },
      });
      await refetch();
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...user, disabled: !user.disabled });
      }
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `PERMANENTLY DELETE ${user.displayName || user.email}? This action cannot be undone and will delete all user data.`,
      )
    )
      return;
    const confirmation = prompt('Type "DELETE" to confirm:');
    if (confirmation !== "DELETE") return;

    try {
      await deleteUserMutation.mutate(user.uid);
      await refetch();
      setSelectedUser(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const tabs: { key: UserTab; label: string }[] = [
    { key: "all", label: "All Users" },
    { key: "active", label: "Active" },
    { key: "banned", label: "Banned" },
    { key: "admins", label: "Admins" },
  ];

  const tableColumns = [
    {
      key: "displayName",
      header: "Name",
      sortable: true,
      width: "20%",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || user.email}
              className="w-8 h-8 rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <span>{user.displayName || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      width: "25%",
      render: (user: User) => (
        <div>
          <div>{user.email}</div>
          {!user.emailVerified && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              Not verified
            </span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      width: "15%",
      render: (user: User) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : user.role === "moderator"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : user.role === "seller"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      ),
    },
    {
      key: "disabled",
      header: "Status",
      sortable: true,
      width: "12%",
      render: (user: User) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            user.disabled
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {user.disabled ? "Banned" : "Active"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      width: "15%",
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      width: "13%",
      render: (user: User) =>
        user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString()
          : "Never",
    },
  ];

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Details
          </h1>
          <Button onClick={() => setSelectedUser(null)} variant="secondary">
            Back to List
          </Button>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.displayName || selectedUser.email}
                  className="w-20 h-20 rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-2xl font-medium">
                  {(selectedUser.displayName || selectedUser.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedUser.displayName || "No name"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedUser.role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : selectedUser.role === "moderator"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : selectedUser.role === "seller"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedUser.disabled
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {selectedUser.disabled ? "Banned" : "Active"}
                  </span>
                  {!selectedUser.emailVerified && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Email Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User ID
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {selectedUser.uid}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Login Count
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedUser.metadata?.loginCount || 0} times
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Joined
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Login
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedUser.lastLoginAt
                    ? new Date(selectedUser.lastLoginAt).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Role
              </label>
              <div className="flex gap-2">
                {(["user", "seller", "moderator", "admin"] as const).map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser, role)}
                      disabled={selectedUser.role === role}
                      className={`px-3 py-2 text-sm font-medium rounded ${
                        selectedUser.role === role
                          ? "bg-blue-600 text-white cursor-not-allowed"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => handleToggleBan(selectedUser)}
                variant="secondary"
                className={
                  selectedUser.disabled ? "text-green-600" : "text-orange-600"
                }
              >
                {selectedUser.disabled ? "Unban User" : "Ban User"}
              </Button>
              <Button
                onClick={() => handleDeleteUser(selectedUser)}
                variant="secondary"
                className="text-red-600 hover:text-red-700"
              >
                Delete User
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage user accounts ({total} total)
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              disabled={activeTab === "admins"}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading users...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      ) : (
        <DataTable
          data={users}
          columns={tableColumns}
          keyExtractor={(user) => user.uid}
          onRowClick={(user) => setSelectedUser(user)}
          actions={(user) => (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBan(user);
                }}
                className={`${
                  user.disabled
                    ? "text-green-600 hover:text-green-800 dark:text-green-400"
                    : "text-orange-600 hover:text-orange-800 dark:text-orange-400"
                } text-sm`}
              >
                {user.disabled ? "Unban" : "Ban"}
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
