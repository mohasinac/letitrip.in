"use client";

import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { useEffect, useState } from "react";
import { cookieStorage } from "@/lib/storage/cookieStorage";

export default function AuthDebug() {
  const { user, loading, error, checkAuth } = useEnhancedAuth();
  const [cookies, setCookies] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Get all cookies for debugging
    if (typeof window !== "undefined") {
      setCookies(document.cookie);
    }
  }, []);

  const runTests = async () => {
    const results = [];

    // Test 1: Check /api/auth/me directly
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();
      results.push({
        test: "API /auth/me",
        status: response.status,
        success: response.ok,
        data: data,
      });
    } catch (error) {
      results.push({
        test: "API /auth/me",
        status: "error",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 2: Check cookie test_user
    try {
      const testUser = cookieStorage.getJson("test_user");
      results.push({
        test: "Cookie test_user",
        success: !!testUser,
        data: testUser,
      });
    } catch (error) {
      results.push({
        test: "Cookie test_user",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 3: Force auth check
    try {
      await checkAuth();
      results.push({
        test: "Force checkAuth()",
        success: true,
        data: "Completed",
      });
    } catch (error) {
      results.push({
        test: "Force checkAuth()",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    setTestResults(results);
  };

  const loginAsAdmin = () => {
    const testUser = {
      id: `test-admin-${Date.now()}`,
      email: "admin@test.com",
      name: "Test Admin",
      role: "admin",
    };
    cookieStorage.setJson("test_user", testUser);
    window.location.reload();
  };

  const loginAsSeller = () => {
    const testUser = {
      id: `test-seller-${Date.now()}`,
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller",
    };
    cookieStorage.setJson("test_user", testUser);
    window.location.reload();
  };

  const clearAuth = () => {
    cookieStorage.remove("test_user");
    cookieStorage.removeAuthToken();
    cookieStorage.removeUserData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Debug
          </h1>

          {/* Current Auth State */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
            <div className="bg-gray-50 rounded p-4">
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
              <p>
                <strong>Error:</strong> {error || "None"}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {user ? JSON.stringify(user, null, 2) : "Not logged in"}
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Cookies</h2>
            <div className="bg-gray-50 rounded p-4">
              <p className="font-mono text-sm">{cookies || "No cookies"}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loginAsAdmin}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Login as Admin
              </button>
              <button
                onClick={loginAsSeller}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login as Seller
              </button>
              <button
                onClick={clearAuth}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Auth
              </button>
              <button
                onClick={runTests}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Run Tests
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Test Results</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded p-4 ${
                      result.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <h3 className="font-medium">{result.test}</h3>
                    <p>
                      <strong>Success:</strong> {result.success ? "✅" : "❌"}
                    </p>
                    {result.status && (
                      <p>
                        <strong>Status:</strong> {result.status}
                      </p>
                    )}
                    {result.data && (
                      <pre className="mt-2 text-sm bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                    {result.error && (
                      <p className="text-red-600 mt-2">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tests */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Navigation Tests</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin/dashboard"
                className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Admin Dashboard
              </a>
              <a
                href="/seller/dashboard"
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Seller Dashboard
              </a>
              <a
                href="/account"
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
