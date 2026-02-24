"use client";

/**
 * ZodSetup
 *
 * Bootstraps the custom Zod error map on the client side.
 * Renders nothing — purely a side-effect component.
 * Placed once in the root layout so it runs before any form validation.
 */

import { useEffect } from "react";
import { setupZodErrorMap } from "@/lib/zod-error-map";

export default function ZodSetup() {
  // Run synchronously to cover cases before first render
  setupZodErrorMap();

  // Also guard via useEffect for strict-mode double-invoke safety
  useEffect(() => {
    setupZodErrorMap();
  }, []);

  return null;
}
