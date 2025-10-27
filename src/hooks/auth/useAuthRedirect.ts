"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useEnhancedAuth } from '@/hooks/auth/useEnhancedAuth';
import { useEffect } from 'react';

export const useAuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isRole, setStorageItem } = useEnhancedAuth();

  // Save current path when user tries to access protected content
  const saveReturnPath = (path?: string) => {
    const currentPath = path || pathname;
    // Don't store login/register pages as return URLs
    if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
      console.log('Saving return path:', currentPath);
      setStorageItem('auth_redirect_after_login', currentPath);
    }
  };

  // Redirect to login with current page stored for later redirect
  const redirectToLogin = (returnUrl?: string) => {
    saveReturnPath(returnUrl);
    router.push('/login');
  };

  // Check if user needs to be authenticated for protected routes
  const requireAuth = (redirectOnFail = true) => {
    if (loading) return false; // Still loading, don't redirect yet
    
    if (!user) {
      if (redirectOnFail) {
        saveReturnPath();
        router.push('/login');
      }
      return false;
    }
    return true;
  };

  // Check if user has specific role using enhanced auth
  const requireRole = (requiredRole: 'admin' | 'seller' | 'user', redirectOnFail = true) => {
    if (!requireAuth(redirectOnFail)) {
      return false;
    }

    const hasRequiredRole = isRole(requiredRole);

    if (!hasRequiredRole) {
      if (redirectOnFail) {
        router.push('/unauthorized');
      }
      return false;
    }
    return true;
  };

  // Auto-redirect for protected routes
  useEffect(() => {
    if (!loading && !user) {
      // No protected routes remaining
      const protectedRoutes: string[] = [];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute) {
        console.log('Protected route detected, redirecting to login:', pathname);
        saveReturnPath();
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  return {
    redirectToLogin,
    requireAuth,
    requireRole,
    isAuthenticated: !!user,
    user,
    loading,
    saveReturnPath,
  };
};
