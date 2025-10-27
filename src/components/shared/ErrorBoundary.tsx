"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorLogger } from "@/lib/utils/errorLogger";
// Using regular button elements instead of custom Button component

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log the error using our error logger
    errorLogger.logError(error, errorInfo, {
      source: "ErrorBoundary",
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === "development";
      const showDetails = this.props.showDetails ?? isDevelopment;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-red-500 mb-4">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {isDevelopment
                  ? "An error occurred while rendering this component."
                  : "We're sorry, but something unexpected happened. Please try again."}
              </p>
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Try Again
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Reload Page
                </button>

                {showDetails && this.state.error && (
                  <div className="mt-8">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700 mb-2">
                        Error Details (Development)
                      </summary>
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-sm">
                          <div className="font-medium text-red-800 mb-2">
                            Error: {this.state.error.name}
                          </div>
                          <div className="text-red-700 mb-4">
                            {this.state.error.message}
                          </div>
                          {this.state.error.stack && (
                            <div>
                              <div className="font-medium text-red-800 mb-2">
                                Stack Trace:
                              </div>
                              <pre className="text-xs text-red-600 whitespace-pre-wrap bg-red-100 p-2 rounded overflow-auto max-h-32">
                                {this.state.error.stack}
                              </pre>
                            </div>
                          )}
                          {this.state.errorInfo && (
                            <div className="mt-4">
                              <div className="font-medium text-red-800 mb-2">
                                Component Stack:
                              </div>
                              <pre className="text-xs text-red-600 whitespace-pre-wrap bg-red-100 p-2 rounded overflow-auto max-h-32">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
