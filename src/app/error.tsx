"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logError } from "@/lib/firebase-error-logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an unexpected error. Don't worry, we're on it!
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-400 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link
              href="/support/ticket"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
