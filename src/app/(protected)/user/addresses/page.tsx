/**
 * User Addresses Page
 *
 * Manage saved shipping addresses.
 *
 * @page /user/addresses - User addresses page
 */

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { FALLBACK_ADDRESSES, fetchWithFallback } from "@/lib/fallback-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Addresses | Let It Rip",
  description: "Manage your saved shipping addresses",
};

// Fetch user addresses
async function getUserAddresses() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return fetchWithFallback(
    async () => {
      const res = await fetch(`${baseUrl}${API_ENDPOINTS.ADDRESSES.LIST}`, {
        next: { revalidate: 60 },
      });

      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      return data.data || [];
    },
    FALLBACK_ADDRESSES,
    "Failed to fetch addresses, using fallback",
  );
}

export default async function UserAddressesPage() {
  const addresses = await getUserAddresses();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Addresses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your saved shipping addresses
              </p>
            </div>
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition">
              + Add New Address
            </button>
          </div>

          {/* Addresses Grid */}
          {addresses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.map((address: any) => (
                <div
                  key={address.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-primary transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {address.name}
                      </h3>
                      {address.isDefault && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {address.fullName}
                    </p>
                    <p>{address.phone}</p>
                    <p>
                      {address.address}
                      <br />
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>

                  {!address.isDefault && (
                    <button className="mt-4 w-full px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-16 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Addresses Saved
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add your first shipping address to make checkout faster
              </p>
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition">
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
