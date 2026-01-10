"use client";

import { logServiceError } from "@/lib/error-logger";
import { isAppError } from "@/lib/errors";
import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches React component errors and displays a fallback UI.
 * Integrates with our typed error system and error logger.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => (
 *   <CustomErrorUI error={error} onReset={reset} />
 * )}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error logger
    logServiceError("ErrorBoundary", "componentDidCatch", error);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log additional error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          reset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 *
 * Displayed when an error occurs and no custom fallback is provided.
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const isTypedError = isAppError(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <svg
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isTypedError ? "Something Went Wrong" : "Unexpected Error"}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 text-center mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        {/* Error Details (Development Only) */}
        {isDev && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Error Details:
            </p>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-48">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          If this problem persists, please{" "}
          <a href="/support" className="text-blue-600 hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/**
 * Error Boundary Wrapper for Specific Sections
 *
 * Use this for wrapping specific sections of your app with error boundaries
 * that have section-specific fallback UIs.
 *
 * @example
 * ```tsx
 * <SectionErrorBoundary sectionName="Product List">
 *   <ProductList />
 * </SectionErrorBoundary>
 * ```
 */
export function SectionErrorBoundary({
  children,
  sectionName,
}: {
  children: ReactNode;
  sectionName: string;
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-8 text-center">
          <div className="inline-block p-4 bg-red-50 rounded-lg">
            <svg
              className="h-8 w-8 text-red-500 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-red-800 font-medium mb-1">
              Error in {sectionName}
            </p>
            <p className="text-red-600 text-sm mb-3">{error.message}</p>
            <button
              onClick={reset}
              className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
