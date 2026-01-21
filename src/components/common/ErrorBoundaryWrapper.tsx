/**
 * ErrorBoundary with Logger Integration
 *
 * Wraps library ErrorBoundary with our logger
 */

"use client";

import { logger } from "@/lib/logger";
import { ErrorBoundary as LibraryErrorBoundary } from "@mohasinac/react-library";
import { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error(error, {
      context: "ErrorBoundary",
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  };

  return (
    <LibraryErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </LibraryErrorBoundary>
  );
}
