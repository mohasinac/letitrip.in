"use client";

import {
  AuthActions,
  AuthActionsContext,
} from "@/contexts/auth/AuthActionsContext";
import { useContext } from "react";

/**
 * Hook to access authentication actions without state.
 *
 * This hook provides access to authentication methods including:
 * - login: Login with email and password
 * - loginWithGoogle: Login with Google OAuth
 * - register: Create a new user account
 * - logout: Logout current user
 * - refreshUser: Refresh user data from server
 *
 * Benefits of using this hook:
 * - Components that only need actions won't re-render when state changes
 * - Optimized performance for forms and action buttons
 * - Type-safe access to auth methods
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * // Login form
 * function LoginForm() {
 *   const { login } = useAuthActions();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     try {
 *       await login(email, password);
 *       // Handle success (e.g., redirect)
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={email} onChange={(e) => setEmail(e.target.value)} />
 *       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 *       <button type="submit">Login</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Logout button
 * function LogoutButton() {
 *   const { logout } = useAuthActions();
 *
 *   const handleLogout = async () => {
 *     try {
 *       await logout();
 *       // Handle success (e.g., redirect to login)
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 *
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Registration form
 * function RegisterForm() {
 *   const { register } = useAuthActions();
 *
 *   const handleSubmit = async (data: RegisterData) => {
 *     try {
 *       await register(data);
 *       // Handle success
 *     } catch (error) {
 *       // Handle validation or server errors
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 *
 * @returns Authentication actions object
 */
export function useAuthActions(): AuthActions {
  const context = useContext(AuthActionsContext);

  if (context === undefined) {
    throw new Error(
      "useAuthActions must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    );
  }

  return context;
}
