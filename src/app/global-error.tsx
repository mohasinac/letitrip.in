"use client";

/**
 * Global Error Handler
 *
 * Catches errors in the root layout and provides a fallback UI.
 * This is required for production error handling.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to error tracking service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
            padding: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: "50%",
                  padding: "2rem",
                  display: "inline-block",
                }}
              >
                <svg
                  style={{ width: "64px", height: "64px", color: "#ef4444" }}
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
            </div>

            {/* Error Title */}
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "1rem",
              }}
            >
              Something Went Wrong
            </h1>

            {/* Error Description */}
            <p
              style={{
                fontSize: "1.125rem",
                color: "#6b7280",
                marginBottom: "2rem",
              }}
            >
              A critical error occurred. Please try refreshing the page.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && error.message && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  marginBottom: "2rem",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#991b1b",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontFamily: "monospace",
                      marginTop: "0.5rem",
                    }}
                  >
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  minWidth: "200px",
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  backgroundColor: "white",
                  color: "#3b82f6",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "2px solid #3b82f6",
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                  minWidth: "200px",
                }}
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
