/**
 * RBAC Test Utilities
 * Helper functions for testing RBAC functionality
 */

import { AuthUser } from "@/lib/rbac-permissions";
import { NextRequest, NextResponse } from "next/server";
import { mockFirestoreData, mockTokens } from "./fixtures";

/**
 * Create a mock Next.js request with authentication
 */
export function createAuthRequest(
  user: AuthUser | null,
  options: {
    method?: string;
    url?: string;
    body?: any;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const {
    method = "GET",
    url = "https://justforview.in/api/test",
    body,
    searchParams,
  } = options;

  let fullUrl = url;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    fullUrl = `${url}?${params.toString()}`;
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (user) {
    const token =
      mockTokens[user.role as keyof typeof mockTokens] || "mock-token";
    headers.set("Authorization", `Bearer ${token}`);
  }

  const request = new NextRequest(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
}

/**
 * Parse JSON response
 */
export async function parseResponse(response: NextResponse): Promise<any> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Assert response status
 */
export function assertStatus(
  response: NextResponse,
  expectedStatus: number,
  message?: string
) {
  const actualStatus = response.status;
  if (actualStatus !== expectedStatus) {
    throw new Error(
      message ||
        `Expected status ${expectedStatus}, got ${actualStatus}. Response: ${JSON.stringify(
          response
        )}`
    );
  }
}

/**
 * Assert unauthorized (401)
 */
export function assertUnauthorized(response: NextResponse, message?: string) {
  assertStatus(response, 401, message || "Expected 401 Unauthorized");
}

/**
 * Assert forbidden (403)
 */
export function assertForbidden(response: NextResponse, message?: string) {
  assertStatus(response, 403, message || "Expected 403 Forbidden");
}

/**
 * Assert success (200)
 */
export function assertSuccess(response: NextResponse, message?: string) {
  assertStatus(response, 200, message || "Expected 200 Success");
}

/**
 * Assert created (201)
 */
export function assertCreated(response: NextResponse, message?: string) {
  assertStatus(response, 201, message || "Expected 201 Created");
}

/**
 * Mock Firebase Admin Auth
 */
export const mockFirebaseAdmin = () => {
  const mockAuth = {
    verifyIdToken: jest.fn(async (token: string) => {
      if (token === mockTokens.admin) {
        return { uid: "admin-test-uid-001", email: "admin@justforview.in" };
      }
      if (token === mockTokens.seller) {
        return { uid: "seller-test-uid-001", email: "seller@justforview.in" };
      }
      if (token === mockTokens.seller2) {
        return { uid: "seller-test-uid-002", email: "seller2@justforview.in" };
      }
      if (token === mockTokens.user) {
        return { uid: "user-test-uid-001", email: "user@justforview.in" };
      }
      if (token === mockTokens.guest) {
        return { uid: "guest-test-uid-001", email: "guest@justforview.in" };
      }
      throw new Error("Invalid token");
    }),
  };

  const mockDoc = (uid: string) => ({
    get: jest.fn(async () => ({
      exists: !!mockFirestoreData[uid as keyof typeof mockFirestoreData],
      data: () => mockFirestoreData[uid as keyof typeof mockFirestoreData],
    })),
  });

  const mockCollection = jest.fn((collectionName: string) => ({
    doc: mockDoc,
    where: jest.fn(() => ({
      get: jest.fn(async () => ({
        empty: false,
        docs: [],
      })),
    })),
  }));

  const mockDb = {
    collection: mockCollection,
  };

  return { mockAuth, mockDb };
};

/**
 * Test role permissions matrix
 */
export interface RolePermissionTest {
  role: "admin" | "seller" | "user" | "guest" | "anonymous";
  expectedStatus: number;
  description: string;
}

/**
 * Run permission tests for multiple roles
 */
export async function testRolePermissions(
  testCases: RolePermissionTest[],
  createRequest: (user: AuthUser | null) => NextRequest | Promise<NextRequest>,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const results: Array<{ role: string; passed: boolean; error?: string }> = [];

  for (const testCase of testCases) {
    try {
      let user: AuthUser | null = null;

      if (testCase.role === "admin") {
        user = {
          uid: "admin-test-uid-001",
          email: "admin@justforview.in",
          role: "admin",
        };
      } else if (testCase.role === "seller") {
        user = {
          uid: "seller-test-uid-001",
          email: "seller@justforview.in",
          role: "seller",
          shopId: "shop-test-001",
        };
      } else if (testCase.role === "user") {
        user = {
          uid: "user-test-uid-001",
          email: "user@justforview.in",
          role: "user",
        };
      } else if (testCase.role === "guest") {
        user = {
          uid: "guest-test-uid-001",
          email: "guest@justforview.in",
          role: "guest",
        };
      }
      // anonymous = null user

      const request = await createRequest(user);
      const response = await handler(request);

      if (response.status === testCase.expectedStatus) {
        results.push({ role: testCase.role, passed: true });
      } else {
        results.push({
          role: testCase.role,
          passed: false,
          error: `Expected ${testCase.expectedStatus}, got ${response.status}`,
        });
      }
    } catch (error) {
      results.push({
        role: testCase.role,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Create mock API route handler for testing
 */
export function createMockHandler(
  roles: Array<"admin" | "seller" | "user">,
  implementation: (user: AuthUser, req: NextRequest) => Promise<any>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // This would normally use requireRole from middleware
    // For testing, we'll extract the user from the request
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Mock user extraction based on token
    let user: AuthUser | null = null;

    if (token === mockTokens.admin) {
      user = {
        uid: "admin-test-uid-001",
        email: "admin@justforview.in",
        role: "admin",
      };
    } else if (token === mockTokens.seller) {
      user = {
        uid: "seller-test-uid-001",
        email: "seller@justforview.in",
        role: "seller",
        shopId: "shop-test-001",
      };
    } else if (token === mockTokens.user) {
      user = {
        uid: "user-test-uid-001",
        email: "user@justforview.in",
        role: "user",
      };
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roles.includes(user.role as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const result = await implementation(user, req);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Resource ownership test helper
 */
export function createResourceOwnershipTest(resource: {
  ownerId?: string;
  shopId?: string;
  userId?: string;
  sellerId?: string;
}) {
  return {
    isOwnedByAdmin: () => true, // Admins own everything
    isOwnedBySeller: (user: AuthUser) =>
      resource.shopId === user.shopId ||
      resource.sellerId === user.uid ||
      resource.ownerId === user.uid,
    isOwnedByUser: (user: AuthUser) =>
      resource.userId === user.uid || resource.ownerId === user.uid,
  };
}

/**
 * Mock environment variables for testing
 */
export function setupTestEnv() {
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.FIREBASE_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
  process.env.FIREBASE_PRIVATE_KEY = "test-key";
  process.env.NODE_ENV = "test";
}

/**
 * Clean up test environment
 */
export function cleanupTestEnv() {
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
}
