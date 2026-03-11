import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // ─── Firebase Admin SDK — intercept at the npm package level ────────────────
    // Prevents "SyntaxError: Unexpected token 'export'" from jwks-rsa / firebase-admin
    // ESM files. Tests that call jest.mock("firebase-admin/...", ...) with a factory
    // will override these stubs and take precedence.
    // NOTE: These must come BEFORE the generic @/ alias so the more-specific patterns fire first.
    "^firebase-admin/app$": "<rootDir>/src/__mocks__/firebase-admin-app.ts",
    "^firebase-admin/auth$": "<rootDir>/src/__mocks__/firebase-admin-auth.ts",
    "^firebase-admin/firestore$":
      "<rootDir>/src/__mocks__/firebase-admin-firestore.ts",
    "^firebase-admin/storage$":
      "<rootDir>/src/__mocks__/firebase-admin-storage.ts",
    "^firebase-admin/database$":
      "<rootDir>/src/__mocks__/firebase-admin-database.ts",
    // High-level @/ stubs — intercept when used via @/ alias (comes before generic @/)
    "^@/lib/firebase/admin$": "<rootDir>/src/lib/firebase/__mocks__/admin.ts",
    "^@/lib/firebase/auth-server$":
      "<rootDir>/src/lib/firebase/__mocks__/auth-server.ts",
    // Generic @/ alias — must be last so the specific patterns above win
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async.
// We override transformIgnorePatterns AFTER next/jest sets its own, so our custom ESM packages
// (@mohasinac/sievejs, next-intl, use-intl) are correctly included in Jest's transform pipeline.
const nextJestConfig = createJestConfig(config);
export default async () => {
  const finalConfig = await nextJestConfig();
  finalConfig.transformIgnorePatterns = [
    "node_modules/(?!(@mohasinac/sievejs|next-intl|use-intl)/)",
  ];
  return finalConfig;
};
