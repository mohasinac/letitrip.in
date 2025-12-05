/**
 * @fileoverview React Component
 * @module src/components/common/ErrorBoundary
 * @description This file contains the ErrorBoundary component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logComponentError } from "@/lib/error-logger";

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Children */
  children: ReactNode;
  /** Fallback */
  fallback?: ReactNode;
  /** On Reset */
  onReset?: () => void;
  /** Reset Keys */
  resetKeys?: Array<string | number>;
}

/**
 * State interface
 * 
 * @interface
 * @description Defines the structure and contract for State
 */
interface State {
  /** Has Error */
  hasError: boolean;
  /** Error */
  error: Error | null;
  /** Error Info */
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches React errors in child components and displays a fallback UI
 * with recovery options. Integrates with centralized error logging.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With reset handler
 * ```tsx
 * <ErrorBoundary onReset={() => router.refresh()}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      /** Has Error */
      hasError: false,
      /** Error */
      error: null,
      /** Error Info */
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      /** Has Error */
      hasError: true,
      error,
      /** Error Info */
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to centralized error logger
    logComponentError(
      "ErrorBoundary",
      this.getComponentStack(errorInfo),
      error,
    );

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i])
    ) {
      this.reset();
    }
  }

  private getComponentStack(errorInfo: ErrorInfo): string {
    const stack = errorInfo.componentStack?.split("\n")[1]?.trim();
    return stack || "UnknownComponent";
  }

  private reset = () => {
    this.setState({
      /** Has Error */
      hasError: false,
      /** Error */
      error: null,
      /** Error Info */
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    globalThis.location?.reload();
  };

  private handleGoHome = () => {
    if (globalThis.location) {
      globalThis.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 text-center mb-6">
              We're sorry for the inconvenience. An error occurred while loading
              this page.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-900">
                      Component Stack
                    </summary>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
/**
 * Performs with error boundary operation
 *
 * @param {React.ComponentType<P>} Component - The  component
 * @param {Omit<Props, "children">} [errorBoundaryProps] - The error boundary props
 *
 * @returns {any} The witherrorboundary result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withErrorBoundary(Component, errorBoundaryProps);
 */

/**
 * Performs with error boundary operation
 *
 * @returns {any} The witherrorboundary result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withErrorBoundary();
 */

export function withErrorBoundary<P extends object>(
  /** Component */
  Component: React.ComponentType<P>,
  /** Error Boundary Props */
  errorBoundaryProps?: Omit<Props, "children">,
) {
  /**
   * Performs wrapped component operation
   *
   * @param {P} props - The props
   *
   * @returns {any} The wrappedcomponent result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs wrapped component operation
   *
   * @param {P} props - The props
   *
   * @returns {any} The wrappedcomponent result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}
