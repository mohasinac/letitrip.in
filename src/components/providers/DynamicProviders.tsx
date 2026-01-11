"use client";

import dynamic from "next/dynamic";

// Lazy load non-critical context providers
// These providers are not needed for initial page render
// and can be loaded after the main UI is interactive
export const ComparisonProvider = dynamic(
  () =>
    import("@/contexts/ComparisonContext").then((mod) => ({
      default: mod.ComparisonProvider,
    })),
  { ssr: false }
);

export const ViewingHistoryProvider = dynamic(
  () =>
    import("@/contexts/ViewingHistoryContext").then((mod) => ({
      default: mod.ViewingHistoryProvider,
    })),
  { ssr: false }
);

export const LoginRegisterProvider = dynamic(
  () =>
    import("@/contexts/LoginRegisterContext").then((mod) => ({
      default: mod.LoginRegisterProvider,
    })),
  { ssr: false }
);
