/**
 * @jest-environment node
 */

/**
 * Auth API — Verify Email Tests
 *
 * GET /api/auth/verify-email?token=<oobCode>
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({}),
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
  class ValidationError extends AppError {
    constructor(message: string) {
      super(400, message, "VALIDATION_ERROR");
    }
  }
  return { AppError, ValidationError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error?.statusCode ?? 500;
    return NextResponse.json(
      { success: false, error: error?.message ?? "Internal server error" },
      { status },
    );
  },
  logError: jest.fn(),
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
  errorResponse: (message: string, status = 400, fields?: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: message, fields },
      { status },
    );
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key),
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { TOKEN_REQUIRED: "Verification token is required" },
    EMAIL: { VERIFICATION_FAILED: "Email verification failed" },
  },
  SUCCESS_MESSAGES: {
    EMAIL: { VERIFIED: "Email verified successfully" },
  },
}));

import { GET } from "../auth/verify-email/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — GET /api/auth/verify-email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 for a valid token in query string", async () => {
    const req = buildRequest(
      "/api/auth/verify-email?token=valid-oob-code-abc123",
      { method: "GET" },
    );
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when token query param is missing", async () => {
    const req = buildRequest("/api/auth/verify-email", { method: "GET" });
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when token is an empty string", async () => {
    const req = buildRequest("/api/auth/verify-email?token=", {
      method: "GET",
    });
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});
