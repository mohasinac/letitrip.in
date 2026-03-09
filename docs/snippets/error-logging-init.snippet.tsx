/**
 * Error Logging Initialization
 *
 * Add this to your root layout to enable global error logging
 */

"use client";

import { useEffect } from "react";
import { initializeClientLogger } from "@/helpers";

export default function ErrorLoggingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize client-side error logging
    // This sets up global handlers for:
    // - Unhandled promise rejections
    // - Global window errors
    // - Automatic file logging via API
    initializeClientLogger();

    // Log that logging is initialized
    console.info("[ErrorLogging] Centralized error logging initialized");
  }, []);

  return <>{children}</>;
}

/**
 * Usage in your root layout:
 *
 * ```tsx
 * // src/app/layout.tsx
 *
 * import ErrorLoggingProvider from '@/components/providers/ErrorLoggingProvider';
 * // OR use the snippet directly in layout:
 * import { initializeClientLogger } from '@/helpers';
 *
 * export default function RootLayout({ children }) {
 *   useEffect(() => {
 *     initializeClientLogger();
 *   }, []);
 *
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
