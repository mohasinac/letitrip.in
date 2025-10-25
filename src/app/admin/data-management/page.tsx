"use client";

import { useState } from "react";

export default function AdminDataManagementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    details?: any;
  } | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupSeeded = async () => {
    if (
      !confirm(
        "Are you sure you want to remove all seeded sample data? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "seeded" }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupAll = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL data from your database! Are you absolutely sure?"
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This is irreversible! Type 'DELETE ALL' to confirm you want to delete everything."
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "all" }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout py-12">
      <div className="container max-w-4xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Database Management</h1>
            <p className="text-muted-foreground">
              Manage your Firebase database with sample data seeding and cleanup
              tools
            </p>
          </div>

          {/* Initialize Data Card */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-4 text-green-700">
              🌱 Seed Sample Data
            </h2>
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                This will populate your Firebase database with comprehensive
                sample data including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>4 Parent Categories:</strong> Battle Gear,
                    Collectibles, Gaming, Accessories
                  </li>
                  <li>
                    <strong>11 Child Categories:</strong> Hierarchical
                    organization
                  </li>
                  <li>
                    <strong>14 Products:</strong> Diverse range across all
                    categories
                  </li>
                  <li>
                    <strong>2 Sample Auctions:</strong> Live and upcoming
                  </li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Complex category relationships (parent-child)</li>
                  <li>Rich product data with SEO, images, variants</li>
                  <li>Realistic pricing and inventory levels</li>
                  <li>Professional product descriptions</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Safe to run multiple times
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    This will add new data each time. Use cleanup functions to
                    remove duplicates if needed.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleInitialize}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? "Seeding Database..." : "🌱 Seed Sample Data"}
            </button>
          </div>

          {/* Cleanup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cleanup Seeded Data */}
            <div className="card p-6 border-orange-200">
              <h2 className="text-xl font-bold mb-4 text-orange-700">
                🧹 Remove Seeded Data
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Removes only the sample data that was seeded by the
                initialization script. Your existing data will remain untouched.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground mb-4">
                <li>Removes 14 seeded products by SKU</li>
                <li>Removes 15 seeded categories by slug</li>
                <li>Removes 2 sample auctions</li>
                <li>Preserves all other data</li>
              </ul>
              <button
                onClick={handleCleanupSeeded}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Cleaning..." : "🧹 Remove Seeded Data"}
              </button>
            </div>

            {/* Cleanup All Data */}
            <div className="card p-6 border-red-200">
              <h2 className="text-xl font-bold mb-4 text-red-700">
                ⚠️ Delete All Data
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                <strong className="text-red-600">DANGER:</strong> This will
                permanently delete ALL products, categories, and auctions from
                your database.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground mb-4">
                <li className="text-red-600">Deletes ALL products</li>
                <li className="text-red-600">Deletes ALL categories</li>
                <li className="text-red-600">Deletes ALL auctions</li>
                <li className="text-red-600">Cannot be undone!</li>
              </ul>
              <button
                onClick={handleCleanupAll}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Deleting..." : "⚠️ Delete All Data"}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div
              className={`card p-6 ${
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <svg
                      className="h-6 w-6 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3
                    className={`text-lg font-medium ${
                      result.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {result.success ? "Success!" : "Error"}
                  </h3>
                  <p
                    className={`mt-1 ${
                      result.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.message || result.error}
                  </p>
                  {result.details && (
                    <div className="mt-3">
                      <details className="cursor-pointer">
                        <summary
                          className={`text-sm font-medium ${
                            result.success ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          View Details
                        </summary>
                        <pre
                          className={`mt-2 text-xs p-3 rounded ${
                            result.success
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          } overflow-auto`}
                        >
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category Structure Preview */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">
              📋 Seeded Category Structure
            </h2>
            <div className="text-sm space-y-3">
              <div>
                <div className="font-semibold text-blue-700">
                  ⚔️ Battle Gear & Equipment
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>→ 🌪️ Spinning Tops (3 products)</div>
                  <div>→ 🏟️ Battle Stadiums (2 products)</div>
                  <div>→ 🚀 Launching Systems (2 products)</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-purple-700">
                  🏆 Collectibles & Memorabilia
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>→ 💎 Limited Editions (2 products)</div>
                  <div>→ 🕰️ Vintage Collection (1 product)</div>
                  <div>→ 🥇 Championship Items</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-green-700">
                  🎮 Gaming & Entertainment
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>→ 🦾 Action Figures (1 product)</div>
                  <div>→ 🎴 Trading Cards (1 product)</div>
                  <div>→ 🎲 Board Games</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">
                  🔧 Accessories & Parts
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>→ ⚙️ Replacement Parts (1 product)</div>
                  <div>→ 💼 Storage & Cases (1 product)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
