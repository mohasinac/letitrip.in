/**
 * Custom Error Page
 *
 * Handles all errors in the app (404, 500, etc.)
 */

"use client";

import { logger } from "@/lib/client-logger";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to client logger
    logger.error("Application Error", error, "ErrorPage");
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 md:p-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Something Went Wrong
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              We encountered an unexpected error.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Don't worry, we're on it! Please try again.
            </p>
          </div>

          {/* Development Error Details */}
          {isDev && (
            <div className="mb-8 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  🐛 Error Details (Development Only):
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                  {error.message || "Unknown error"}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              {error.stack && (
                <details className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                    📋 Stack Trace (Click to expand)
                  </summary>
                  <pre className="mt-3 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-96 p-3 bg-gray-100 dark:bg-gray-950 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  💡 Debugging Tips:
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Check the browser console for more details</li>
                  <li>• Look for network errors in the Network tab</li>
                  <li>• Verify your API endpoints are responding</li>
                  <li>• Check server logs for backend errors</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Link>
          </div>

          {isDev && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => logger.downloadLogs()}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Logs
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reload Page
              </button>
            </div>
          )}

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Contact Support
              </Link>
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                Error Reference: {error.digest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
