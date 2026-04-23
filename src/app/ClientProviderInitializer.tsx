"use client";

import { useEffect } from "react";
import { initializeClientProviders } from "@/lib/client-providers-init";

let initialized = false;

export default function ClientProviderInitializer() {
  useEffect(() => {
    if (!initialized) {
      initialized = true;
      try {
        initializeClientProviders();
      } catch (err) {
        console.error("Failed to initialize client providers:", err);
      }
    }
  }, []);

  return null;
}
