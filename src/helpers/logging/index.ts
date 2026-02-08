/**
 * Logging Helpers
 *
 * Centralized logging utilities for client and server
 */

// Client-side logging (safe for browser)
export {
  logClientError,
  logClientWarning,
  logClientInfo,
  logClientDebug,
  logApiError,
  logValidationError,
  logNavigationError,
  logAuthError,
  logUploadError,
  logPaymentError,
  logApplicationError,
  initializeClientLogger,
  type ErrorContext,
} from "./error-logger";

// Server-side logging utilities are exported separately
// Import from './server-error-logger' directly in API routes/server components
// DO NOT re-export here to avoid including server code in client bundle
