// Thin shim - real implementation in @mohasinac/monitoring
export {
  ErrorSeverity,
  ErrorCategory,
  setErrorTracker,
  trackError,
  trackApiError,
  trackAuthError,
  trackValidationError,
  trackDatabaseError,
  trackPermissionError,
} from "@mohasinac/appkit/monitoring";
export type {
  ErrorContext,
  TrackedError,
  ErrorTrackerFn,
} from "@mohasinac/appkit/monitoring";
