/**
 * Monitoring Initialization Component
 *
 * Sets up all monitoring and logging systems on app load
 */

"use client";

import { useEffect } from "react";
import {
  setupGlobalErrorHandler,
  setupCacheMonitoring,
} from "@/lib/monitoring";
import { initializeClientLogger } from "@/helpers";

import { logger } from "@/classes";

export function MonitoringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize centralized error logging
    // Sets up global handlers for unhandled promise rejections and errors
    initializeClientLogger();

    // Setup monitoring systems (analytics, performance tracking)
    setupGlobalErrorHandler();
    setupCacheMonitoring();

    // Log initialization
    if (process.env.NODE_ENV === "development") {
      logger.info("Monitoring and logging systems initialized");
    }
  }, []);

  return <>{children}</>;
}
