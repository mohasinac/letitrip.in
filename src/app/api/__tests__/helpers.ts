/**
 * API Test Helpers
 *
 * Shared utilities for API route integration tests.
 * Provides request builders and common mock factories.
 */

import { NextRequest } from "next/server";

/**
 * Build a NextRequest object for API testing
 */
export function buildRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const { method = "GET", body, cookies = {}, headers = {} } = options;

  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  } as RequestInit;

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const req = new NextRequest(fullUrl, init as any);

  // Set cookies
  Object.entries(cookies).forEach(([name, value]) => {
    req.cookies.set(name, value);
  });

  return req;
}

/**
 * Parse the JSON body from a NextResponse
 */
export async function parseResponse(response: Response) {
  const json = await response.json();
  return { status: response.status, body: json };
}

/**
 * Factory for mock admin user document
 */
export function mockAdminUser(overrides = {}) {
  return {
    uid: "admin-uid-001",
    email: "admin@letitrip.in",
    displayName: "Admin User",
    role: "admin",
    emailVerified: true,
    disabled: false,
    phoneNumber: null,
    photoURL: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

/**
 * Factory for mock regular user document
 */
export function mockRegularUser(overrides = {}) {
  return {
    uid: "user-uid-001",
    email: "user@example.com",
    displayName: "Regular User",
    role: "user",
    emailVerified: true,
    disabled: false,
    phoneNumber: null,
    photoURL: null,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    ...overrides,
  };
}

/**
 * Factory for mock seller user document
 */
export function mockSellerUser(overrides = {}) {
  return {
    uid: "seller-uid-001",
    email: "seller@example.com",
    displayName: "Test Seller",
    role: "seller",
    emailVerified: true,
    disabled: false,
    phoneNumber: null,
    photoURL: null,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-10"),
    ...overrides,
  };
}

// ============================================
// SEED DATA FACTORIES (Based on actual seed data)
// ============================================

/**
 * Get seed data users for testing
 * Returns a subset of actual seed users with proper IDs and relationships
 */
export function getSeedUsers() {
  return {
    admin: {
      uid: "user-admin-admin",
      email: "admin@letitrip.in",
      displayName: "Admin User",
      role: "admin",
      emailVerified: true,
      disabled: false,
      phoneNumber: null,
      photoURL: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    johnDoe: {
      uid: "user-john-doe-johndoe",
      email: "john.doe@example.com",
      displayName: "John Doe",
      role: "user",
      emailVerified: true,
      disabled: false,
      phoneNumber: "+919876543210",
      photoURL: null,
      createdAt: new Date("2026-01-05T10:30:00Z"),
      updatedAt: new Date("2026-02-08T14:20:00Z"),
    },
    janeSmith: {
      uid: "user-jane-smith-janesmith",
      email: "jane.smith@example.com",
      displayName: "Jane Smith",
      role: "user",
      emailVerified: true,
      disabled: false,
      phoneNumber: "+919876543211",
      photoURL: null,
      createdAt: new Date("2026-01-08T09:15:00Z"),
      updatedAt: new Date("2026-02-09T16:45:00Z"),
    },
    electronicsStore: {
      uid: "seller-electronics-store-electrostore",
      email: "electronics.store@example.com",
      displayName: "TechHub Electronics",
      role: "seller",
      emailVerified: true,
      disabled: false,
      phoneNumber: "+919876543214",
      photoURL: null,
      createdAt: new Date("2026-01-02T08:00:00Z"),
      updatedAt: new Date("2026-02-08T10:30:00Z"),
    },
  };
}

/**
 * Get seed data categories for testing
 */
export function getSeedCategories() {
  return {
    electronics: {
      id: "cat-electronics",
      name: "Electronics",
      slug: "electronics",
      description: "Electronic gadgets and devices",
      order: 1,
      isActive: true,
      parentId: null,
      level: 0,
      path: ["cat-electronics"],
      productCount: 6,
    },
    smartphones: {
      id: "cat-smartphones",
      name: "Smartphones",
      slug: "smartphones",
      description: "Latest smartphones and mobile phones",
      order: 1,
      isActive: true,
      parentId: "cat-electronics",
      level: 1,
      path: ["cat-electronics", "cat-smartphones"],
      productCount: 3,
    },
    laptops: {
      id: "cat-laptops",
      name: "Laptops",
      slug: "laptops",
      description: "Laptops and notebooks",
      order: 2,
      isActive: true,
      parentId: "cat-electronics",
      level: 1,
      path: ["cat-electronics", "cat-laptops"],
      productCount: 2,
    },
  };
}

/**
 * Get seed data products for testing
 */
export function getSeedProducts() {
  return {
    iphone15ProMax: {
      id: "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
      title: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Latest iPhone with advanced camera system and A17 Pro chip",
      price: 134900,
      categoryId: "cat-smartphones",
      sellerId: "seller-electronics-store-electrostore",
      condition: "new",
      status: "active",
      stock: 15,
      averageRating: 4.7,
      reviewCount: 4,
    },
    samsungGalaxyS24: {
      id: "product-samsung-galaxy-s24-ultra-smartphones-new-techhub-electronics-2",
      title: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Flagship Samsung phone with 200MP camera and S Pen",
      price: 124999,
      categoryId: "cat-smartphones",
      sellerId: "seller-electronics-store-electrostore",
      condition: "new",
      status: "active",
      stock: 20,
      averageRating: 4.8,
      reviewCount: 3,
    },
    macbookPro16: {
      id: "product-macbook-pro-16-m3-max-laptops-new-techhub-electronics-6",
      title: 'MacBook Pro 16" M3 Max',
      slug: "macbook-pro-16-m3-max",
      description: "Most powerful MacBook Pro with M3 Max chip",
      price: 349900,
      categoryId: "cat-laptops",
      sellerId: "seller-electronics-store-electrostore",
      condition: "new",
      status: "active",
      stock: 5,
      averageRating: 5.0,
      reviewCount: 2,
    },
  };
}

/**
 * Get seed data orders for testing
 */
export function getSeedOrders() {
  return {
    order1: {
      id: "order-1-20260115-xk7m9p",
      userId: "user-john-doe-johndoe",
      sellerId: "seller-electronics-store-electrostore",
      status: "delivered",
      totalAmount: 134900,
      items: [
        {
          productId:
            "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
          title: "iPhone 15 Pro Max",
          price: 134900,
          quantity: 1,
        },
      ],
      createdAt: new Date("2026-01-15T10:30:00Z"),
      deliveredAt: new Date("2026-01-20T14:30:00Z"),
    },
    order2: {
      id: "order-2-20260118-bq3n8r",
      userId: "user-jane-smith-janesmith",
      sellerId: "seller-electronics-store-electrostore",
      status: "delivered",
      totalAmount: 124999,
      items: [
        {
          productId:
            "product-samsung-galaxy-s24-ultra-smartphones-new-techhub-electronics-2",
          title: "Samsung Galaxy S24 Ultra",
          price: 124999,
          quantity: 1,
        },
      ],
      createdAt: new Date("2026-01-18T14:20:00Z"),
      deliveredAt: new Date("2026-01-23T16:45:00Z"),
    },
  };
}

/**
 * Get seed data reviews for testing
 */
export function getSeedReviews() {
  return {
    iphone15Review: {
      id: "review-iphone-15-pro-max-john-20260120",
      productId:
        "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
      productTitle: "iPhone 15 Pro Max",
      userId: "user-john-doe-johndoe",
      userName: "John Doe",
      userAvatar: undefined,
      rating: 5,
      title: "Absolutely Amazing!",
      comment:
        "Exceeded expectations. Camera and battery are outstanding. Worth it!",
      images: [],
      status: "approved",
      helpfulCount: 24,
      reportCount: 0,
      verified: true,
      createdAt: new Date("2026-01-20T10:30:00Z"),
      updatedAt: new Date("2026-01-20T10:30:00Z"),
      approvedAt: new Date("2026-01-20T12:00:00Z"),
    },
    samsungReview: {
      id: "review-samsung-galaxy-s24-ultra-jane-20260125",
      productId:
        "product-samsung-galaxy-s24-ultra-smartphones-new-techhub-electronics-2",
      productTitle: "Samsung Galaxy S24 Ultra",
      userId: "user-jane-smith-janesmith",
      userName: "Jane Smith",
      userAvatar: undefined,
      rating: 5,
      title: "Best Android Phone!",
      comment:
        "S24 Ultra is incredible! S Pen is so useful. Camera quality is top-notch.",
      images: [],
      status: "approved",
      helpfulCount: 18,
      reportCount: 0,
      verified: true,
      createdAt: new Date("2026-01-25T15:45:00Z"),
      updatedAt: new Date("2026-01-25T15:45:00Z"),
      approvedAt: new Date("2026-01-25T18:00:00Z"),
    },
  };
}

/**
 * Get seed data bids for testing
 */
export function getSeedBids() {
  return {
    bid1: {
      id: "bid-vintage-camera-jane-20260211-073000",
      auctionId:
        "product-vintage-camera-collectibles-used-techhub-electronics-auction1",
      userId: "user-jane-smith-janesmith",
      userName: "Jane Smith",
      amount: 22000,
      isAutoBid: false,
      status: "active",
      createdAt: new Date("2026-02-11T07:30:00Z"),
    },
    bid2: {
      id: "bid-vintage-camera-john-20260210-183000",
      auctionId:
        "product-vintage-camera-collectibles-used-techhub-electronics-auction1",
      userId: "user-john-doe-johndoe",
      userName: "John Doe",
      amount: 21500,
      isAutoBid: false,
      status: "outbid",
      createdAt: new Date("2026-02-10T18:30:00Z"),
    },
  };
}

/**
 * Get seed data coupons for testing
 */
export function getSeedCoupons() {
  return {
    welcome10: {
      id: "coupon-welcome10",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrderValue: 1000,
      maxDiscount: 500,
      usageLimit: 1000,
      usageCount: 127,
      isActive: true,
      expiresAt: new Date("2026-12-31T23:59:59Z"),
    },
    flat500: {
      id: "coupon-flat500",
      code: "FLAT500",
      type: "fixed",
      value: 500,
      minOrderValue: 5000,
      maxDiscount: 500,
      usageLimit: 500,
      usageCount: 89,
      isActive: true,
      expiresAt: new Date("2026-06-30T23:59:59Z"),
    },
  };
}
