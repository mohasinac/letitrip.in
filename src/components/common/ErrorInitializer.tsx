"use client";

import { useEffect } from "react";
import { initErrorHandlers } from "@/lib/firebase-error-logger";

/**
 * Initialize Firebase error handlers on client side
 */
export default function ErrorInitializer() {
  useEffect(() => {
    initErrorHandlers();
  }, []);

  return null;
}
