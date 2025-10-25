"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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
  // Store information for sellers/admins
  storeName?: string;
  storeStatus?: "live" | "maintenance" | "offline";
  isFeatured?: boolean;
  businessName?: string;
  storeDescription?: string;
  storeAddress?: string;
  storePhone?: string;
  storeWebsite?: string;
  storeRegistrationDate?: string;
  totalProducts?: number;
  totalRevenue?: number;
  averageRating?: number;
  reviewCount?: number;
}

export default function CustomerManagement() {
  const { user } = useEnhancedAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [storeStatusFilter, setStoreStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showStoreStatusModal, setShowStoreStatusModal] = useState(false);
  const [storeStatusAction, setStoreStatusAction] = useState<{
    userId: string;
    newStatus: "live" | "maintenance" | "offline";
  } | null>(null);
  const [featureAction, setFeatureAction] = useState<{
    userId: string;
    isFeatured: boolean;
  } | null>(null);

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
      setSelectedRole("");
      fetchUsers(); // Refresh the data after update
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleFeatureStore = async (userId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/featured`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFeatured }),
      });

      if (response.ok) {
        // Refresh the users list
        await fetchUsers();
        setFeatureAction(null);
      } else {
        throw new Error("Failed to update featured status");
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      setError("Failed to update featured status");
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

  const handleStoreStatusChange = async (
    userId: string,
    newStatus: "live" | "maintenance" | "offline"
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/store-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeStatus: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
        setShowStoreStatusModal(false);
        setStoreStatusAction(null);
      } else {
        throw new Error("Failed to update store status");
      }
    } catch (error) {
      console.error("Failed to update store status:", error);
      setError("Failed to update store status");
    }
  };

  const viewStoreDetails = (user: User) => {
    setSelectedUser(user);
    setShowStoreModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.storeName &&
        user.storeName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Handle role filter mapping
    let targetRole = roleFilter;
    if (roleFilter === "customer") targetRole = "user";
    const matchesRole = roleFilter === "all" || user.role === targetRole;
    const matchesStoreStatus =
      storeStatusFilter === "all" ||
      (user.storeStatus && user.storeStatus === storeStatusFilter) ||
      (storeStatusFilter === "no-store" && !user.storeName);

    return matchesSearch && matchesRole && matchesStoreStatus;
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

  const getStoreStatusBadge = (status?: string) => {
    const baseClasses =
      "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "live":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "maintenance":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "offline":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStoreStatusIcon = (status?: string) => {
    switch (status) {
      case "live":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "maintenance":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case "offline":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <BuildingStorefrontIcon className="h-4 w-4 text-gray-600" />;
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
              placeholder="Search users, emails, or store names..."
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
          <select
            value={storeStatusFilter}
            onChange={(e) => setStoreStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Stores</option>
            <option value="live">Live Stores</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="offline">Offline Stores</option>
            <option value="no-store">No Store</option>
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
                    Store
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
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading users...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              {user.isFeatured && (
                                <SparklesIcon className="h-4 w-4 text-yellow-500" />
                              )}
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
                        {user.role === "seller" || user.role === "admin" ? (
                          user.storeName ? (
                            <div className="space-y-1">
                              <div className="flex items-center text-sm font-medium text-gray-900">
                                <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-blue-600" />
                                <span>{user.storeName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStoreStatusIcon(user.storeStatus)}
                                <span
                                  className={getStoreStatusBadge(
                                    user.storeStatus
                                  )}
                                >
                                  {user.storeStatus || "Unknown"}
                                </span>
                              </div>
                              {user.businessName && (
                                <div className="text-xs text-gray-500">
                                  {user.businessName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                              <span>No store setup</span>
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
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
                          {(user.role === "seller" || user.role === "admin") &&
                            user.storeName && (
                              <>
                                <button
                                  onClick={() => viewStoreDetails(user)}
                                  className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                  title="View store details"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setStoreStatusAction({
                                      userId: user.id,
                                      newStatus:
                                        user.storeStatus === "live"
                                          ? "maintenance"
                                          : "live",
                                    });
                                    setShowStoreStatusModal(true);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    user.storeStatus === "live"
                                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                  title={
                                    user.storeStatus === "live"
                                      ? "Set to maintenance"
                                      : "Set to live"
                                  }
                                >
                                  {getStoreStatusIcon(
                                    user.storeStatus === "live"
                                      ? "maintenance"
                                      : "live"
                                  )}
                                </button>
                              </>
                            )}
                          {(user.role === "seller" ||
                            user.role === "admin") && (
                            <button
                              onClick={() =>
                                handleFeatureStore(user.id, !user.isFeatured)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                user.isFeatured
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              title={
                                user.isFeatured
                                  ? "Remove from featured stores"
                                  : "Make featured store"
                              }
                            >
                              <SparklesIcon className="h-4 w-4" />
                            </button>
                          )}
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
                              setSelectedRole(user.role);
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
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
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
                  setSelectedRole("");
                }}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedRole && selectedRole !== selectedUser?.role) {
                    handleRoleChange(selectedUser!.id, selectedRole);
                  } else {
                    setShowModal(false);
                    setSelectedUser(null);
                    setSelectedRole("");
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

      {/* Store Details Modal */}
      {showStoreModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-medium text-gray-900">
                  Store Details - {selectedUser.storeName || "No Store Name"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowStoreModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">
                  Store Information
                </h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Store Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.storeName || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Business Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.businessName || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStoreStatusIcon(selectedUser.storeStatus)}
                    <span
                      className={getStoreStatusBadge(selectedUser.storeStatus)}
                    >
                      {selectedUser.storeStatus || "Unknown"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Featured Store
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedUser.isFeatured ? (
                      <SparklesIcon className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                    )}
                    <span className="text-sm text-gray-900">
                      {selectedUser.isFeatured ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">
                  Owner Information
                </h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Owner Name
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <span className={getRoleBadge(selectedUser.role)}>
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Verified
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedUser.verified ? (
                      <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {selectedUser.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-blue-600 uppercase">
                      Orders
                    </div>
                    <div className="text-lg font-semibold text-blue-900">
                      {selectedUser.ordersCount}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-green-600 uppercase">
                      Revenue
                    </div>
                    <div className="text-lg font-semibold text-green-900">
                      ${selectedUser.totalSpent.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-purple-600 uppercase">
                      Products
                    </div>
                    <div className="text-lg font-semibold text-purple-900">
                      {selectedUser.totalProducts || 0}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-yellow-600 uppercase">
                      Rating
                    </div>
                    <div className="text-lg font-semibold text-yellow-900">
                      {selectedUser.averageRating
                        ? selectedUser.averageRating.toFixed(1)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStoreModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Status Change Modal */}
      {showStoreStatusModal && storeStatusAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Store Status
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to change the store status to{" "}
              <span
                className={getStoreStatusBadge(storeStatusAction.newStatus)}
              >
                {storeStatusAction.newStatus}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStoreStatusModal(false);
                  setStoreStatusAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (storeStatusAction) {
                    handleStoreStatusChange(
                      storeStatusAction.userId,
                      storeStatusAction.newStatus
                    );
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
