"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {isDevelopment
              ? "An unexpected error occurred. Check the console for details."
              : "We're sorry, but something unexpected happened. Our team has been notified."}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>

            <Link
              href="/"
              className="w-full block text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors"
            >
              Go Home
            </Link>

            <Link
              href="/contact"
              className="w-full block text-center text-blue-600 hover:text-blue-700 py-2 px-4 text-sm transition-colors"
            >
              Contact Support
            </Link>

            {isDevelopment && (
              <div className="mt-8">
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm">
                      <div className="font-medium text-red-800 mb-2">
                        Error: {error.name}
                      </div>
                      <div className="text-red-700 mb-4">{error.message}</div>
                      {error.digest && (
                        <div className="text-red-600 mb-4">
                          <strong>Digest:</strong> {error.digest}
                        </div>
                      )}
                      {error.stack && (
                        <div>
                          <div className="font-medium text-red-800 mb-2">
                            Stack Trace:
                          </div>
                          <pre className="text-xs text-red-600 whitespace-pre-wrap bg-red-100 p-2 rounded overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
