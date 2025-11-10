"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }
    }

    setIsAuthorized(true);
  }, [
    requireAuth,
    redirectTo,
    allowedRoles,
    router,
    user,
    isAuthenticated,
    loading,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
