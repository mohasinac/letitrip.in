"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

export default function TestNavigationPage() {
  const { user, login, checkAuth } = useEnhancedAuth();
  const [testRole, setTestRole] = useState<"user" | "admin" | "seller">("user");

  const handleTestLogin = async () => {
    const testUser = {
      id: "test-user",
      email: "test@example.com",
      name: `Test ${testRole.charAt(0).toUpperCase() + testRole.slice(1)}`,
      role: testRole,
    };

    // Store test user in localStorage for the auth check
    localStorage.setItem("test_user", JSON.stringify(testUser));

    // Call checkAuth to refresh the user state immediately
    await checkAuth();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-6">
              <h1 className="text-2xl font-bold mb-6">Navigation Test Page</h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Current User Status
                  </h2>
                  {user ? (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p>
                        <strong>Name:</strong> {user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {user.role}
                      </p>
                      <p className="text-green-600 mt-2">✓ Logged in</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Not logged in</p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Test Different Roles
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Use this to test the new admin/seller navigation buttons in
                    the header.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Role to Test:
                      </label>
                      <select
                        value={testRole}
                        onChange={(e) =>
                          setTestRole(
                            e.target.value as "user" | "admin" | "seller"
                          )
                        }
                        className="input w-full max-w-xs"
                      >
                        <option value="user">User (Regular)</option>
                        <option value="admin">Admin</option>
                        <option value="seller">Seller</option>
                      </select>
                    </div>

                    <button
                      onClick={handleTestLogin}
                      className="btn btn-primary"
                    >
                      Login as{" "}
                      {testRole.charAt(0).toUpperCase() + testRole.slice(1)}
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Expected Navigation Behavior
                  </h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>User Role:</strong> Only shows user avatar and
                      dropdown (no extra buttons)
                    </p>
                    <p>
                      <strong>Admin Role:</strong> Shows red "Admin" button with
                      shield icon
                    </p>
                    <p>
                      <strong>Seller Role:</strong> Shows blue "Seller" button
                      with document icon
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Note: This is a test page for navigation functionality. The
                    buttons should appear in the header beside the user icon
                    when logged in with admin/seller roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
