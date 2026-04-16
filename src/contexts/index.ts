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
} from "@mohasinac/appkit/features/layout";
export type {
  BottomAction,
  BottomBulkConfig,
  BottomActionsState,
} from "@mohasinac/appkit/features/layout";

// Dashboard Nav Context — moved to appkit
export {
  DashboardNavProvider,
  useDashboardNav,
} from "@mohasinac/appkit/features/layout";
export type { DashboardNavState } from "@mohasinac/appkit/features/layout";

