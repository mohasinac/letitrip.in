"use client";

import { AuthState, AuthStateContext } from "@/contexts/auth/AuthStateContext";
import { useContext } from "react";

/**
 * Hook to access authentication state without actions.
 *
 * This hook provides read-only access to authentication state including:
 * - user: Current authenticated user or null
 * - loading: Whether auth state is being initialized
 * - isAuthenticated: Whether a user is logged in
 * - isAdmin: Whether current user is an admin
 * - isSeller: Whether current user is a seller
 * - isAdminOrSeller: Whether current user is admin or seller
 *
 * Benefits of using this hook:
 * - Components that only need state won't re-render when actions are called
 * - Optimized performance for components that display user info
 * - Type-safe access to auth state
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * // Display user profile
 * function UserProfile() {
 *   const { user, loading } = useAuthState();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not logged in</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user.displayName}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional rendering based on role
 * function AdminPanel() {
 *   const { isAdmin } = useAuthState();
 *
 *   if (!isAdmin) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return <div>Admin content...</div>;
 * }
 * ```
 *
 * @returns Authentication state object
 */
export function useAuthState(): AuthState {
  const context = useContext(AuthStateContext);

  if (context === undefined) {
    throw new Error(
      "useAuthState must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    );
  }

  return context;
}
