"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import { Card, Button, SideDrawer, DataTable } from "@/components";
import { formatDate, formatDateTime } from "@/utils";

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

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminUsersPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
  const { patterns, themed } = THEME_CONSTANTS;

  const findUserByUid = useCallback(
    (uid: string): User | undefined => users.find((u) => u.uid === uid),
    [users],
  );

  const handleViewUser = useCallback(
    (user: User) => {
      setSelectedUser(user);
      setIsDrawerOpen(true);
      if (user.uid && action?.[0] !== "view") {
        router.push(`${ROUTES.ADMIN.USERS}/view/${user.uid}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
    }, 300);
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.USERS);
    }
  }, [action, router]);

  // Auto-open drawer based on URL action: /view/:uid
  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;

    const mode = action[0];
    const uid = action[1];

    if (mode === "view" && uid && users.length > 0) {
      const user = findUserByUid(uid);
      if (user) {
        handleViewUser(user);
      } else {
        router.replace(ROUTES.ADMIN.USERS);
      }
    }
  }, [action, users, findUserByUid, isDrawerOpen, handleViewUser, router]);

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
      handleCloseDrawer();
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
      handleCloseDrawer();
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
      render: (user: User) => formatDate(user.createdAt),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      width: "13%",
      render: (user: User) =>
        user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never",
    },
  ];

  return (
    <>
      <div className={THEME_CONSTANTS.spacing.stack}>
        <div>
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Users
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Manage user accounts ({total} total)
          </p>
        </div>

        <div className={`border-b ${THEME_CONSTANTS.themed.borderColor}`}>
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : `border-transparent ${THEME_CONSTANTS.themed.textSecondary} hover:text-gray-900 dark:hover:text-gray-200`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className={`block text-sm font-medium ${themed.textPrimary} mb-2`}
              >
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className={patterns.adminInput}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${themed.textPrimary} mb-2`}
              >
                Role Filter
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={patterns.adminSelect}
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
            <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                {UI_LABELS.ACTIONS.RETRY}
              </Button>
            </div>
          </Card>
        ) : (
          <DataTable
            data={users}
            columns={tableColumns}
            keyExtractor={(user) => user.uid}
            onRowClick={handleViewUser}
            actions={(user) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewUser(user);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                >
                  {UI_LABELS.ACTIONS.VIEW}
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

      {/* Side Drawer for User Details */}
      {selectedUser && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title="User Details"
          mode="view"
        >
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div
              className={`flex items-start ${THEME_CONSTANTS.spacing.gap.md}`}
            >
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
                <h2
                  className={`text-xl font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  {selectedUser.displayName || "No name"}
                </h2>
                <p className={THEME_CONSTANTS.themed.textSecondary}>
                  {selectedUser.email}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
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

            <div
              className={`grid grid-cols-2 gap-4 pt-4 border-t ${THEME_CONSTANTS.themed.borderColor}`}
            >
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User ID
                </label>
                <p
                  className={`${THEME_CONSTANTS.themed.textPrimary} font-mono text-sm break-all`}
                >
                  {selectedUser.uid}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Login Count
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {selectedUser.metadata?.loginCount || 0} times
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Joined
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {formatDateTime(selectedUser.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Login
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {selectedUser.lastLoginAt
                    ? formatDateTime(selectedUser.lastLoginAt)
                    : "Never"}
                </p>
              </div>
            </div>

            <div
              className={`pt-4 border-t ${THEME_CONSTANTS.themed.borderColor}`}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Role
              </label>
              <div className="flex gap-2 flex-wrap">
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

            <div
              className={`flex gap-2 pt-4 border-t ${THEME_CONSTANTS.themed.borderColor}`}
            >
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
                {UI_LABELS.ACTIONS.DELETE}
              </Button>
            </div>
          </div>
        </SideDrawer>
      )}
    </>
  );
}
