"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Shield,
  FileText,
  Users as UsersIcon,
  UserCog,
  UserCheck,
  Ban,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { UnifiedAlert } from "@/components/ui/unified";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { UnifiedButton } from "@/components/ui/unified/Button";

interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "seller" | "admin";
  isBanned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserStats {
  total: number;
  admins: number;
  sellers: number;
  users: number;
  banned: number;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface UsersProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function Users({
  title = "User Management",
  description = "Manage user accounts, roles, and permissions",
  breadcrumbs,
}: UsersProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    sellers: 0,
    users: 0,
    banned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "role" | "ban" | "document" | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"user" | "seller" | "admin">("user");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, roleFilter, statusFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await apiClient.get(
        `/admin/users${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response) {
        setUsers(response);

        // Calculate stats
        const calculatedStats = {
          total: response.length,
          admins: response.filter((u: User) => u.role === "admin").length,
          sellers: response.filter((u: User) => u.role === "seller").length,
          users: response.filter((u: User) => u.role === "user").length,
          banned: response.filter((u: User) => u.isBanned).length,
        };
        setStats(calculatedStats);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user: User, type: "role" | "ban" | "document") => {
    // Prevent admin from changing their own role
    if (type === "role" && currentUser?.uid === user.uid) {
      setAlert({
        show: true,
        message: "You cannot change your own role",
        type: "warning",
      });
      return;
    }

    setSelectedUser(user);
    setModalType(type);
    if (type === "role") {
      setNewRole(user.role);
    }
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      switch (modalType) {
        case "role":
          await apiClient.put(`/admin/users/${selectedUser.id}/role`, {
            role: newRole,
          });
          setAlert({
            show: true,
            message: `User role changed to ${newRole} successfully`,
            type: "success",
          });
          break;

        case "ban":
          await apiClient.put(`/admin/users/${selectedUser.id}/ban`, {
            isBanned: !selectedUser.isBanned,
          });
          setAlert({
            show: true,
            message: `User ${
              selectedUser.isBanned ? "unbanned" : "banned"
            } successfully`,
            type: "success",
          });
          break;

        case "document":
          await apiClient.post(
            `/admin/users/${selectedUser.id}/create-document`,
            {
              email: selectedUser.email,
              name: selectedUser.name,
              phone: selectedUser.phone,
              role: selectedUser.role,
            }
          );
          setAlert({
            show: true,
            message: "User document created successfully",
            type: "success",
          });
          break;
      }

      // Refresh users list
      fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Action failed",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "purple",
      seller: "blue",
      user: "gray",
    };
    return colors[role] || "gray";
  };

  const getStatusBadgeColor = (isBanned: boolean) => {
    return isBanned ? "red" : "green";
  };

  // Table columns
  const columns = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (user: User) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {user.email}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (user: User) => (
        <div className="text-sm text-gray-900 dark:text-white">{user.name}</div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (user: User) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {user.phone || "-"}
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user: User) => <span>{user.role}</span>,
      badge: (user: User) => ({
        text: user.role,
        color: getRoleBadgeColor(user.role) as any,
      }),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user: User) => (
        <span>{user.isBanned ? "Banned" : "Active"}</span>
      ),
      badge: (user: User) => ({
        text: user.isBanned ? "Banned" : "Active",
        color: getStatusBadgeColor(user.isBanned || false) as any,
      }),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  // Row actions
  const rowActions: any = [
    {
      label: "Change Role",
      icon: <Shield className="w-4 h-4" />,
      onClick: (row: User) => openModal(row, "role"),
    },
    {
      label: (row: User) => (row.isBanned ? "Unban User" : "Ban User"),
      icon: (row: User) =>
        row.isBanned ? (
          <Unlock className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        ),
      onClick: (row: User) => openModal(row, "ban"),
    },
    {
      label: "Create Document",
      icon: <FileText className="w-4 h-4" />,
      onClick: (row: User) => openModal(row, "document"),
    },
  ];

  // Stats cards
  const statsCards = [
    {
      label: "Total Users",
      value: stats.total,
      color: "gray",
      icon: UsersIcon,
    },
    {
      label: "Admins",
      value: stats.admins,
      color: "purple",
      icon: Shield,
    },
    {
      label: "Sellers",
      value: stats.sellers,
      color: "blue",
      icon: UserCog,
    },
    {
      label: "Regular Users",
      value: stats.users,
      color: "gray",
      icon: UserCheck,
    },
    {
      label: "Banned Users",
      value: stats.banned,
      color: "red",
      icon: Ban,
    },
  ];

  // Role filter tabs
  const roleTabs = [
    { label: "All Roles", value: "all" },
    { label: "Admins", value: "admin" },
    { label: "Sellers", value: "seller" },
    { label: "Users", value: "user" },
  ];

  // Status filter tabs
  const statusTabs = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Banned", value: "banned" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={fetchUsers}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </UnifiedButton>
        }
      />

      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <Icon
                  className={`w-5 h-5 ${
                    stat.color === "purple"
                      ? "text-purple-600 dark:text-purple-400"
                      : stat.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : stat.color === "red"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold ${
                  stat.color === "purple"
                    ? "text-purple-600 dark:text-purple-400"
                    : stat.color === "blue"
                    ? "text-blue-600 dark:text-blue-400"
                    : stat.color === "red"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Role Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                roleFilter === tab.value
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <ModernDataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="No users found"
        rowActions={rowActions}
      />

      {/* Action Modal */}
      {showModal && selectedUser && (
        <UnifiedModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          title={
            modalType === "role"
              ? "Change User Role"
              : modalType === "ban"
              ? selectedUser.isBanned
                ? "Unban User"
                : "Ban User"
              : "Create User Document"
          }
        >
          <div className="space-y-4">
            {modalType === "role" && (
              <>
                <p className="text-gray-600 dark:text-gray-400">
                  Change role for <strong>{selectedUser.email}</strong>
                </p>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "user" | "seller" | "admin")
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            {modalType === "ban" && (
              <p className="text-gray-600 dark:text-gray-400">
                {selectedUser.isBanned
                  ? `Unbanning ${selectedUser.email} will restore their account access.`
                  : `Banning ${selectedUser.email} will disable their account and prevent login.`}
              </p>
            )}

            {modalType === "document" && (
              <p className="text-gray-600 dark:text-gray-400">
                Create or recreate the Firestore document for{" "}
                <strong>{selectedUser.email}</strong>? This will ensure all user
                data is properly synchronized.
              </p>
            )}

            <div className="flex gap-2 mt-6">
              <UnifiedButton
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </UnifiedButton>
              <UnifiedButton
                onClick={handleAction}
                loading={actionLoading}
                className="flex-1"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>
      )}
    </div>
  );
}
