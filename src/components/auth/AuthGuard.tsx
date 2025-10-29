"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "seller" | "user";
  allowedRoles?: Array<"admin" | "seller" | "user">;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  allowedRoles,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check authentication requirement
      if (requireAuth && !user) {
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(
          currentPath
        )}`;
        router.push(redirectUrl);
        return;
      }

      // Check role requirements
      if (user && requiredRole && user.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      // Check allowed roles
      if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    user,
    loading,
    requireAuth,
    requiredRole,
    allowedRoles,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return null; // Will redirect
  }

  // Check role requirements
  if (user && requiredRole && user.role !== requiredRole) {
    return null; // Will redirect
  }

  // Check allowed roles
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

// Specific guards for common use cases
export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin" fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function SellerGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["seller", "admin"]} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function UserGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

// Guest guard - only allow non-authenticated users
export function GuestGuard({
  children,
  redirectTo = "/",
  fallback,
}: {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
