/**
 * Edit Auction Page
 *
 * Form for sellers to edit existing auction listings.
 *
 * @page /seller/auctions/[id]/edit - Edit auction page
 */

import { FALLBACK_AUCTIONS, fetchWithFallback } from "@/lib/fallback-data";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Auction | Seller Dashboard",
  description: "Update your auction listing details",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Fetch auction details
async function getAuction(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return fetchWithFallback(
    async () => {
      const res = await fetch(`${baseUrl}/api/auctions/${id}`, {
        next: { revalidate: 0 },
      });

      if (!res.ok) throw new Error("Failed to fetch auction");
      const data = await res.json();
      return data.data;
    },
    FALLBACK_AUCTIONS[0],
    `Failed to fetch auction ${id}, using fallback`,
  );
}

export default async function EditAuctionPage({ params }: PageProps) {
  const auction = await getAuction(params.id);

  if (!auction) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Auction
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your auction listing details
            </p>
            {auction.status === "active" && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ This auction is live. Limited edits allowed to protect
                  bidders.
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auction Title *
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={auction.title}
                    disabled={auction.status === "active"}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    defaultValue={auction.description}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </section>

            {/* Auction Settings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Current Auction Status
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Bid
                  </label>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{auction.currentBid?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Bids
                  </label>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {auction.bidCount}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Current Images */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Auction Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {auction.images?.map((image: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Auction ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              {auction.status !== "active" && (
                <button
                  type="button"
                  className="ml-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                  Delete Auction
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
