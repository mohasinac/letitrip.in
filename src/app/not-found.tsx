/**
 * Custom 404 Not Found Page
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found - Let It Rip",
  description: "The page you are looking for does not exist",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 md:p-12">
          {/* 404 Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-gray-200 dark:text-gray-700">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              It might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Here are some helpful links:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home Page
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Browse Products
              </Link>
              <Link
                href="/auctions"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Active Auctions
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Search Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Or search for what you need:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search");
                window.location.href = `/search?q=${encodeURIComponent(
                  query as string,
                )}`;
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="search"
                placeholder="Search products, auctions..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
