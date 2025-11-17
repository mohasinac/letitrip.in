"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Home, Mail, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const requiredRole = searchParams.get("role");
  const currentRole = searchParams.get("current");
  const resource = searchParams.get("resource");
  const details = searchParams.get("details");

  const decodedDetails = details ? decodeURIComponent(details) : null;
  const isDevelopment = process.env.NODE_ENV === "development";

  const getMessage = () => {
    if (reason === "insufficient-permissions") {
      return {
        title: "Insufficient Permissions",
        message:
          "You don't have the necessary permissions to access this resource.",
        suggestion: "Contact an administrator to request access.",
      };
    }
    if (reason === "wrong-role") {
      return {
        title: "Access Denied - Wrong Role",
        message: `This resource requires ${
          requiredRole || "higher"
        } privileges.`,
        suggestion: "Your current role doesn't have access to this area.",
      };
    }
    if (reason === "account-suspended") {
      return {
        title: "Account Suspended",
        message: "Your account has been temporarily suspended.",
        suggestion: "Please contact support to resolve this issue.",
      };
    }
    if (reason === "email-not-verified") {
      return {
        title: "Email Verification Required",
        message:
          "You need to verify your email address to access this feature.",
        suggestion: "Please check your inbox for the verification link.",
      };
    }

    return {
      title: "Access Forbidden",
      message: "You don't have permission to access this resource.",
      suggestion: "Contact support if you believe this is an error.",
    };
  };

  const messageInfo = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">403</h1>
              <p className="text-purple-100">Forbidden</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {messageInfo.title}
          </h2>

          <p className="text-gray-600 mb-4">{messageInfo.message}</p>
          <p className="text-gray-500 text-sm mb-6">{messageInfo.suggestion}</p>

          {/* Role Information */}
          {(requiredRole || currentRole) && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">
                Permission Details
              </p>
              <div className="space-y-1">
                {requiredRole && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-700">Required Role:</span>
                    <span className="font-semibold text-purple-900">
                      {requiredRole}
                    </span>
                  </div>
                )}
                {currentRole && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-700">Your Role:</span>
                    <span className="font-semibold text-purple-900">
                      {currentRole}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resource Info */}
          {resource && (
            <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <p className="text-sm font-medium text-pink-900 mb-1">
                Requested Resource
              </p>
              <p className="text-sm text-pink-700 font-mono break-all">
                {resource}
              </p>
            </div>
          )}

          {/* Developer Details */}
          {isDevelopment && decodedDetails && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold text-yellow-900 uppercase mb-2">
                🛠️ Developer Info
              </p>
              <pre className="text-xs text-yellow-800 font-mono whitespace-pre-wrap break-words">
                {decodedDetails}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>

            {reason === "email-not-verified" && (
              <Link
                href="/verify-email"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Verify Email
              </Link>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Need assistance?</p>
            <div className="flex gap-4">
              <Link
                href="/support/ticket"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Help Center
              </Link>
              <Link
                href="/account/settings"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
