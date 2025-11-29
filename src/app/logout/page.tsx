"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { COMPANY_NAME } from "@/constants/navigation";
import { LogOut, CheckCircle, Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [status, setStatus] = useState<"logging-out" | "success" | "error">(
    "logging-out",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Small delay to show the UI
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Perform logout
        await logout();

        // Show success message
        setStatus("success");

        // Redirect to homepage after 1.5 seconds using replace
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } catch (err: any) {
        console.error("Logout error:", err);
        setStatus("error");
        setError(err.message || "An error occurred during logout");
      }
    };

    performLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{COMPANY_NAME}</h1>
          </Link>
        </div>

        {/* Logout Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logging Out State */}
          {status === "logging-out" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Logging you out...
                </h2>
                <p className="text-gray-600">
                  {user?.fullName && `Goodbye, ${user.fullName}!`}
                  {!user?.fullName && "Please wait a moment"}
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You've been logged out
                </h2>
                <p className="text-gray-600 mb-4">
                  Thanks for visiting! Redirecting you to the homepage...
                </p>
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              </div>
              {/* Manual redirect button as fallback */}
              <Link
                href="/"
                className="inline-block w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Go to Homepage Now
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Logout Error
                </h2>
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-gray-600">
                  Don't worry, you can still go back to the homepage.
                </p>
              </div>
              <Link
                href="/"
                className="inline-block w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Go to Homepage
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        {status !== "error" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Want to sign back in?{" "}
              <Link
                href="/login"
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
