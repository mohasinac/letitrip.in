/**
 * @jest-environment node
 */

/**
 * Contact API Tests
 *
 * POST /api/contact
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockSendContactEmail = jest.fn();
jest.mock("@/lib/email", () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
}));

const mockApplyRateLimit = jest.fn();
jest.mock("@/lib/security/rate-limit", () => ({
  applyRateLimit: (...args: unknown[]) => mockApplyRateLimit(...args),
  RateLimitPresets: { STRICT: { limit: 5, window: 60 } },
}));

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error?.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error" },
      { status },
    );
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status });
  },
  ApiErrors: {
    validationError: (issues: any) => {
      const { NextResponse } = require("next/server");
      return NextResponse.json({ success: false, issues }, { status: 422 });
    },
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { POST } from "../contact/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

const validPayload = {
  name: "Test User",
  email: "test@example.com",
  subject: "Help needed",
  message: "This is a test message that is long enough.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendContactEmail.mockResolvedValue({ success: true });
    mockApplyRateLimit.mockResolvedValue({ success: true });
  });

  it("returns 200 when all required fields are present", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: validPayload,
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls sendContactEmail with correct data", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: validPayload,
    });
    await POST(req);

    expect(mockSendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
        subject: "Help needed",
      }),
    );
  });

  it("returns 422 when name is missing", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: { ...validPayload, name: "" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });

  it("returns 422 when message is missing", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: { ...validPayload, message: "" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });

  it("returns 422 for invalid email format", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: { ...validPayload, email: "not-an-email" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });

  it("returns 422 when subject is missing", async () => {
    const req = buildRequest("/api/contact", {
      method: "POST",
      body: { ...validPayload, subject: "" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });

  it("returns 500 when sendContactEmail fails", async () => {
    mockSendContactEmail.mockResolvedValue({ success: false });

    const req = buildRequest("/api/contact", {
      method: "POST",
      body: validPayload,
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockApplyRateLimit.mockResolvedValueOnce({ success: false });

    const req = buildRequest("/api/contact", {
      method: "POST",
      body: validPayload,
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(429);
  });
});
