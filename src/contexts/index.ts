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
export type { SessionUser, SessionContextValue } from "./SessionContext";

// Bottom Actions Context
export {
  BottomActionsProvider,
  useBottomActionsContext,
} from "./BottomActionsContext";
export type {
  BottomAction,
  BottomBulkConfig,
  BottomActionsState,
} from "./BottomActionsContext";

// Dashboard Nav Context
export { DashboardNavProvider, useDashboardNav } from "./DashboardNavContext";
