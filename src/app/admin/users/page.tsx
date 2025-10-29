"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Shield,
  AlertCircle,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

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

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "role" | "ban" | "document" | null
  >(null);
  const [newRole, setNewRole] = useState<"user" | "seller" | "admin">("user");
  const [actionLoading, setActionLoading] = useState(false);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Users",
      href: "/admin/users",
      active: true,
    },
  ]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/users");
      setUsers(response || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setSearching(true);
      const response = await apiClient.get(
        `/admin/users/search?q=${searchQuery}`
      );
      setUsers(response || []);
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  // Handle user actions
  const handleAction = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      switch (modalType) {
        case "role":
          await apiClient.put(`/admin/users/${selectedUser.id}/role`, {
            role: newRole,
          });
          toast.success(`User role changed to ${newRole}`);
          break;

        case "ban":
          await apiClient.put(`/admin/users/${selectedUser.id}/ban`, {
            isBanned: !selectedUser.isBanned,
          });
          toast.success(
            `User ${selectedUser.isBanned ? "unbanned" : "banned"} successfully`
          );
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
          toast.success("User document created successfully");
          break;
      }

      // Refresh users list
      fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error performing action:", error);
      toast.error(error.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (user: User, type: "role" | "ban" | "document") => {
    setSelectedUser(user);
    setModalType(type);
    if (type === "role") {
      setNewRole(user.role);
    }
    setShowModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={fetchUsers}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "seller"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isBanned
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(user, "role")}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Change role"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(user, "ban")}
                            className={`p-2 rounded transition-colors ${
                              user.isBanned
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title={user.isBanned ? "Unban user" : "Ban user"}
                          >
                            {user.isBanned ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openModal(user, "document")}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Create user document"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Admins</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Sellers</p>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter((u) => u.role === "seller").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Banned Users</p>
            <p className="text-3xl font-bold text-red-600">
              {users.filter((u) => u.isBanned).length}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalType === "role" && "Change User Role"}
              {modalType === "ban" &&
                (selectedUser.isBanned ? "Unban User" : "Ban User")}
              {modalType === "document" && "Create User Document"}
            </h2>

            {modalType === "role" && (
              <div>
                <p className="text-gray-600 mb-4">
                  Change role for <strong>{selectedUser.email}</strong>
                </p>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "user" | "seller" | "admin")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {modalType === "ban" && (
              <p className="text-gray-600 mb-4">
                {selectedUser.isBanned
                  ? `Unbanning ${selectedUser.email} will restore their account access.`
                  : `Banning ${selectedUser.email} will disable their account and prevent login.`}
              </p>
            )}

            {modalType === "document" && (
              <p className="text-gray-600 mb-4">
                Create or recreate the Firestore document for{" "}
                <strong>{selectedUser.email}</strong>? This will ensure all user
                data is properly synchronized.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminUsersContent />
    </RoleGuard>
  );
}
