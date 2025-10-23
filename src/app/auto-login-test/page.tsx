"use client";

import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { useEffect, useState } from "react";

export default function AutoLoginTestPage() {
  const { login, user, loading } = useEnhancedAuth();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-login on page load
  useEffect(() => {
    if (!loginAttempted && !user && !loading) {
      setLoginAttempted(true);

      // Check if there's a redirect path stored
      const storedPath = localStorage.getItem("auth_redirect_after_login");
      console.log("Auto-login test: Stored redirect path:", storedPath);

      // Log in with test credentials
      login("test@test.com", "password123")
        .then(() => {
          console.log("Auto-login successful!");
        })
        .catch((err) => {
          console.error("Auto-login failed:", err);
          setError(err.message);
        });
    }
  }, [login, user, loading, loginAttempted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Auto-Login Test</h1>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Logging in...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {user && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            <h2 className="font-semibold mb-2">✅ Login Successful!</h2>
            <p>Welcome, {user.name || user.email || "User"}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p className="text-sm mt-2">
              You should be redirected to the original page you were trying to
              access.
            </p>
          </div>
        )}

        {!loading && !user && loginAttempted && !error && (
          <div className="text-center">
            <p>Attempting login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
