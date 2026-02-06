/**
 * Contexts Index
 *
 * Centralized exports for all React contexts.
 * Import from this file instead of individual context files.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, useTheme, SessionProvider, useSession } from '@/contexts';
 * ```
 */

// Theme Context
export { ThemeProvider, useTheme } from "./ThemeContext";
// Note: ThemeMode type is exported from @/constants/theme to avoid duplication

// Session Context
export { SessionProvider, useSession, useAuth } from "./SessionContext";
export type { SessionUser } from "./SessionContext";
