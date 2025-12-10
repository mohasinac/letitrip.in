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
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async (...args) => {
  const config = await createJestConfig(customJestConfig)(...args);
  return {
    ...config,
    forceExit: true, // Forces Jest to exit after tests complete (needed for API tests with Firebase mocks)
  };
};
