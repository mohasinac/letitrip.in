import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: "user-1",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: "product-1",
  title: "Test Product",
  description: "Test description",
  price: 100,
  images: ["image1.jpg"],
  category: "test-category",
  sellerId: "seller-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAuction = (overrides = {}) => ({
  id: "auction-1",
  title: "Test Auction",
  description: "Test auction description",
  startingPrice: 50,
  currentPrice: 75,
  endDate: new Date(Date.now() + 86400000), // Tomorrow
  sellerId: "seller-1",
  status: "active",
  bids: [],
  ...overrides,
});

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
});

export const mockApiError = (message: string, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message }),
});

// Firebase mock helpers
export const mockFirebaseAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const mockFirebaseFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
};

// Test helper to wait for async operations
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock router helper
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: "/",
  query: {},
  asPath: "/",
};
