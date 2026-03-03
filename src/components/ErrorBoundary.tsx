/**
 * Error Boundary Component
 *
 * Catches and handles React errors in the component tree
 */

"use client";

import React, { Component, ReactNode } from "react";
import { Button, Text, Heading } from "@/components";
import { ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { Logger } from "@/classes";
import { useTranslations } from "next-intl";
import { nowISO } from "@/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallbackView({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const t = useTranslations("errorPages");
  const tActions = useTranslations("actions");
  const { flex } = THEME_CONSTANTS;
  return (
    <div
      className={`min-h-screen ${flex.center} bg-gray-50 dark:bg-gray-950 px-4`}
    >
      <div
        className={`max-w-md w-full ${THEME_CONSTANTS.themed.bgPrimary} rounded-lg shadow-lg p-8 text-center`}
      >
        <div className="mb-6">
          <div
            className={`inline-flex ${flex.center} w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4`}
          >
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <Heading
            level={1}
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
          >
            {t("genericError.title")}
          </Heading>
          <Text variant="secondary" className="mb-6">
            {ERROR_MESSAGES.GENERIC.INTERNAL_ERROR}
          </Text>

          {process.env.NODE_ENV === "development" && error && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
              <Text size="sm" className="font-mono text-red-600 break-all">
                {error.message}
              </Text>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={onReset}>
            {tActions("tryAgain")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/")}
          >
            {tActions("goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  private logger = Logger.getInstance({
    enableConsole: true,
    enableFileLogging: true, // Write errors to files
  });

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Logger class for centralized error tracking
    this.logger.error("ErrorBoundary caught an error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: nowISO(),
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackView
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
