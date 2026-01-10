"use client";

/**
 * Auth Context Module
 *
 * Split authentication context for optimal performance:
 * - AuthStateContext: Read-only state (user, loading, isAuthenticated, etc.)
 * - AuthActionsContext: Authentication methods (login, logout, register, etc.)
 * - AuthProvider: Combines both contexts and manages state
 *
 * This split prevents unnecessary re-renders:
 * - Components that only read state won't re-render when actions are called
 * - Components that only use actions won't re-render when state changes
 *
 * @example
 * ```tsx
 * // Setup in app layout
 * import { AuthProvider } from '@/contexts/auth';
 *
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Use in components
 * import { useAuthState, useAuthActions } from '@/hooks/useAuth';
 *
 * // Component that only needs state
 * function UserProfile() {
 *   const { user, loading } = useAuthState();
 *   // Won't re-render when login/logout is called
 * }
 *
 * // Component that only needs actions
 * function LoginForm() {
 *   const { login } = useAuthActions();
 *   // Won't re-render when user state changes
 * }
 * ```
 */

export { AuthActionsContext, type AuthActions } from "./AuthActionsContext";
export { AuthProvider } from "./AuthProvider";
export { AuthStateContext, type AuthState } from "./AuthStateContext";
