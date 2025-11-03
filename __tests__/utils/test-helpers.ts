/**
 * Test Helper Utilities
 * Provides common testing functions and mocks
 */

import { NextRequest } from 'next/server';

/**
 * Generate a mock JWT token for testing
 */
export function generateMockJWT(userId: string, role: string = 'customer'): string {
  // In real tests, this would create a valid JWT
  // For now, return a mock token
  return `mock_token_${userId}_${role}`;
}

/**
 * Create a test user with specified role
 */
export function createTestUser(role: 'admin' | 'seller' | 'customer' = 'customer') {
  return {
    id: `test_user_${role}_${Date.now()}`,
    email: `${role}@test.com`,
    role,
    displayName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
    searchParams = {},
  } = options;

  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    return new NextRequest(urlObj.toString(), {
      method,
      headers: requestHeaders,
      body: JSON.stringify(body),
    });
  }

  return new NextRequest(urlObj.toString(), {
    method,
    headers: requestHeaders,
  });
}

/**
 * Mock Firestore document reference
 */
export function createMockDocRef(id: string, data: any = {}) {
  return {
    id,
    get: jest.fn().mockResolvedValue({
      exists: true,
      id,
      data: () => data,
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Mock Firestore collection reference
 */
export function createMockCollectionRef(documents: any[] = []) {
  return {
    doc: jest.fn((id?: string) => createMockDocRef(id || 'mock_id')),
    add: jest.fn().mockResolvedValue(createMockDocRef('new_doc_id')),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: documents.length === 0,
      size: documents.length,
      docs: documents.map((doc) => ({
        id: doc.id || 'mock_id',
        data: () => doc,
        exists: true,
      })),
    }),
  };
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock Firebase Admin Auth
 */
export function mockFirebaseAuth() {
  return {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test_user_id',
      email: 'test@example.com',
      role: 'customer',
    }),
    createUser: jest.fn().mockResolvedValue({
      uid: 'new_user_id',
    }),
    updateUser: jest.fn().mockResolvedValue({
      uid: 'test_user_id',
    }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Mock Firebase Admin Firestore
 */
export function mockFirestore() {
  const collections: Record<string, any> = {};

  return {
    collection: jest.fn((name: string) => {
      if (!collections[name]) {
        collections[name] = createMockCollectionRef();
      }
      return collections[name];
    }),
    doc: jest.fn((path: string) => createMockDocRef(path)),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    })),
    runTransaction: jest.fn((callback) => callback({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  };
}

/**
 * Assert response shape
 */
export function expectValidResponse(response: any) {
  expect(response).toHaveProperty('success');
  if (response.success) {
    expect(response).toHaveProperty('data');
  } else {
    expect(response).toHaveProperty('error');
  }
}

/**
 * Assert error response
 */
export function expectErrorResponse(response: any, statusCode: number) {
  expect(response.success).toBe(false);
  expect(response).toHaveProperty('error');
  expect(response.error).toBeTruthy();
}
