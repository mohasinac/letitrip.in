"use client";

import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

export default function UserDebug() {
  const { user, loading } = useEnhancedAuth();

  if (process.env.NODE_ENV === "production") {
    return null; // Hide in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-1">Debug Info:</div>
      <div>Loading: {loading ? "Yes" : "No"}</div>
      <div>User: {user ? "Logged in" : "Not logged in"}</div>
      {user && (
        <>
          <div>Role: {user.role}</div>
          <div>Email: {user.email}</div>
        </>
      )}
    </div>
  );
}
