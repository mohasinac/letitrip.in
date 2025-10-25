"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  isProtectedRoute,
  getRouteGroup,
  ROUTE_GROUPS,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
} from "@/constants/routes";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if route requires authentication
    if (!isProtectedRoute(pathname)) {
      setAuthorized(true);
      return;
    }

    // Wait for auth to load
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push(
        `${AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }

    // Check role-based access
    const routeGroup = getRouteGroup(pathname);
    const hasAccess = checkRoleAccess(routeGroup, userRole);

    if (!hasAccess) {
      // Redirect to appropriate page based on user role
      redirectBasedOnRole(userRole);
      return;
    }

    setAuthorized(true);
  }, [user, loading, userRole, pathname, router]);

  const checkRoleAccess = (
    routeGroup: string,
    role: string | null
  ): boolean => {
    switch (routeGroup) {
      case ROUTE_GROUPS.ADMIN:
        return role === "admin";
      case ROUTE_GROUPS.SELLER:
        return role === "seller" || role === "admin";
      case ROUTE_GROUPS.ACCOUNT:
        return role === "user" || role === "seller" || role === "admin";
      default:
        return true;
    }
  };

  const redirectBasedOnRole = (role: string | null) => {
    switch (role) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "seller":
        router.push("/seller/dashboard");
        break;
      case "user":
        router.push("/account/dashboard");
        break;
      default:
        router.push(PUBLIC_ROUTES.HOME);
    }
  };

  // Show loading state
  if (loading || (isProtectedRoute(pathname) && !authorized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message
  if (isProtectedRoute(pathname) && !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
