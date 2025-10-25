"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requireRole?: "admin" | "seller" | "user";
}

export default function ProtectedRoute({
  children,
  fallbackUrl = "/login",
  requireRole,
}: ProtectedRouteProps) {
  const { user, loading, isRole, setStorageItem } = useEnhancedAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("ProtectedRoute: checking auth", {
      user: !!user,
      loading,
      pathname,
    });

    if (!loading) {
      if (!user) {
        // Store current path for redirect after login using enhanced storage
        console.log(
          "ProtectedRoute: No user, storing path and redirecting",
          pathname
        );
        if (pathname !== "/login" && pathname !== "/register") {
          setStorageItem("auth_redirect_after_login", pathname);
        }
        router.push(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role requirements using enhanced auth
      if (requireRole) {
        const hasRequiredRole = isRole(requireRole);

        if (!hasRequiredRole) {
          console.log(
            "ProtectedRoute: Insufficient role, redirecting to unauthorized"
          );
          router.push("/unauthorized");
          return;
        }
      }

      console.log("ProtectedRoute: Auth check passed");
    }
  }, [user, loading, pathname, router, fallbackUrl, requireRole]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render children if user doesn't have required role
  if (requireRole) {
    const roleHierarchy = { admin: 3, seller: 2, user: 1 };
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy];
    const requiredLevel = roleHierarchy[requireRole];

    if (userLevel < requiredLevel) {
      return null;
    }
  }

  return <>{children}</>;
}
