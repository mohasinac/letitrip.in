"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasRoleAccess, UserRole } from "@/lib/auth/roles";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(fallbackUrl);
      return;
    }

    // Check if user has required role access
    const access = hasRoleAccess(user.role as UserRole, requiredRole);
    setHasAccess(access);

    if (!access) {
      router.push(fallbackUrl);
      return;
    }
  }, [user, loading, requiredRole, fallbackUrl, router]);

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
