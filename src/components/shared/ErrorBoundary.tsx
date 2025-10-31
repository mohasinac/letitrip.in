"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorLogger } from "@/lib/utils/errorLogger";
import { PrimaryButton, OutlineButton } from "@/components/ui/unified";
import { UnifiedCard, CardContent } from "@/components/ui/unified";
import { UnifiedAlert } from "@/components/ui/unified";

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
        <div className="min-h-screen bg-surfaceVariant flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-error mb-4">
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
              <h1 className="text-3xl font-bold text-text mb-2">
                Something went wrong
              </h1>
              <p className="text-lg text-textSecondary mb-8">
                {isDevelopment
                  ? "An error occurred while rendering this component."
                  : "We're sorry, but something unexpected happened. Please try again."}
              </p>
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <UnifiedCard variant="elevated">
              <CardContent>
                <div className="space-y-4">
                  <PrimaryButton fullWidth onClick={this.handleReset}>
                    Try Again
                  </PrimaryButton>

                  <OutlineButton fullWidth onClick={this.handleReload}>
                    Reload Page
                  </OutlineButton>

                  {showDetails && this.state.error && (
                    <div className="mt-8">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-textSecondary mb-2">
                          Error Details (Development)
                        </summary>
                        <UnifiedAlert
                          variant="error"
                          filled={false}
                          className="mt-2"
                        >
                          <div className="text-sm">
                            <div className="font-medium mb-2">
                              Error: {this.state.error.name}
                            </div>
                            <div className="mb-4">
                              {this.state.error.message}
                            </div>
                            {this.state.error.stack && (
                              <div>
                                <div className="font-medium mb-2">
                                  Stack Trace:
                                </div>
                                <pre className="text-xs whitespace-pre-wrap bg-error/10 p-2 rounded overflow-auto max-h-32">
                                  {this.state.error.stack}
                                </pre>
                              </div>
                            )}
                            {this.state.errorInfo && (
                              <div className="mt-4">
                                <div className="font-medium mb-2">
                                  Component Stack:
                                </div>
                                <pre className="text-xs whitespace-pre-wrap bg-error/10 p-2 rounded overflow-auto max-h-32">
                                  {this.state.errorInfo.componentStack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </UnifiedAlert>
                      </details>
                    </div>
                  )}
                </div>
              </CardContent>
            </UnifiedCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
