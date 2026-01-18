"use client";

import { logComponentError } from "@/lib/error-logger";
import {
  ErrorBoundary as LibraryErrorBoundary,
  withErrorBoundary as libraryWithErrorBoundary,
  type ErrorBoundaryProps as LibraryErrorBoundaryProps,
} from "@letitrip/react-library";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import type { ErrorInfo } from "react";

export interface ErrorBoundaryProps
  extends Omit<LibraryErrorBoundaryProps, "onError" | "icons"> {
  onReset?: () => void;
}

/**
 * Error Boundary Component (Next.js wrapper)
 *
 * Catches React errors in child components and displays a fallback UI.
 * Integrates with centralized error logging.
 */
export class ErrorBoundary extends LibraryErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to centralized error logger
    const componentStack =
      errorInfo.componentStack?.split("\n")[1]?.trim() || "UnknownComponent";
    logComponentError("ErrorBoundary", componentStack, error);

    // Call parent implementation
    super.componentDidCatch(error, errorInfo);
  }
}

/**
 * ErrorBoundary with custom icons
 */
export function ErrorBoundaryWithIcons(props: ErrorBoundaryProps) {
  return (
    <LibraryErrorBoundary
      {...props}
      onError={(error, errorInfo) => {
        const componentStack =
          errorInfo.componentStack?.split("\n")[1]?.trim() ||
          "UnknownComponent";
        logComponentError("ErrorBoundary", componentStack, error);
      }}
      icons={{
        error: <AlertTriangle className="w-8 h-8" />,
        refresh: <RefreshCw className="w-4 h-4" />,
        home: <Home className="w-4 h-4" />,
      }}
    />
  );
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  return libraryWithErrorBoundary(Component, {
    ...errorBoundaryProps,
    onError: (error, errorInfo) => {
      const componentStack =
        errorInfo.componentStack?.split("\n")[1]?.trim() || "UnknownComponent";
      logComponentError("ErrorBoundary", componentStack, error);
    },
  });
}

export default ErrorBoundary;
