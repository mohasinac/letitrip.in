/**
 * @jest-environment node
 */

/**
 * User Sessions API Tests
 *
 * GET /api/user/sessions
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

const mockFindAllByUser = jest.fn();
const mockCountActiveByUser = jest.fn();
jest.mock("@/repositories", () => ({
  sessionRepository: {
    findAllByUser: (...args: unknown[]) => mockFindAllByUser(...args),
    countActiveByUser: (...args: unknown[]) => mockCountActiveByUser(...args),
  },
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
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { UNAUTHORIZED: "Unauthorized" },
    SESSION: { FETCH_FAILED: "Failed to fetch sessions" },
  },
  SUCCESS_MESSAGES: {},
}));

import { GET } from "../user/sessions/route";

// ─── Test Data ────────────────────────────────────────────────────────────────

const AUTH_USER = { uid: "user-123", email: "user@example.com" };

const MOCK_SESSIONS = [
  {
    id: "session-1",
    userId: "user-123",
    isActive: true,
    createdAt: new Date(),
    deviceInfo: {
      browser: "Chrome",
      os: "Windows",
      device: "Desktop",
      ip: "192.168.1.xxx",
    },
  },
  {
    id: "session-2",
    userId: "user-123",
    isActive: false,
    createdAt: new Date(),
    deviceInfo: {
      browser: "Safari",
      os: "macOS",
      device: "Desktop",
      ip: "10.0.0.xxx",
    },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("User Sessions API — GET /api/user/sessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
    mockFindAllByUser.mockResolvedValue(MOCK_SESSIONS);
    mockCountActiveByUser.mockResolvedValue(1);
  });

  it("returns 200 with sessions and activeCount", async () => {
    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("sessions");
    expect(body.data).toHaveProperty("activeCount");
    expect(body.data).toHaveProperty("total");
  });

  it("returns correct activeCount", async () => {
    const res = await GET();
    const { body } = await parseResponse(res);

    expect(body.data.activeCount).toBe(1);
  });

  it("calls sessionRepository.findAllByUser with the authenticated uid", async () => {
    await GET();

    expect(mockFindAllByUser).toHaveBeenCalledWith(AUTH_USER.uid, 20);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const res = await GET();
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
