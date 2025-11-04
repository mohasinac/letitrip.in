/**
 * Error Logging Setup
 * Initialize this in your root layout or app component
 */

"use client";

import { useEffect } from "react";
import { setupGlobalErrorHandlers } from "@/lib/api/services/error-logging.service";

/**
 * Component to initialize error logging
 * Place this in your root layout
 */
export function ErrorLoggingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize global error handlers
    setupGlobalErrorHandlers();

    // Log that error logging is initialized (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Error logging service initialized");
    }
  }, []);

  return <>{children}</>;
}

/**
 * Hook to access error logging in components
 */
export { errorLoggingService } from "@/lib/api/services/error-logging.service";
export type {
  ErrorLogEntry,
  LogErrorOptions,
} from "@/lib/api/services/error-logging.service";
