"use client";

import { initErrorHandlers } from "@/lib/firebase-error-logger";
import { useEffect } from "react";

/**
 * Initialize Firebase error handlers on client side
 */
export default function ErrorInitializer() {
  useEffect(() => {
    try {
      initErrorHandlers();
    } catch (error) {
      console.error("Failed to initialize error handlers:", error);
    }
  }, []);

  return null;
}
