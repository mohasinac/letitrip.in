/**
 * @jest-environment node
 */

// Mock Firebase config BEFORE imports
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirebaseConfig: jest.fn(() => ({
    projectId: "test-project",
    clientEmail: "test@test.com",
    privateKey: "test-key",
  })),
}));

import { GET } from "./dashboard/route";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS } from "@/constants/database";

// Mock Firebase Admin
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/session");

const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("Admin API - GET /api/admin/dashboard", () => {
  const mockCollection = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockDb = {
      collection: mockCollection,
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
    mockGetCurrentUser.mockResolvedValue({
      id: "admin1",
      role: "admin",
    } as any);

    // Default empty collections
    mockCollection.mockImplementation((collectionName: string) => ({
      get: jest.fn().mockResolvedValue({ docs: [], size: 0 }),
    }));
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Unauthorized");
  });

  it("should require admin role", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "user" } as any);

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("Forbidden");
  });

  it("should return dashboard stats for admin", async () => {
    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.USERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "u1",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: now,
                }),
              },
              {
                id: "u2",
                data: () => ({
                  role: "seller",
                  status: "active",
                  created_at: thirtyDaysAgo,
                }),
              },
              {
                id: "u3",
                data: () => ({
                  role: "admin",
                  status: "active",
                  created_at: now,
                }),
              },
              {
                id: "u4",
                data: () => ({
                  role: "user",
                  status: "banned",
                  created_at: now,
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.SHOPS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "s1",
                data: () => ({
                  status: "active",
                  is_verified: true,
                  created_at: now,
                }),
              },
              {
                id: "s2",
                data: () => ({
                  status: "active",
                  is_verified: false,
                  created_at: now,
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.CATEGORIES) {
        return {
          get: jest.fn().mockResolvedValue({ size: 10 }),
        };
      } else if (collectionName === COLLECTIONS.PRODUCTS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "p1",
                data: () => ({
                  status: "active",
                  stock_quantity: 10,
                  created_at: now,
                }),
              },
              {
                id: "p2",
                data: () => ({
                  status: "active",
                  stock_quantity: 0,
                  created_at: now,
                }),
              },
              {
                id: "p3",
                data: () => ({
                  status: "inactive",
                  stock_quantity: 5,
                  created_at: now,
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.ORDERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "o1",
                data: () => ({
                  status: "pending",
                  total_amount: 100,
                  created_at: now,
                }),
              },
              {
                id: "o2",
                data: () => ({
                  status: "delivered",
                  total_amount: 200,
                  created_at: now,
                }),
              },
              {
                id: "o3",
                data: () => ({
                  status: "cancelled",
                  total_amount: 50,
                  created_at: thirtyDaysAgo,
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalUsers).toBe(4);
    expect(data.stats.totalSellers).toBe(1);
    expect(data.stats.totalAdmins).toBe(1);
    expect(data.stats.activeUsers).toBe(3);
    expect(data.stats.bannedUsers).toBe(1);
    expect(data.stats.totalShops).toBe(2);
    expect(data.stats.activeShops).toBe(2);
    expect(data.stats.verifiedShops).toBe(1);
    expect(data.stats.totalCategories).toBe(10);
    expect(data.stats.totalProducts).toBe(3);
    expect(data.stats.activeProducts).toBe(2);
    expect(data.stats.outOfStockProducts).toBe(1);
    expect(data.stats.totalOrders).toBe(3);
    expect(data.stats.pendingOrders).toBe(1);
    expect(data.stats.completedOrders).toBe(1);
    expect(data.stats.cancelledOrders).toBe(1);
    expect(data.stats.totalRevenue).toBe(350);
  });

  it("should calculate 30-day trends", async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const sixtyDaysAgo = new Date(
      now.getTime() - 60 * 24 * 60 * 60 * 1000,
    ).toISOString();

    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.USERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "u1",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: now.toISOString(),
                }),
              },
              {
                id: "u2",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: thirtyDaysAgo,
                }),
              },
              {
                id: "u3",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: sixtyDaysAgo,
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.SHOPS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "s1",
                data: () => ({
                  status: "active",
                  created_at: now.toISOString(),
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.PRODUCTS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "p1",
                data: () => ({
                  status: "active",
                  created_at: now.toISOString(),
                }),
              },
            ],
          }),
        };
      } else if (collectionName === COLLECTIONS.ORDERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "o1",
                data: () => ({
                  status: "pending",
                  total_amount: 100,
                  created_at: now.toISOString(),
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.trends).toBeDefined();
    expect(data.trends.users).toBeDefined();
    expect(data.trends.shops).toBeDefined();
    expect(data.trends.products).toBeDefined();
    expect(data.trends.orders).toBeDefined();
    expect(typeof data.trends.users.value).toBe("string");
    expect(typeof data.trends.users.isPositive).toBe("boolean");
  });

  it("should include recent activities", async () => {
    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.recentActivities).toBeDefined();
    expect(Array.isArray(data.recentActivities)).toBe(true);
  });

  it("should handle empty database", async () => {
    mockCollection.mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({ docs: [], size: 0 }),
    }));

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats.totalUsers).toBe(0);
    expect(data.stats.totalShops).toBe(0);
    expect(data.stats.totalProducts).toBe(0);
    expect(data.stats.totalOrders).toBe(0);
    expect(data.stats.totalRevenue).toBe(0);
  });

  it("should calculate trends when previous period is zero", async () => {
    const now = new Date().toISOString();

    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.USERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "u1",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: now,
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.trends.users.value).toBe("+100.0");
    expect(data.trends.users.isPositive).toBe(true);
  });

  it("should handle database errors", async () => {
    mockCollection.mockImplementation(() => ({
      get: jest.fn().mockRejectedValue(new Error("DB error")),
    }));

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch dashboard stats");
  });

  it("should handle orders without total_amount", async () => {
    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.ORDERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "o1",
                data: () => ({
                  status: "pending",
                  created_at: new Date().toISOString(),
                }),
              },
              {
                id: "o2",
                data: () => ({
                  status: "delivered",
                  total_amount: 100,
                  created_at: new Date().toISOString(),
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.stats.totalRevenue).toBe(100);
    expect(data.stats.totalOrders).toBe(2);
  });

  it("should count products without stock_quantity as in-stock", async () => {
    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.PRODUCTS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "p1",
                data: () => ({
                  status: "active",
                  created_at: new Date().toISOString(),
                }),
              },
              {
                id: "p2",
                data: () => ({
                  status: "active",
                  stock_quantity: 0,
                  created_at: new Date().toISOString(),
                }),
              },
              {
                id: "p3",
                data: () => ({
                  status: "active",
                  stock_quantity: 10,
                  created_at: new Date().toISOString(),
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.stats.totalProducts).toBe(3);
    expect(data.stats.outOfStockProducts).toBe(1);
  });

  it("should handle negative trends", async () => {
    const now = new Date();
    const twentyDaysAgo = new Date(
      now.getTime() - 20 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const fortyfiveDaysAgo = new Date(
      now.getTime() - 45 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const fiftyDaysAgo = new Date(
      now.getTime() - 50 * 24 * 60 * 60 * 1000,
    ).toISOString();

    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === COLLECTIONS.USERS) {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              // Last 30 days: 1 user
              {
                id: "u1",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: twentyDaysAgo,
                }),
              },
              // Previous 30 days (30-60 days ago): 3 users (more than current)
              {
                id: "u2",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: fortyfiveDaysAgo,
                }),
              },
              {
                id: "u3",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: fiftyDaysAgo,
                }),
              },
              {
                id: "u4",
                data: () => ({
                  role: "user",
                  status: "active",
                  created_at: fortyfiveDaysAgo,
                }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [], size: 0 }) };
    });

    const request = new Request("http://localhost/api/admin/dashboard");
    const response = await GET(request);
    const data = await response.json();

    expect(data.trends.users.isPositive).toBe(false);
    expect(parseFloat(data.trends.users.value)).toBeLessThan(0);
  });
});
