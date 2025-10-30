"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);

    // Try to detect theme from localStorage or system preference
    try {
      const savedTheme = localStorage.getItem("theme");
      const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDark(savedTheme === "dark" || (!savedTheme && systemTheme));
    } catch {
      // Fallback if localStorage is not available
      setIsDark(false);
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html className={isDark ? "dark" : ""}>
      <head>
        <title>Application Error</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { margin: 0; padding: 0; }
            * { box-sizing: border-box; }
          `,
          }}
        />
      </head>
      <body className={isDark ? "bg-gray-900" : "bg-gray-50"}>
        <div
          className={`min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${
            isDark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="mx-auto w-full max-w-md">
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
              <h1
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Application Error
              </h1>
              <p
                className={`text-lg mb-8 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {isDevelopment
                  ? "A critical error occurred in the application."
                  : "We're experiencing technical difficulties. Please try again later."}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div
              className={`py-8 px-4 shadow rounded-lg ${
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
            >
              <div className="space-y-4">
                <button
                  onClick={reset}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Try Again
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    isDark
                      ? "border border-gray-600 hover:bg-gray-700 text-gray-200"
                      : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  Go Home
                </button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`text-sm transition-colors ${
                      isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>
                </div>

                {isDevelopment && (
                  <div className="mt-8">
                    <details className="cursor-pointer">
                      <summary
                        className={`text-sm font-medium mb-2 ${
                          isDark ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Error Details (Development Only)
                      </summary>
                      <div
                        className={`border rounded-md p-4 ${
                          isDark
                            ? "bg-red-900 border-red-700"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="text-sm">
                          <div
                            className={`font-medium mb-2 ${
                              isDark ? "text-red-200" : "text-red-800"
                            }`}
                          >
                            Error: {error.name}
                          </div>
                          <div
                            className={`mb-4 ${
                              isDark ? "text-red-300" : "text-red-700"
                            }`}
                          >
                            {error.message}
                          </div>
                          {error.digest && (
                            <div
                              className={`mb-4 ${
                                isDark ? "text-red-400" : "text-red-600"
                              }`}
                            >
                              <strong>Digest:</strong> {error.digest}
                            </div>
                          )}
                          {error.stack && (
                            <div>
                              <div
                                className={`font-medium mb-2 ${
                                  isDark ? "text-red-200" : "text-red-800"
                                }`}
                              >
                                Stack Trace:
                              </div>
                              <pre
                                className={`text-xs whitespace-pre-wrap p-2 rounded overflow-auto max-h-40 ${
                                  isDark
                                    ? "text-red-300 bg-red-800"
                                    : "text-red-600 bg-red-100"
                                }`}
                              >
                                {error.stack}
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

        {/* Add Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
      </body>
    </html>
  );
}
