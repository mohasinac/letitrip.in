/**
 * Global Error Page - 500
 *
 * Displayed when a fatal server error occurs
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Server Error - Let It Rip",
  description: "An unexpected error occurred",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body>
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  500 - Server Error
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  Oops! Something went wrong on our end.
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  We're working to fix the issue. Please try again later.
                </p>
              </div>

              {/* Development Error Details */}
              {isDev && (
                <div className="mb-8 space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                      Error Details (Development Only):
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
                      <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
                >
                  Go Home
                </Link>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If this problem persists, please{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact support
                  </Link>
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Reference ID: {error.digest}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
