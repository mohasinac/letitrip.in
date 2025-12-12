const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    "^@/(.*)$": "<rootDir>/src/$1",
    // Force jose to use node dist instead of browser
    "^jose$": "<rootDir>/node_modules/jose/dist/node/cjs/index.js",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/_*.{js,jsx,ts,tsx}",
    "!src/app/**/layout.tsx",
    "!src/app/**/page.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/error.tsx",
    "!src/app/**/not-found.tsx",
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/.*/(fixtures|test-utils)\\.(js|ts)$",
  ],
  testTimeout: 10000,
  transformIgnorePatterns: [
    "node_modules/(?!(jose|jwks-rsa|@panva)/)",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  // Parallel execution - use 50% of CPU cores for faster tests
  maxWorkers: "50%",
  // Only detect open handles in CI or when debugging
  detectOpenHandles: false,
  // Per test timeout (individual test)
  slowTestThreshold: 5,
  // Cache results for faster subsequent runs
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  // Bail early on failures to save time
  bail: false,
  // Use v8 coverage for faster coverage collection
  coverageProvider: "v8",
  // Reduce memory usage
  workerIdleMemoryLimit: "512MB",
  maxConcurrency: 5,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async (...args) => {
  const config = await createJestConfig(customJestConfig)(...args);
  return {
    ...config,
    forceExit: true, // Forces Jest to exit after tests complete (needed for API tests with Firebase mocks)
  };
};
