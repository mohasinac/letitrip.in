"use client";

import Link from "next/link";
import { useModernTheme } from "@/contexts/ModernThemeContext";

export default function NotFound() {
  const { mode } = useModernTheme();
  return (
    <div
      className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
        mode === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div
            className={`mx-auto h-24 w-24 mb-4 ${
              mode === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          >
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
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1
            className={`text-6xl font-bold mb-2 ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            404
          </h1>
          <h2
            className={`text-2xl font-semibold mb-4 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Page Not Found
          </h2>
          <p
            className={`text-lg mb-8 ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
            mode === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          <div className="space-y-4">
            <Link
              href="/"
              className="w-full block text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                mode === "dark"
                  ? "border border-gray-600 hover:bg-gray-700 text-gray-200"
                  : "border border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              Go Back
            </button>

            <div className="text-center pt-4">
              <Link
                href="/contact"
                className="text-green-600 hover:text-green-700 text-sm transition-colors"
              >
                Need help? Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful suggestions */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mt-12">
        <div
          className={`border rounded-md p-6 ${
            mode === "dark"
              ? "bg-green-900 border-green-700"
              : "bg-green-50 border-green-200"
          }`}
        >
          <h3
            className={`text-lg font-medium mb-4 ${
              mode === "dark" ? "text-green-100" : "text-green-900"
            }`}
          >
            What you can do:
          </h3>
          <ul
            className={`space-y-2 ${
              mode === "dark" ? "text-green-200" : "text-green-800"
            }`}
          >
            <li className="flex items-start">
              <span
                className={`flex-shrink-0 h-5 w-5 mt-0.5 ${
                  mode === "dark" ? "text-green-400" : "text-green-500"
                }`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="ml-2">Check the URL for typos</span>
            </li>
            <li className="flex items-start">
              <span
                className={`flex-shrink-0 h-5 w-5 mt-0.5 ${
                  mode === "dark" ? "text-green-400" : "text-green-500"
                }`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="ml-2">Visit our homepage to explore</span>
            </li>
            <li className="flex items-start">
              <span
                className={`flex-shrink-0 h-5 w-5 mt-0.5 ${
                  mode === "dark" ? "text-green-400" : "text-green-500"
                }`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="ml-2">Contact us if you need assistance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
