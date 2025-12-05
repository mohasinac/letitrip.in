/**
 * @fileoverview React Component
 * @module src/test-utils
 * @description This file contains the test-utils component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function that includes providers
/**
 * Performs all the providers operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The alltheproviders result
 */

/**
 * Performs all the providers operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The alltheproviders result
 */

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/**
 * Performs custom render operation
 *
 * @param {ReactElement} ui - The ui
 * @param {Omit<RenderOptions, "wrapper">} [options] - Configuration options
 *
 * @returns {any} The customrender result
 */

/**
 * Performs custom render operation
 *
 * @returns {any} The customrender result
 */

const customRender = (
  /** Ui */
  ui: ReactElement,
  /** Options */
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data generators
/**
 * Creates a new mock user
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockuser result
 *
 * @example
 * createMockUser({});
 */

/**
 * Creates a new mock user
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockuser result
 *
 * @example
 * createMockUser({});
 */

export const createMockUser = (overrides = {}) => ({
  /** Id */
  id: "user-1",
  /** Email */
  email: "test@example.com",
  /** Display Name */
  displayName: "Test User",
  /** Photo U R L */
  photoURL: null,
  /** Email Verified */
  emailVerified: true,
  ...overrides,
});

/**
 * Creates a new mock product
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockproduct result
 *
 * @example
 * createMockProduct({});
 */

/**
 * Creates a new mock product
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockproduct result
 *
 * @example
 * createMockProduct({});
 */

export const createMockProduct = (overrides = {}) => ({
  /** Id */
  id: "product-1",
  /** Title */
  title: "Test Product",
  /** Description */
  description: "Test description",
  /** Price */
  price: 100,
  /** Images */
  images: ["image1.jpg"],
  /** Category */
  category: "test-category",
  /** Seller Id */
  sellerId: "seller-1",
  /** Created At */
  createdAt: new Date(),
  /** Updated At */
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a new mock auction
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockauction result
 *
 * @example
 * createMockAuction({});
 */

/**
 * Creates a new mock auction
 *
 * @param {Object} [overrides] - The overrides
 *
 * @returns {any} The mockauction result
 *
 * @example
 * createMockAuction({});
 */

export const createMockAuction = (overrides = {}) => ({
  /** Id */
  id: "auction-1",
  /** Title */
  title: "Test Auction",
  /** Description */
  description: "Test auction description",
  /** Starting Price */
  startingPrice: 50,
  /** Current Price */
  currentPrice: 75,
  endDate: new Date(Date.now() + 86400000), // Tomorrow
  /** Seller Id */
  sellerId: "seller-1",
  /** Status */
  status: "active",
  /** Bids */
  bids: [],
  ...overrides,
});

// Mock API responses
/**
 * Performs mock api response operation
 *
 * @param {any} data - Data object containing information
 * @param {number} [status] - The status
 *
 * @returns {any} The mockapiresponse result
 *
 * @example
 * mockApiResponse(data, 123);
 */

/**
 * Performs mock api response operation
 *
 * @param {any} data - Data object containing information
 * @param {number} [status] - The status
 *
 * @returns {any} The mockapiresponse result
 *
 * @example
 * mockApiResponse(data, 123);
 */

export const mockApiResponse = (data: any, status = 200) => ({
  /** Ok */
  ok: status >= 200 && status < 300,
  status,
  /** Json */
  json: () => Promise.resolve(data),
});

/**
 * Performs mock api error operation
 *
 * @param {string} message - The message
 * @param {number} [status] - The status
 *
 * @returns {string} The mockapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * mockApiError("example", 123);
 */

/**
 * Performs mock api error operation
 *
 * @param {string} message - The message
 * @param {number} [status] - The status
 *
 * @returns {string} The mockapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * mockApiError("example", 123);
 */

export const mockApiError = (message: string, status = 500) => ({
  /** Ok */
  ok: false,
  status,
  /** Json */
  json: () => Promise.resolve({ error: message }),
});

// Firebase mock helpers
export const mockFirebaseAuth = {
  /** Current User */
  currentUser: null,
  /** On Auth State Changed */
  onAuthStateChanged: jest.fn(),
  /** Sign In With Email And Password */
  signInWithEmailAndPassword: jest.fn(),
  /** Create User With Email And Password */
  createUserWithEmailAndPassword: jest.fn(),
  /** Sign Out */
  signOut: jest.fn(),
};

export const mockFirebaseFirestore = {
  /** Collection */
  collection: jest.fn(),
  /** Doc */
  doc: jest.fn(),
  /** Get Doc */
  getDoc: jest.fn(),
  /** Get Docs */
  getDocs: jest.fn(),
  /** Add Doc */
  addDoc: jest.fn(),
  /** Update Doc */
  updateDoc: jest.fn(),
  /** Delete Doc */
  deleteDoc: jest.fn(),
  /** Query */
  query: jest.fn(),
  /** Where */
  where: jest.fn(),
  /** Order By */
  orderBy: jest.fn(),
  /** Limit */
  limit: jest.fn(),
  /** On Snapshot */
  onSnapshot: jest.fn(),
};

// Test helper to wait for async operations
/**
 * Performs wait for next tick operation
 *
 * @returns {any} The waitfornexttick result
 *
 * @example
 * waitForNextTick();
 */

/**
 * Performs wait for next tick operation
 *
 * @returns {any} The waitfornexttick result
 *
 * @example
 * waitForNextTick();
 */

export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock router helper
export const mockRouter = {
  /** Push */
  push: jest.fn(),
  /** Replace */
  replace: jest.fn(),
  /** Prefetch */
  prefetch: jest.fn(),
  /** Back */
  back: jest.fn(),
  /** Forward */
  forward: jest.fn(),
  /** Refresh */
  refresh: jest.fn(),
  /** Pathname */
  pathname: "/",
  /** Query */
  query: {},
  /** As Path */
  asPath: "/",
};
