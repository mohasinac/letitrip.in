"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { useState, useEffect } from "react";
import {
  UserRole,
  hasRoleAccess,
  getRoleDisplayName,
  getRoleBadgeClasses,
} from "@/lib/auth/roles";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export default function UserFeaturesPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <RoleGuard requiredRole="user">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                User Features Demo
              </h1>
              {user && (
                <div
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadgeClasses(
                    user.role
                  )}`}
                >
                  {getRoleDisplayName(user.role)}
                </div>
              )}
            </div>

            {user && (
              <div className="space-y-8">
                {/* Access Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">
                    🎉 Access Granted!
                  </h2>
                  <p className="text-blue-800 mb-4">
                    Welcome,{" "}
                    <strong>{user.name || user.email || "User"}</strong>! As a{" "}
                    <strong>{getRoleDisplayName(user.role)}</strong>, you can
                    access all user features because:
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <code>
                        hasRoleAccess("{user.role}", "user") ={" "}
                        {hasRoleAccess(user.role, "user")
                          ? "✅ true"
                          : "❌ false"}
                      </code>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Your role level (
                      {user.role === "admin"
                        ? "3"
                        : user.role === "seller"
                        ? "2"
                        : "1"}
                      ) is greater than or equal to the required user level (1)
                    </p>
                  </div>
                </div>

                {/* User Features Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* My Orders */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        📦
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        My Orders
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      View and track your order history
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      View Orders
                    </button>
                  </div>

                  {/* Account Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        ⚙️
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        Account Settings
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage your profile and preferences
                    </p>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>

                  {/* Wishlist */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        ❤️
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        Wishlist
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Save items for later purchase
                    </p>
                    <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
                      View Wishlist
                    </button>
                  </div>

                  {/* Address Book */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        🏠
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        Address Book
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage shipping addresses
                    </p>
                    <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                      Edit Addresses
                    </button>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        💳
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        Payment Methods
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage saved payment options
                    </p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      View Payment Methods
                    </button>
                  </div>

                  {/* Support */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        🎧
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        Support
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Get help and contact support
                    </p>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>

                {/* Role-Specific Message */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Role-Specific Access Information
                  </h3>

                  {user.role === "admin" && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-red-800">
                        <strong>As an Admin:</strong> You have full access to
                        user features, plus you can also access the Admin
                        Dashboard and Seller Dashboard.
                      </p>
                    </div>
                  )}

                  {user.role === "seller" && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800">
                        <strong>As a Seller:</strong> You have full access to
                        user features, plus you can also access the Seller
                        Dashboard to manage your products.
                      </p>
                    </div>
                  )}

                  {user.role === "user" && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">
                        <strong>As a User:</strong> You have access to all
                        standard user features for shopping and account
                        management.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
