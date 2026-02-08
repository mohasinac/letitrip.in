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
