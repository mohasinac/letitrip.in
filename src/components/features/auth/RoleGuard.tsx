"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasRoleAccess, UserRole } from "@/lib/auth/roles";
import { useEnhancedAuth } from '@/lib/hooks/auth/useEnhancedAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackUrl?: string;
  loadingComponent?: React.ReactNode;
}

export default function RoleGuard({
  children,
  requiredRole,
  fallbackUrl = "/login",
  loadingComponent,
}: RoleGuardProps) {
  const { user, loading, isRole, canAccess, setStorageItem } =
    useEnhancedAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      setStorageItem("auth_redirect_after_login", currentPath);

      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check if user has required role access using enhanced auth
    const access =
      hasRoleAccess(user.role as UserRole, requiredRole) ||
      isRole(requiredRole as any) ||
      canAccess(`${requiredRole}_panel`);

    setHasAccess(access);

    if (!access) {
      router.push(fallbackUrl === "/login" ? "/unauthorized" : fallbackUrl);
      return;
    }
  }, [
    user,
    loading,
    requiredRole,
    fallbackUrl,
    router,
    isRole,
    canAccess,
    setStorageItem,
  ]);

  if (loading) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!user || !hasAccess) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}
