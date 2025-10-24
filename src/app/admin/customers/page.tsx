"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  ordersCount: number;
  totalSpent: number;
}

export default function CustomerManagement() {
  const { user } = useEnhancedAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      setShowModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the data after update
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleVerificationToggle = async (
    userId: string,
    verified: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the data after update
      }
    } catch (error) {
      console.error("Failed to update verification:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const baseClasses =
      "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    switch (role) {
      case "admin":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "seller":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      const diff = Date.now() - new Date(dateString).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      return `${days} days ago`;
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Customer Management
                </h1>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {loading
                      ? "Updating..."
                      : `Updated ${new Date().toLocaleTimeString()}`}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Manage users, roles, and verification badges • {users.length}{" "}
                total users
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
          {error && (
            <div className="px-4 sm:px-6 lg:px-8 pb-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">Error: {error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-background shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading users...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-600"
                    >
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover: bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role)}>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.verified ? (
                            <div className="flex items-center text-green-600">
                              <ShieldCheckIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-600">
                              <UserIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">Unverified</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>Joined {formatDate(user.createdAt)}</div>
                        <div>Last active {getTimeAgo(user.lastLoginAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{user.ordersCount} orders</div>
                        <div>${user.totalSpent.toFixed(2)} spent</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleVerificationToggle(user.id, !user.verified)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              user.verified
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                            title={
                              user.verified
                                ? "Remove verification"
                                : "Verify user"
                            }
                          >
                            {user.verified ? (
                              <StarIcon className="h-4 w-4" />
                            ) : (
                              <ShieldCheckIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Change role"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
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

      {/* Role Change Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Role for {selectedUser.name}
            </h3>
            <div className="space-y-4">
              {["user", "seller", "admin"].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedUser.role === role}
                    className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-border"
                  />
                  <span className="capitalize">
                    {role === "user" ? "Customer" : role}
                  </span>
                  <span className={`ml-2 ${getRoleBadge(role)}`}>
                    {role === "user"
                      ? "Customer"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newRole = (
                    document.querySelector(
                      'input[name="role"]:checked'
                    ) as HTMLInputElement
                  )?.value;
                  if (newRole && newRole !== selectedUser.role) {
                    handleRoleChange(selectedUser.id, newRole);
                  } else {
                    setShowModal(false);
                    setSelectedUser(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
