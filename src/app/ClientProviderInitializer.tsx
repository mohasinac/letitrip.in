"use client";

import { useEffect } from "react";
import { initializeClientProviders } from "@/lib/client-providers-init";
import { clientError } from "@/lib/client-logger";

let initialized = false;

export default function ClientProviderInitializer() {
  useEffect(() => {
    if (!initialized) {
      initialized = true;
      try {
        initializeClientProviders();
      } catch (err) {
        clientError("providers", "Failed to initialize client providers", err);
      }
    }
  }, []);

  return null;
}
