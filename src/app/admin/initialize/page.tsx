"use client";

import { useState } from "react";
import { initializeFirebaseData } from "@/lib/firebase/initialize";

export default function AdminInitializePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setResult(null);

    try {
      const result = await initializeFirebaseData();
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
      <div className="container max-w-2xl">
        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-6">
            Firebase Data Initialization
          </h1>

          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              This will populate your Firebase database with sample data
              including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Sample products (Beyblades, Stadiums, Launchers, etc.)</li>
              <li>Sample auctions (Live and upcoming auctions)</li>
              <li>Product categories</li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This will add sample data to your Firebase database. Make
                      sure you want to do this in your current environment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleInitialize}
            disabled={loading}
            className="btn btn-primary w-full mb-4"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Initializing Database...
              </>
            ) : (
              "Initialize Firebase with Sample Data"
            )}
          </button>

          {result && (
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
                    <p>{result.success ? result.message : result.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>After initialization, you can:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Visit the{" "}
                  <a href="/products" className="text-primary hover:underline">
                    Products page
                  </a>{" "}
                  to see the sample products
                </li>
                <li>
                  Check the{" "}
                  <a href="/auctions" className="text-primary hover:underline">
                    Auctions page
                  </a>{" "}
                  for live auctions
                </li>
                <li>
                  Test the real-time updates by opening multiple browser tabs
                </li>
                <li>Try adding items to cart and placing bids</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
