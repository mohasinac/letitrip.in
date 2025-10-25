"use client";

import { useState } from "react";

// Toast notification component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  );
};

// Progress indicator component
const ProgressIndicator = ({ message }: { message: string }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminCleanupPage() {
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    deletedCount?: {
      products: number;
      sellers: number;
      categories: number;
      auctions: number;
    };
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  const handleCleanupSeeded = async () => {
    console.log("Cleanup button clicked!");
    showToast("Cleanup process started", "info");

    if (
      !confirm(
        "Are you sure you want to remove all seeded data? This action cannot be undone."
      )
    ) {
      console.log("User cancelled cleanup");
      showToast("Cleanup cancelled by user", "info");
      return;
    }

    console.log("Starting cleanup process...");
    setLoading(true);
    setProgressMessage("Initializing cleanup process...");
    setResult(null);
    showToast("Starting seeded data removal...", "info");

    try {
      setProgressMessage("Connecting to database...");
      console.log("Making API request...");

      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "seeded" }),
      });

      setProgressMessage("Processing cleanup request...");
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          deletedCount: data.details,
        });
        showToast("Seeded data removed successfully!", "success");
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to cleanup seeded data",
        });
        showToast(data.error || "Failed to cleanup seeded data", "error");
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResult({
        success: false,
        error: errorMessage,
      });
      showToast("Error during cleanup: " + errorMessage, "error");
    } finally {
      setLoading(false);
      setProgressMessage("");
    }
  };

  const handleCleanupAll = async () => {
    showToast("Delete all data process started", "info");

    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL data from the database! Are you absolutely sure?"
      )
    ) {
      showToast("Delete all cancelled by user", "info");
      return;
    }

    if (
      !confirm(
        "This will permanently delete all products, categories, sellers, and auctions. This cannot be undone!"
      )
    ) {
      showToast("Delete all cancelled by user", "info");
      return;
    }

    setLoading(true);
    setProgressMessage("Initializing complete database cleanup...");
    setResult(null);
    showToast("⚠️ Starting complete database cleanup...", "info");

    try {
      setProgressMessage("Connecting to database...");
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "all" }),
      });

      setProgressMessage("Processing complete cleanup...");
      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          deletedCount: data.details,
        });
        showToast("All data deleted successfully!", "success");
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to cleanup all data",
        });
        showToast(data.error || "Failed to cleanup all data", "error");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResult({
        success: false,
        error: errorMessage,
      });
      showToast("Error during cleanup: " + errorMessage, "error");
    } finally {
      setLoading(false);
      setProgressMessage("");
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Progress Indicator */}
      {loading && progressMessage && (
        <ProgressIndicator message={progressMessage} />
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-6">Firebase Data Cleanup</h1>

            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                Clean up data from your Firebase database. Choose between
                removing only seeded sample data or all data.
              </p>

              {/* Test buttons to verify functionality */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => {
                    alert("Button click works!");
                    showToast("Test button clicked successfully!", "info");
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Test Button (Click to verify)
                </button>

                <button
                  onClick={() =>
                    showToast("Toast notification test", "success")
                  }
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  Test Toast
                </button>

                <button
                  onClick={() => {
                    setLoading(true);
                    setProgressMessage("Testing progress indicator...");
                    setTimeout(() => {
                      setLoading(false);
                      setProgressMessage("");
                      showToast("Progress test completed!", "success");
                    }, 3000);
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
                >
                  Test Progress (3s)
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Cleanup Seeded Data */}
              <div className="bg-white p-6 border-2 border-orange-200 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-orange-800">
                  Remove Seeded Data Only
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  This will remove only the sample data that was added during
                  initialization:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-6">
                  <li>Sample products (19 items)</li>
                  <li>Sample sellers (7 stores)</li>
                  <li>Sample categories (10 categories)</li>
                  <li>Sample auctions (4 auctions)</li>
                </ul>
                <button
                  onClick={handleCleanupSeeded}
                  disabled={loading}
                  className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Cleaning up...</span>
                    </div>
                  ) : (
                    "Remove Seeded Data"
                  )}
                </button>
              </div>

              {/* Cleanup All Data */}
              <div className="bg-white p-6 border-2 border-red-200 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-red-800">
                  Remove All Data
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  ⚠️ <strong>WARNING:</strong> This will permanently delete ALL
                  data from your database:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-6">
                  <li>All products</li>
                  <li>All sellers</li>
                  <li>All categories</li>
                  <li>All auctions</li>
                  <li>Everything else</li>
                </ul>
                <button
                  onClick={handleCleanupAll}
                  disabled={loading}
                  className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting everything...</span>
                    </div>
                  ) : (
                    "Delete All Data"
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8">
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {result.success ? (
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3
                        className={`text-sm font-medium ${
                          result.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {result.success ? "Success!" : "Error"}
                      </h3>
                      <div
                        className={`mt-2 text-sm ${
                          result.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        <p>{result.message || result.error}</p>
                        {result.deletedCount && (
                          <div className="mt-2">
                            <p>Deleted items:</p>
                            <ul className="list-disc list-inside ml-4">
                              <li>{result.deletedCount.products} products</li>
                              <li>{result.deletedCount.sellers} sellers</li>
                              <li>
                                {result.deletedCount.categories} categories
                              </li>
                              <li>{result.deletedCount.auctions} auctions</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                💡 Recommendations:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Use "Remove Seeded Data Only" to clean up sample data while
                  keeping any real data you've added
                </li>
                <li>
                  • Always backup your database before performing cleanup
                  operations
                </li>
                <li>
                  • The cleanup cannot be undone - make sure you want to proceed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
