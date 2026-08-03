import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Enable all feature flags so withFeatureGuard passes through in unit tests.
    // Route tests exercise handler logic — not the flag-check itself.
    env: {
      FEATURE_AUCTIONS: "true",
      FEATURE_PREORDERS: "true",
      FEATURE_PRIZE_DRAWS: "true",
      FEATURE_RAFFLE: "true",
      FEATURE_BLOG: "true",
      FEATURE_EVENTS: "true",
      FEATURE_CHAT: "true",
      FEATURE_SCAM_REGISTRY: "true",
      FEATURE_RAZORPAY: "true",
      FEATURE_COD: "true",
      FEATURE_COUPONS: "true",
      FEATURE_PAYOUTS: "true",
      FEATURE_SHIPROCKET: "true",
      FEATURE_ANALYTICS_FUNCTION: "true",
      FEATURE_GST: "true",
      FEATURE_MOCK_PAYMENT: "true",
      FEATURE_BUNDLES: "true",
    },
  },
});
