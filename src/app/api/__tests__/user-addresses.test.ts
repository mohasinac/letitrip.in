/**
 * @jest-environment node
 */

/**
 * User Addresses API Tests
 *
 * GET  /api/user/addresses
 * POST /api/user/addresses
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockRequireAuth = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockFindByUser = jest.fn();
const mockCount = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/repositories", () => ({
  addressRepository: {
    findByUser: (...args: unknown[]) => mockFindByUser(...args),
    count: (...args: unknown[]) => mockCount(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

// Inline validation — validate a minimal address schema
jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    const required = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
      "postalCode",
    ];
    const missing = required.filter((k) => !body[k]);
    if (missing.length) {
      return {
        success: false,
        errors: missing.map((k) => ({ path: [k], message: "Required" })),
      };
    }
    return { success: true, data: body };
  },
  formatZodErrors: (errors: any[]) =>
    Object.fromEntries(errors.map((e) => [e.path[0], [e.message]])),
  userAddressCreateSchema: {},
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
    toJSON() {
      return { success: false, error: this.message, code: this.code };
    }
  }
  class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, message, "AUTH_ERROR");
    }
  }
  return {
    AppError,
    AuthenticationError,
    handleApiError: (error: any) => {
      const { NextResponse } = require("next/server");
      const status = error?.statusCode ?? 500;
      return NextResponse.json(
        { success: false, error: error?.message ?? "Internal server error" },
        { status },
      );
    },
  };
});

jest.mock("@/lib/errors/error-handler", () => {
  const errors = jest.requireMock("@/lib/errors");
  return { handleApiError: errors.handleApiError, logError: jest.fn() };
});

jest.mock("@/lib/api-response", () => ({
  successResponse: (data?: unknown, message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status });
  },
  errorResponse: (message: string, status = 400, fields?: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: message, fields },
      { status },
    );
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { FAILED: "Validation failed" },
    ADDRESS: { LIMIT_REACHED: "Address limit reached" },
  },
  SUCCESS_MESSAGES: {
    ADDRESS: { CREATED: "Address created" },
  },
}));

import { GET, POST } from "../user/addresses/route";

// ─── Test Data ────────────────────────────────────────────────────────────────

const AUTH_USER = { uid: "user-123", email: "user@example.com" };

const VALID_ADDRESS = {
  fullName: "John Doe",
  phone: "+15551234567",
  addressLine1: "123 Main St",
  city: "Springfield",
  state: "IL",
  country: "US",
  postalCode: "62701",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("User Addresses API — GET /api/user/addresses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
  });

  it("returns 200 with list of addresses", async () => {
    mockFindByUser.mockResolvedValue([{ id: "addr-1", ...VALID_ADDRESS }]);

    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("returns empty array when user has no addresses", async () => {
    mockFindByUser.mockResolvedValue([]);

    const res = await GET();
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(0);
  });

  it("calls addressRepository.findByUser with the authenticated uid", async () => {
    mockFindByUser.mockResolvedValue([]);

    await GET();

    expect(mockFindByUser).toHaveBeenCalledWith(AUTH_USER.uid);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const res = await GET();
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

describe("User Addresses API — POST /api/user/addresses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({ id: "new-addr-1", ...VALID_ADDRESS });
  });

  it("returns 201 with the created address", async () => {
    const req = buildRequest("/api/user/addresses", {
      method: "POST",
      body: VALID_ADDRESS,
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("new-addr-1");
  });

  it("calls addressRepository.create with the authenticated uid", async () => {
    const req = buildRequest("/api/user/addresses", {
      method: "POST",
      body: VALID_ADDRESS,
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      AUTH_USER.uid,
      expect.objectContaining({ fullName: "John Doe" }),
    );
  });

  it("returns 400 for missing required fields", async () => {
    const req = buildRequest("/api/user/addresses", {
      method: "POST",
      body: { fullName: "Incomplete" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 422 when address limit (10) is reached", async () => {
    mockCount.mockResolvedValue(10);

    const req = buildRequest("/api/user/addresses", {
      method: "POST",
      body: VALID_ADDRESS,
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const req = buildRequest("/api/user/addresses", {
      method: "POST",
      body: VALID_ADDRESS,
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
