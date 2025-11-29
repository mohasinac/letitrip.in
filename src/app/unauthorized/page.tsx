"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, Home, LogIn, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const requiredRole = searchParams.get("role");
  const resource = searchParams.get("resource");
  const details = searchParams.get("details");

  const decodedDetails = details ? decodeURIComponent(details) : null;
  const isDevelopment = process.env.NODE_ENV === "development";

  const getMessage = () => {
    if (reason === "not-logged-in") {
      return {
        title: "Authentication Required",
        message: "You need to sign in to access this page.",
        suggestion: "Please log in with your account to continue.",
      };
    }
    if (reason === "session-expired") {
      return {
        title: "Session Expired",
        message: "Your session has expired for security reasons.",
        suggestion: "Please log in again to continue.",
      };
    }
    if (reason === "invalid-token") {
      return {
        title: "Invalid Authentication",
        message: "Your authentication token is invalid or has been revoked.",
        suggestion: "Please log in again to get a new token.",
      };
    }

    return {
      title: "Unauthorized Access",
      message: "You need to be logged in to access this page.",
      suggestion: "Please sign in to continue.",
    };
  };

  const messageInfo = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">401</h1>
              <p className="text-red-100">Unauthorized</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {messageInfo.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-4">{messageInfo.message}</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">{messageInfo.suggestion}</p>

          {/* Required Role */}
          {requiredRole && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">
                Required Permission
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                You need <span className="font-semibold">{requiredRole}</span>{" "}
                role to access this resource.
              </p>
            </div>
          )}

          {/* Resource Info */}
          {resource && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                Requested Resource
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 font-mono break-all">
                {resource}
              </p>
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
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-red-500 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Need help with your account?
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Create Account
              </Link>
              {/* NOTE: /forgot-password route does not exist - password reset via support ticket */}
              <Link
                href="/support/ticket"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Unauthorized() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
