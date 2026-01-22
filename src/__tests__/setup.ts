/**
 * Jest Test Setup
 *
 * Global test configuration and setup
 */

import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: any) => {
    return children;
  };
  return MockLink;
});

// Mock environment variables
process.env.NEXT_PUBLIC_ENABLE_FALLBACK = "true";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
