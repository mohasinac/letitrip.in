/**
 * Protected Route Wrapper
 * 
 * Higher-order component to protect routes.
 * Redirects to login if user is not authenticated.
 * Optionally checks for specific roles.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { Spinner } from '@/components';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not authenticated
    if (!session) {
      router.push(`${redirectTo}?callbackUrl=${window.location.pathname}`);
      return;
    }

    // Check role if required
    if (requiredRole) {
      const userRole = (session.user as any).role as UserRole;
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
      }
    }
  }, [session, status, router, requiredRole, redirectTo]);

  // Show loading spinner while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!session) {
    return null;
  }

  // Check role before rendering
  if (requiredRole) {
    const userRole = (session.user as any).role as UserRole;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has required role
 */
export function useRequireRole(requiredRole: UserRole | UserRole[]) {
  const { data: session } = useSession();

  if (!session) return false;

  const userRole = (session.user as any).role as UserRole;
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return allowedRoles.includes(userRole);
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    role: (session?.user as any)?.role as UserRole | undefined,
  };
}
