"use client";

import { useState, useEffect } from "react";
import {
  hasRoleAccess,
  getAvailableDashboards,
  canAccessAdmin,
  canAccessSeller,
} from "@/lib/auth/roles";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "seller" | "user";
}

export default function TestRoles() {
  const [user, setUser] = useState<User | null>(null);
  const [testRole, setTestRole] = useState<"admin" | "seller" | "user">("user");

  useEffect(() => {
    // Mock user for testing
    setUser({
      id: "test-user",
      email: "test@example.com",
      name: "Test User",
      role: testRole,
    });
  }, [testRole]);

  const testRoleAccess = (requiredRole: "admin" | "seller" | "user") => {
    if (!user) return false;
    return hasRoleAccess(user.role, requiredRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Role-Based Access Control Test
          </h1>

          {/* Role Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test as Role:
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

          {/* Current User Info */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Current User
              </h3>
              <p>
                <span className="font-medium">Role:</span> {user.role}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
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
