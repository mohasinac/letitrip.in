/**
 * Monitoring Initialization Component
 *
 * Sets up all monitoring systems on app load
 */

"use client";

import { useEffect } from "react";
import {
  setupGlobalErrorHandler,
  setupCacheMonitoring,
} from "@/lib/monitoring";

export function MonitoringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandler();

    // Setup cache monitoring
    setupCacheMonitoring();

    // Log initialization
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Monitoring systems initialized");
    }
  }, []);

  return <>{children}</>;
}
