/**
 * @jest-environment node
 */

/**
 * Site Settings API Integration Tests
 *
 * Tests GET /api/site-settings and PATCH /api/site-settings
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ============================================
// Mocks
// ============================================

const mockGetSingleton = jest.fn();
const mockUpdateSingleton = jest.fn();

jest.mock("@/repositories", () => ({
  siteSettingsRepository: {
    getSingleton: (...args: unknown[]) => mockGetSingleton(...args),
    updateSingleton: (...args: unknown[]) => mockUpdateSingleton(...args),
  },
}));

const mockGetUserFromRequest = jest.fn();
const mockRequireRoleFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  getUserFromRequest: (...args: unknown[]) => mockGetUserFromRequest(...args),
  requireRoleFromRequest: (...args: unknown[]) =>
    mockRequireRoleFromRequest(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    if (body && Object.keys(body).length > 0) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["body"], message: "Body cannot be empty" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  siteSettingsUpdateSchema: {},
}));

jest.mock("@/lib/errors", () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthorizationError";
    }
  },
}));

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    if (error?.name === "AuthenticationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }
    if (error?.name === "AuthorizationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  },
  logError: jest.fn(),
}));

const mockServerLoggerInfo = jest.fn();
jest.mock("@/lib/server-logger", () => ({
  serverLogger: {
    info: (...args: unknown[]) => mockServerLoggerInfo(...args),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("@/lib/email", () => ({
  sendSiteSettingsChangedEmail: jest.fn().mockResolvedValue(undefined),
  sendNewProductSubmittedEmail: jest.fn().mockResolvedValue(undefined),
  sendNewReviewNotificationEmail: jest.fn().mockResolvedValue(undefined),
}));

import { GET, PATCH } from "../site-settings/route";

// ============================================
// Mock data
// ============================================

const fullSettings = {
  siteName: "LetItRip",
  siteUrl: "https://letitrip.in",
  contact: {
    email: "support@letitrip.in",
    phone: "+91-1234567890",
    address: "123 Market Street, Mumbai",
  },
  socialLinks: {
    twitter: "https://twitter.com/letitrip",
    instagram: "https://instagram.com/letitrip",
  },
  emailSettings: {
    fromEmail: "noreply@letitrip.in",
    replyTo: "support@letitrip.in",
    smtpHost: "smtp.resend.com",
  },
  legalPages: {
    privacyPolicy: "<html>Privacy Policy content...</html>",
    termsOfService: "<html>Terms content...</html>",
  },
};

// ============================================
// Tests
// ============================================

describe("Site Settings API - GET /api/site-settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSingleton.mockResolvedValue({ ...fullSettings });
    mockGetUserFromRequest.mockResolvedValue(null);
  });

  it("returns settings for public users", async () => {
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.siteName).toBe("LetItRip");
  });

  it("hides emailSettings for non-admin", async () => {
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.emailSettings).toBeUndefined();
  });

  it("hides legalPages for non-admin", async () => {
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.legalPages).toBeUndefined();
  });

  it("returns full settings for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.emailSettings).toBeDefined();
    expect(body.data.legalPages).toBeDefined();
  });

  it("returns contact info for public users", async () => {
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.contact.email).toBe("support@letitrip.in");
    expect(body.data.contact.phone).toBe("+91-1234567890");
  });

  it("sets public cache-control headers for non-admin", async () => {
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("sets private cache-control for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("private");
  });

  it("handles repository errors gracefully", async () => {
    mockGetSingleton.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/site-settings");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe("Site Settings API - PATCH /api/site-settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRoleFromRequest.mockResolvedValue(mockAdminUser());
    mockUpdateSingleton.mockResolvedValue({
      ...fullSettings,
      siteName: "Updated Name",
    });
  });

  it("updates settings with valid data", async () => {
    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Updated Name" },
    });
    const res = await PATCH(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.siteName).toBe("Updated Name");
  });

  it("requires admin role", async () => {
    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Test" },
    });
    await PATCH(req);
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "admin",
    ]);
  });

  it("calls updateSingleton on repository", async () => {
    const updateData = { siteName: "New Name" };
    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: updateData,
    });
    await PATCH(req);

    expect(mockUpdateSingleton).toHaveBeenCalledWith(updateData);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Test" },
    });
    const res = await PATCH(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { AuthorizationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthorizationError("Forbidden"),
    );

    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Test" },
    });
    const res = await PATCH(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("handles repository update errors", async () => {
    mockUpdateSingleton.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Test" },
    });
    const res = await PATCH(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });

  // ──────────────────────────────────────────
  // Audit logging (Phase 7.6)
  // ──────────────────────────────────────────

  it("writes an audit log entry on successful update", async () => {
    const admin = mockAdminUser();
    mockRequireRoleFromRequest.mockResolvedValue(admin);

    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Audited Name" },
    });
    await PATCH(req);

    expect(mockServerLoggerInfo).toHaveBeenCalledWith(
      expect.stringContaining("AUDIT"),
      expect.objectContaining({
        adminId: admin.uid,
        adminEmail: admin.email,
        changedFields: expect.arrayContaining(["siteName"]),
      }),
    );
  });

  it("does not write audit log when update fails", async () => {
    mockUpdateSingleton.mockRejectedValue(new Error("DB error"));

    const req = buildRequest("/api/site-settings", {
      method: "PATCH",
      body: { siteName: "Test" },
    });
    await PATCH(req);

    expect(mockServerLoggerInfo).not.toHaveBeenCalled();
  });
});
