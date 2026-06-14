"use client";

import { useClientErrorReporter } from "@mohasinac/appkit/client";

/**
 * Mount point for the global window.onerror / unhandledrejection reporter.
 * Renders nothing. Mounted once in the root locale layout so every page is
 * covered for the lifetime of the app.
 */
export function ClientErrorReporterMount(): null {
  useClientErrorReporter();
  return null;
}
