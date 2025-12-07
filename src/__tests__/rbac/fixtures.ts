/**
 * RBAC Test Fixtures
 * Mock users, tokens, and test data for RBAC testing
 */

import { AuthUser } from "@/lib/rbac-permissions";

// Mock User Fixtures
export const mockAdminUser: AuthUser = {
  uid: "admin-test-uid-001",
  email: "admin@justforview.in",
  role: "admin",
};

export const mockSellerUser: AuthUser = {
  uid: "seller-test-uid-001",
  email: "seller@justforview.in",
  role: "seller",
  shopId: "shop-test-001",
};

export const mockSellerUser2: AuthUser = {
  uid: "seller-test-uid-002",
  email: "seller2@justforview.in",
  role: "seller",
  shopId: "shop-test-002",
};

export const mockRegularUser: AuthUser = {
  uid: "user-test-uid-001",
  email: "user@justforview.in",
  role: "user",
};

export const mockGuestUser: AuthUser = {
  uid: "guest-test-uid-001",
  email: "guest@justforview.in",
  role: "guest",
};

// Mock Firebase ID Tokens
export const mockTokens = {
  admin: "mock-admin-token-jwt-12345",
  seller: "mock-seller-token-jwt-12345",
  seller2: "mock-seller2-token-jwt-12345",
  user: "mock-user-token-jwt-12345",
  guest: "mock-guest-token-jwt-12345",
  expired: "mock-expired-token-jwt-12345",
  invalid: "invalid-token-format",
};

// Mock Resources
export const mockProduct = {
  id: "product-test-001",
  slug: "test-product",
  name: "Test Product",
  price: 1000,
  shopId: "shop-test-001",
  sellerId: "seller-test-uid-001",
  status: "active",
  createdAt: new Date().toISOString(),
};

export const mockProduct2 = {
  id: "product-test-002",
  slug: "test-product-2",
  name: "Test Product 2",
  price: 2000,
  shopId: "shop-test-002",
  sellerId: "seller-test-uid-002",
  status: "active",
  createdAt: new Date().toISOString(),
};

export const mockShop = {
  id: "shop-test-001",
  slug: "test-shop",
  name: "Test Shop",
  ownerId: "seller-test-uid-001",
  status: "active",
  isVerified: true,
  createdAt: new Date().toISOString(),
};

export const mockOrder = {
  id: "order-test-001",
  userId: "user-test-uid-001",
  shopId: "shop-test-001",
  items: [
    {
      productId: "product-test-001",
      quantity: 1,
      price: 1000,
    },
  ],
  total: 1000,
  status: "pending",
  createdAt: new Date().toISOString(),
};

export const mockAuction = {
  id: "auction-test-001",
  slug: "test-auction",
  title: "Test Auction",
  startingBid: 5000,
  currentBid: 5500,
  shopId: "shop-test-001",
  sellerId: "seller-test-uid-001",
  status: "active",
  endTime: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
};

export const mockCategory = {
  id: "category-test-001",
  slug: "test-category",
  name: "Test Category",
  description: "Test category description",
  status: "active",
  isActive: true,
  productCount: 10,
  createdAt: new Date().toISOString(),
};

export const mockReview = {
  id: "review-test-001",
  productId: "product-test-001",
  userId: "user-test-uid-001",
  rating: 5,
  comment: "Great product!",
  status: "approved",
  createdAt: new Date().toISOString(),
};

export const mockTicket = {
  id: "ticket-test-001",
  userId: "user-test-uid-001",
  subject: "Test Support Ticket",
  description: "Need help with order",
  status: "open",
  priority: "medium",
  createdAt: new Date().toISOString(),
};

export const mockCoupon = {
  id: "coupon-test-001",
  code: "TEST10",
  discount: 10,
  discountType: "percentage",
  shopId: "shop-test-001",
  createdBy: "seller-test-uid-001",
  status: "active",
  validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
  createdAt: new Date().toISOString(),
};

export const mockPayment = {
  id: "payment-test-001",
  orderId: "order-test-001",
  userId: "user-test-uid-001",
  amount: 1000,
  currency: "INR",
  gateway: "razorpay",
  status: "completed",
  transactionId: "txn-12345",
  createdAt: new Date().toISOString(),
};

export const mockPayout = {
  id: "payout-test-001",
  shopId: "shop-test-001",
  sellerId: "seller-test-uid-001",
  amount: 5000,
  status: "pending",
  requestedAt: new Date().toISOString(),
};

// Helper to create mock request with auth
export function createMockRequest(
  user: AuthUser | null,
  method: string = "GET",
  body?: any
): Request {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (user) {
    const token =
      mockTokens[user.role as keyof typeof mockTokens] || "mock-token";
    headers.set("Authorization", `Bearer ${token}`);
  }

  return new Request("https://justforview.in/api/test", {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Helper to create Next.js Request
export function createNextRequest(
  user: AuthUser | null,
  method: string = "GET",
  url: string = "https://justforview.in/api/test",
  body?: any
): any {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (user) {
    const token =
      mockTokens[user.role as keyof typeof mockTokens] || "mock-token";
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    method,
    url,
    headers,
    json: async () => body,
    text: async () => (body ? JSON.stringify(body) : ""),
  };
}

// Mock Firebase Admin Auth responses
export const mockFirebaseAuth = {
  verifyIdToken: async (token: string) => {
    if (token === mockTokens.admin) {
      return {
        uid: mockAdminUser.uid,
        email: mockAdminUser.email,
      };
    }
    if (token === mockTokens.seller) {
      return {
        uid: mockSellerUser.uid,
        email: mockSellerUser.email,
      };
    }
    if (token === mockTokens.seller2) {
      return {
        uid: mockSellerUser2.uid,
        email: mockSellerUser2.email,
      };
    }
    if (token === mockTokens.user) {
      return {
        uid: mockRegularUser.uid,
        email: mockRegularUser.email,
      };
    }
    if (token === mockTokens.guest) {
      return {
        uid: mockGuestUser.uid,
        email: mockGuestUser.email,
      };
    }
    throw new Error("Invalid token");
  },
};

// Mock Firestore responses
export const mockFirestoreData = {
  [mockAdminUser.uid]: {
    uid: mockAdminUser.uid,
    email: mockAdminUser.email,
    role: mockAdminUser.role,
  },
  [mockSellerUser.uid]: {
    uid: mockSellerUser.uid,
    email: mockSellerUser.email,
    role: mockSellerUser.role,
    shopId: mockSellerUser.shopId,
  },
  [mockSellerUser2.uid]: {
    uid: mockSellerUser2.uid,
    email: mockSellerUser2.email,
    role: mockSellerUser2.role,
    shopId: mockSellerUser2.shopId,
  },
  [mockRegularUser.uid]: {
    uid: mockRegularUser.uid,
    email: mockRegularUser.email,
    role: mockRegularUser.role,
  },
  [mockGuestUser.uid]: {
    uid: mockGuestUser.uid,
    email: mockGuestUser.email,
    role: mockGuestUser.role,
  },
};
