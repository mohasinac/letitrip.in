"use client";

import { useState, useEffect } from "react";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import {
  hasRoleAccess,
  getAvailableDashboards,
  canAccessAdmin,
  canAccessSeller,
} from "@/lib/auth/roles";
import { cookieStorage } from "@/lib/storage/cookieStorage";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "seller" | "user";
}

export default function TestRoles() {
  const {
    user: authUser,
    checkAuth,
    hasPermission,
    isRole,
    canAccess,
  } = useEnhancedAuth();
  const [user, setUser] = useState<User | null>(null);
  const [testRole, setTestRole] = useState<"admin" | "seller" | "user">("user");

  useEffect(() => {
    // Use real user if available, otherwise mock user for testing
    if (authUser) {
      setUser(authUser);
      setTestRole(authUser.role);
    } else {
      setUser({
        id: "test-user",
        email: "test@example.com",
        name: "Test User",
        role: testRole,
      });
    }
  }, [testRole, authUser]);

  const switchToActualRole = async (role: "admin" | "seller" | "user") => {
    const testUser = {
      id: `test-${role}-${Date.now()}`,
      email: `${role}@test.com`,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
    };

    // Store test user in cookies
    cookieStorage.setJson("test_user", testUser);

    // Refresh auth state
    await checkAuth();

    // Update local state
    setTestRole(role);

    // Refresh the page to ensure header updates
    setTimeout(() => window.location.reload(), 100);
  };

  const clearTestUser = () => {
    cookieStorage.remove("test_user");
    window.location.reload();
  };

  const testRoleAccess = (requiredRole: "admin" | "seller" | "user") => {
    if (!user) return false;
    return hasRoleAccess(user.role, requiredRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Role-Based Access Control Test
          </h1>

          {/* Help Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">
              🔧 How to Test Admin/Seller Tabs
            </h2>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                <strong>Step 1:</strong> Click "Login as Admin" or "Login as
                Seller" buttons below
              </p>
              <p>
                <strong>Step 2:</strong> Look at the header - you should see
                colored buttons next to your user menu:
              </p>
              <ul className="ml-4 mt-2 space-y-1">
                <li>
                  • <strong>Admin users:</strong> Red "Admin" button + Blue
                  "Seller" button
                </li>
                <li>
                  • <strong>Seller users:</strong> Blue "Seller" button only
                </li>
                <li>
                  • <strong>Regular users:</strong> No extra buttons
                </li>
              </ul>
              <p>
                <strong>Step 3:</strong> Click the admin/seller buttons to
                navigate to dashboards
              </p>
            </div>
          </div>

          {/* Role Selector */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test as Role (Functions Only):
              </label>
              <select
                value={testRole}
                onChange={(e) =>
                  setTestRole(e.target.value as "admin" | "seller" | "user")
                }
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Switch Actual Login Role (Updates Header):
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => switchToActualRole("admin")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Login as Admin
                </button>
                <button
                  onClick={() => switchToActualRole("seller")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Login as Seller
                </button>
                <button
                  onClick={() => switchToActualRole("user")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  Login as User
                </button>
                <button
                  onClick={clearTestUser}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                >
                  Clear & Logout
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click these buttons to actually login as different roles and see
                the admin/seller tabs in the header.
              </p>
            </div>
          </div>

          {/* Current User Info */}
          {user && (
            <div
              className={`rounded-lg p-4 mb-8 ${
                authUser
                  ? "bg-green-50 border border-green-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <h3
                className={`text-lg font-medium mb-2 ${
                  authUser ? "text-green-900" : "text-blue-900"
                }`}
              >
                Current User {authUser ? "(Actually Logged In)" : "(Mock User)"}
              </h3>
              <p>
                <span className="font-medium">Role:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "seller"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Name:</span> {user.name}
              </p>
              {authUser && (
                <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                  ✅ This user is actually logged in! Check the header for
                  admin/seller buttons.
                </div>
              )}
            </div>
          )}

          {/* Access Tests */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Access Control Tests
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Admin Access */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    testRoleAccess("admin")
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h4 className="font-medium mb-2">Admin Dashboard</h4>
                  <p className="text-sm">
                    Status:{" "}
                    {testRoleAccess("admin") ? "✅ Allowed" : "❌ Denied"}
                  </p>
                </div>

                {/* Seller Access */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    testRoleAccess("seller")
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h4 className="font-medium mb-2">Seller Dashboard</h4>
                  <p className="text-sm">
                    Status:{" "}
                    {testRoleAccess("seller") ? "✅ Allowed" : "❌ Denied"}
                  </p>
                </div>

                {/* User Access */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    testRoleAccess("user")
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h4 className="font-medium mb-2">User Features</h4>
                  <p className="text-sm">
                    Status:{" "}
                    {testRoleAccess("user") ? "✅ Allowed" : "❌ Denied"}
                  </p>
                </div>
              </div>
            </div>

            {/* Available Dashboards */}
            {user && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Available Dashboards
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {getAvailableDashboards(user.role).map((dashboard) => (
                      <li
                        key={dashboard.path}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-green-600">✓</span>
                        <span className="font-medium">{dashboard.name}</span>
                        <span className="text-gray-500">
                          ({dashboard.path})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Role Hierarchy Explanation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Role Hierarchy
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Admin:</strong> Can access admin dashboard, seller
                    dashboard, and all user features
                  </li>
                  <li>
                    <strong>Seller:</strong> Can access seller dashboard and all
                    user features
                  </li>
                  <li>
                    <strong>User:</strong> Can only access user features
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Function Tests */}
            {user && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Function Tests
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">canAccessAdmin()</h4>
                    <p className="text-sm">
                      Result:{" "}
                      {canAccessAdmin(user.role) ? "✅ True" : "❌ False"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">canAccessSeller()</h4>
                    <p className="text-sm">
                      Result:{" "}
                      {canAccessSeller(user.role) ? "✅ True" : "❌ False"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
