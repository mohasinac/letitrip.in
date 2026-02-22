/**
 * @jest-environment node
 */

/**
 * Public Newsletter Subscribe API Tests
 *
 * POST /api/newsletter/subscribe
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockSubscribe = jest.fn();
jest.mock("@/repositories", () => ({
  newsletterRepository: {
    subscribe: (...args: unknown[]) => mockSubscribe(...args),
  },
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
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { POST } from "../newsletter/subscribe/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/newsletter/subscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribe.mockResolvedValue({ isNew: true });
  });

  it("returns 201 for a valid new subscription", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 201 for an already-subscribed email (no subscription leak)", async () => {
    mockSubscribe.mockResolvedValue({ isNew: false });

    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "existing@example.com" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    // Always 201 regardless of whether subscriber is new or existing
    expect(status).toBe(201);
  });

  it("returns 400 for an invalid email format", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "not-an-email" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when email field is missing", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("calls newsletterRepository.subscribe with the email", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "newuser@example.com" },
    });
    await POST(req);

    expect(mockSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ email: "newuser@example.com" }),
    );
  });

  it("passes optional source param to repository", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "user@example.com", source: "homepage" },
    });
    await POST(req);

    expect(mockSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ source: "homepage" }),
    );
  });

  it("returns the subscribed email in response data", async () => {
    const req = buildRequest("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    const res = await POST(req);
    const { body } = await parseResponse(res);

    expect(body.data?.email).toBe("user@example.com");
  });
});
