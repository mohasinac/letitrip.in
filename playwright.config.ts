import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts/qa/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "iphone-13",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "laptop-14",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "monitor-30",
      use: { viewport: { width: 2560, height: 1440 } },
    },
  ],
});
