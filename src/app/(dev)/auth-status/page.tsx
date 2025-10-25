"use client";

import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";
import { useCart } from "@/contexts/CartContext";
import { cookieStorage } from "@/lib/storage/cookieStorage";

export default function AuthStatusPage() {
  const { user, loading } = useEnhancedAuth();
  const { items, totalItems } = useCart();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">System Status</h1>

        <div className="space-y-6">
          {/* Authentication Status */}
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">
              🔐 Authentication Status
            </h2>

            {loading && (
              <div className="text-yellow-600">
                ⏳ Checking authentication...
              </div>
            )}

            {!loading && user && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
                <div className="font-semibold">✅ Authenticated</div>
                <div className="text-sm mt-1">
                  <strong>Name:</strong> {user.name || user.email || "User"}
                  <br />
                  <strong>Email:</strong> {user.email || "No email"}
                  <br />
                  <strong>Role:</strong> {user.role}
                  <br />
                  <strong>ID:</strong> {user.id}
                </div>
              </div>
            )}

            {!loading && !user && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                <div className="font-semibold">❌ Not Authenticated</div>
                <div className="text-sm mt-1">
                  Please log in to access protected features.
                </div>
              </div>
            )}
          </div>

          {/* Cart Status */}
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">🛒 Cart Status</h2>

            {totalItems > 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded">
                <div className="font-semibold">
                  🛍️ Cart has {totalItems} items
                </div>
                <div className="text-sm mt-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name || `Item ${item.productId}`}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 p-3 rounded">
                <div className="font-semibold">🛒 Cart is empty</div>
              </div>
            )}
          </div>

          {/* Local Storage Info */}
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">💾 Local Storage</h2>

            <div className="text-sm space-y-2">
              <div>
                <strong>Redirect Path:</strong>{" "}
                {typeof window !== "undefined"
                  ? cookieStorage.get("auth_redirect_after_login") || "None"
                  : "Loading..."}
              </div>
              <div>
                <strong>Guest Cart:</strong>{" "}
                {typeof window !== "undefined"
                  ? JSON.stringify(cookieStorage.getCartData())
                    ? "Present"
                    : "None"
                  : "Loading..."}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">🔗 Test Navigation</h2>

            <div className="space-y-2">
              <div>
                <a href="/test-auth" className="text-blue-600 hover:underline">
                  → Test Protected Route (/test-auth)
                </a>
              </div>
              <div>
                <a href="/account" className="text-blue-600 hover:underline">
                  → Account Page (protected)
                </a>
              </div>
              <div>
                <a href="/login" className="text-blue-600 hover:underline">
                  → Login Page
                </a>
              </div>
              <div>
                <a
                  href="/auto-login-test"
                  className="text-blue-600 hover:underline"
                >
                  → Auto Login Test
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
