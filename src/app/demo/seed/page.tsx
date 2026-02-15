"use client";

import { useState } from "react";
import { Button, Card, Alert } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

type CollectionName =
  | "users"
  | "addresses"
  | "categories"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs";

interface SeedResponse {
  success: boolean;
  message: string;
  details?: {
    created?: number;
    updated?: number;
    deleted?: number;
    skipped?: number;
    errors?: number;
    collections?: string[];
  };
}

export default function DemoSeedPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SeedResponse | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionName[]
  >([]);

  const allCollections: CollectionName[] = [
    "users",
    "addresses",
    "categories",
    "products",
    "orders",
    "reviews",
    "bids",
    "coupons",
    "carouselSlides",
    "homepageSections",
    "siteSettings",
    "faqs",
  ];

  const handleSeedData = async (
    action: "load" | "delete",
    collections?: CollectionName[],
  ) => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          collections: collections || allCollections,
        }),
      });

      const data: SeedResponse = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collection: CollectionName) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection],
    );
  };

  const selectAll = () => setSelectedCollections(allCollections);
  const deselectAll = () => setSelectedCollections([]);

  // Check if we're in development
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            This page is only accessible in development mode.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary} py-8 px-4`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className={`text-3xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                🌱 Seed Data Manager
              </h1>
              <p
                className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
              >
                Development Only - Manage seed data with ID-based operations
              </p>
            </div>
            <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded">
              DEV MODE
            </div>
          </div>

          <Alert variant="warning" className="mt-4">
            <strong>⚠️ Warning:</strong> This page performs direct database
            operations. All operations are ID-based to prevent mixing with
            production data.
          </Alert>
        </Card>

        {/* Collection Selection */}
        <Card className="p-6">
          <h2
            className={`text-xl font-bold ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
          >
            Select Collections
          </h2>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={selectAll}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              Select All
            </Button>
            <Button
              onClick={deselectAll}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              Deselect All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allCollections.map((collection) => (
              <label
                key={collection}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedCollections.includes(collection)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection)}
                  onChange={() => toggleCollection(collection)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {collection}
                </span>
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {selectedCollections.length} of {allCollections.length} collections
            selected
          </p>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6">
          <h2
            className={`text-xl font-bold ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
          >
            Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Load All */}
            <div className="space-y-2">
              <Button
                onClick={() => handleSeedData("load")}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? "Processing..." : "📥 Load All Seed Data"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Loads all seed data into Firestore (226 documents)
              </p>
            </div>

            {/* Load Selected */}
            <div className="space-y-2">
              <Button
                onClick={() => handleSeedData("load", selectedCollections)}
                disabled={loading || selectedCollections.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Processing..." : "📥 Load Selected"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Loads only selected collections
              </p>
            </div>

            {/* Delete All */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete all seed data? This cannot be undone.",
                    )
                  ) {
                    handleSeedData("delete");
                  }
                }}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Processing..." : "🗑️ Delete All Seed Data"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Deletes seed data by ID only (safe)
              </p>
            </div>

            {/* Delete Selected */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  if (
                    confirm(
                      `Delete seed data from ${selectedCollections.length} collections?`,
                    )
                  ) {
                    handleSeedData("delete", selectedCollections);
                  }
                }}
                disabled={loading || selectedCollections.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loading ? "Processing..." : "🗑️ Delete Selected"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Deletes selected collections by ID
              </p>
            </div>
          </div>
        </Card>

        {/* Response Display */}
        {response && (
          <Card className="p-6">
            <h2
              className={`text-xl font-bold ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
            >
              Result
            </h2>

            <Alert
              variant={response.success ? "success" : "error"}
              className="mb-4"
            >
              <strong>{response.success ? "✅ Success" : "❌ Error"}:</strong>{" "}
              {response.message}
            </Alert>

            {response.details && (
              <div
                className={`${THEME_CONSTANTS.themed.bgSecondary} rounded-lg p-4 space-y-2`}
              >
                <h3
                  className={`font-semibold ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Details:
                </h3>
                {response.details.created !== undefined && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    ✨ Created: <strong>{response.details.created}</strong> new
                    documents
                  </p>
                )}
                {response.details.updated !== undefined &&
                  response.details.updated > 0 && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      🔄 Updated: <strong>{response.details.updated}</strong>{" "}
                      existing documents
                    </p>
                  )}
                {response.details.deleted !== undefined && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    🗑️ Deleted: <strong>{response.details.deleted}</strong>{" "}
                    documents
                  </p>
                )}
                {response.details.skipped !== undefined &&
                  response.details.skipped > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ⏭️ Skipped: <strong>{response.details.skipped}</strong>{" "}
                      (not found)
                    </p>
                  )}
                {response.details.errors !== undefined &&
                  response.details.errors > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Errors: <strong>{response.details.errors}</strong>
                    </p>
                  )}
                {response.details.collections && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Collections processed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.details.collections.map((col) => (
                        <span
                          key={col}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ About ID-Based Operations
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>
              All operations use specific document IDs from seed data files
            </li>
            <li>
              Delete operations will ONLY remove documents with seed data IDs
            </li>
            <li>
              This prevents accidentally affecting other data in the database
            </li>
            <li>Safe to use even if database has other non-seed documents</li>
            <li>
              Total seed documents: 226 across 12 collections (includes 17
              addresses)
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
