"use client";

import { useState, useEffect } from "react";

export default function SellerSettings() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Seller Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your seller account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-600">
            Configure your seller account settings here.
          </p>
        </div>
      </div>
    </div>
  );
}
