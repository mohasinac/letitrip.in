"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Home, Search, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason");
  const resource = searchParams?.get("resource");
  const details = searchParams?.get("details");

  // Decode URL-encoded details
  const decodedDetails = details ? decodeURIComponent(details) : null;
  const isDevelopment = process.env.NODE_ENV === "development";

  const getErrorMessage = () => {
    if (reason === "product-not-found") {
      return {
        title: "Product Not Found",
        message:
          "The product you're looking for doesn't exist or has been removed.",
        icon: "📦",
      };
    }
    if (reason === "shop-not-found") {
      return {
        title: "Shop Not Found",
        message: "This shop doesn't exist or may have been closed.",
        icon: "🏪",
      };
    }
    if (reason === "auction-not-found") {
      return {
        title: "Auction Not Found",
        message: "This auction doesn't exist or has ended.",
        icon: "🔨",
      };
    }
    if (reason === "category-not-found") {
      return {
        title: "Category Not Found",
        message: "This category doesn't exist in our system.",
        icon: "📂",
      };
    }
    if (reason === "user-not-found") {
      return {
        title: "User Not Found",
        message: "The user profile you're looking for doesn't exist.",
        icon: "👤",
      };
    }
    if (reason === "order-not-found") {
      return {
        title: "Order Not Found",
        message: "We couldn't find this order in our system.",
        icon: "📋",
      };
    }

    // Default 404
    return {
      title: "Page Not Found",
      message: "The page you're looking for doesn't exist or has been moved.",
      icon: "🔍",
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{errorInfo.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-white">404</h1>
              <p className="text-blue-100">Resource Not Found</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {errorInfo.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{errorInfo.message}</p>

          {/* Resource Info */}
          {resource && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Requested Resource
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-mono break-all">
                    {resource}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Developer Details */}
          {isDevelopment && decodedDetails && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-300 uppercase mb-2">
                Developer Information
              </p>
              <pre className="text-xs text-yellow-800 dark:text-yellow-400 font-mono whitespace-pre-wrap break-words">
                {decodedDetails}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/products"
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Products
              </Link>
              <Link
                href="/shops"
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Shops
              </Link>
              <Link
                href="/auctions"
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Auctions
              </Link>
            </div>
          </div>

          {/* Search Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Can't find what you're looking for?
            </p>
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
            >
              <Search className="w-4 h-4" />
              Search Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  );
}
