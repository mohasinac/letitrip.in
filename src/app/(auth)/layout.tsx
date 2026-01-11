"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Auth Layout
 *
 * Layout for authentication pages (login, register, forgot password, etc.).
 *
 * Features:
 * - Redirects authenticated users to their dashboard
 * - Provides centered, minimal layout for auth forms
 * - No header/footer to keep focus on authentication flow
 *
 * Pages in this group:
 * - /login
 * - /register
 * - /logout
 * - /forgot-password
 * - /reset-password
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users away from auth pages
    if (!loading && isAuthenticated) {
      // Determine redirect based on user role
      if (user?.role === "admin") {
        router.push("/admin");
      } else if (user?.role === "seller") {
        router.push("/seller");
      } else {
        router.push("/user");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render auth pages if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Render auth pages with minimal layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
