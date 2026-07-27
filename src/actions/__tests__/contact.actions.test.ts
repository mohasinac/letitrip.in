import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockHeaders,
  mockRateLimitByIdentifier,
  mockSendContactEmail,
  mockSupportCreateTicket,
  mockNormalizeError,
} = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockSendContactEmail: vi.fn(),
  mockSupportCreateTicket: vi.fn(),
  mockNormalizeError: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mockHeaders,
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  ERROR_MESSAGES: {
    VALIDATION: {
      REQUIRED_FIELD: "This field is required",
      INVALID_EMAIL: "Invalid email address",
      MESSAGE_TOO_SHORT: "Message is too short",
      FAILED: "Validation failed",
    },
    CONTACT: { SEND_FAILED: "Failed to send contact message" },
  },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  supportRepository: { createTicket: mockSupportCreateTicket },
  sendContactEmail: mockSendContactEmail,
  normalizeError: mockNormalizeError,
}));

import { sendContactAction } from "../contact.actions";

function makeHeadersGet(forwardedFor: string | null = null, realIp: string | null = null) {
  return (name: string) => {
    if (name === "x-forwarded-for") return forwardedFor;
    if (name === "x-real-ip") return realIp;
    return null;
  };
}

function makeValidInput() {
  return {
    name: "Ravi Kumar",
    email: "ravi@test.com",
    subject: "Test Subject",
    message: "This is a test message that is long enough.",
  };
}

describe("sendContactAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: makeHeadersGet("1.2.3.4") });
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockSendContactEmail.mockResolvedValue({ success: true });
    mockSupportCreateTicket.mockResolvedValue({ id: "ticket-1" });
  });

  it("rate limit exceeded (STRICT by IP) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await sendContactAction(makeValidInput());
    expect(result.ok).toBe(false);
  });

  it("rate limit key includes IP from x-forwarded-for", async () => {
    await sendContactAction(makeValidInput());
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "contact:1.2.3.4",
      expect.anything(),
    );
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    mockHeaders.mockResolvedValue({ get: makeHeadersGet(null, "5.6.7.8") });
    await sendContactAction(makeValidInput());
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "contact:5.6.7.8",
      expect.anything(),
    );
  });

  it("falls back to 'anonymous' when no IP header present", async () => {
    mockHeaders.mockResolvedValue({ get: makeHeadersGet(null, null) });
    await sendContactAction(makeValidInput());
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "contact:anonymous",
      expect.anything(),
    );
  });

  it("x-forwarded-for has multiple IPs → uses first one", async () => {
    mockHeaders.mockResolvedValue({ get: makeHeadersGet("1.1.1.1, 2.2.2.2, 3.3.3.3") });
    await sendContactAction(makeValidInput());
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith("contact:1.1.1.1", expect.anything());
  });

  it("email invalid format → { ok: false }", async () => {
    const result = await sendContactAction({ ...makeValidInput(), email: "not-an-email" });
    expect(result.ok).toBe(false);
  });

  it("name missing (empty) → { ok: false }", async () => {
    const result = await sendContactAction({ ...makeValidInput(), name: "" });
    expect(result.ok).toBe(false);
  });

  it("subject missing (empty) → { ok: false }", async () => {
    const result = await sendContactAction({ ...makeValidInput(), subject: "" });
    expect(result.ok).toBe(false);
  });

  it("message < 10 chars → { ok: false } (min10, NOT min20)", async () => {
    const result = await sendContactAction({ ...makeValidInput(), message: "Short" });
    expect(result.ok).toBe(false);
  });

  it("message exactly 10 chars → valid", async () => {
    const result = await sendContactAction({ ...makeValidInput(), message: "1234567890" });
    expect(result.ok).toBe(true);
  });

  it("message > 5000 chars → { ok: false }", async () => {
    const result = await sendContactAction({ ...makeValidInput(), message: "a".repeat(5001) });
    expect(result.ok).toBe(false);
  });

  it("valid → sendContactEmail called with { name, email, subject, message }", async () => {
    await sendContactAction(makeValidInput());
    expect(mockSendContactEmail).toHaveBeenCalledWith({
      name: "Ravi Kumar",
      email: "ravi@test.com",
      subject: "Test Subject",
      message: "This is a test message that is long enough.",
    });
  });

  it("valid → supportRepository.createTicket called with correct shape", async () => {
    await sendContactAction(makeValidInput());
    expect(mockSupportCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: "ravi@test.com",
        category: "general",
        subject: "Test Subject",
        description: "This is a test message that is long enough.",
      }),
    );
  });

  it("supportRepository.createTicket throws → error swallowed (non-fatal), still returns { ok: true }", async () => {
    mockSupportCreateTicket.mockRejectedValue(new Error("DB error"));
    const result = await sendContactAction(makeValidInput());
    expect(result.ok).toBe(true);
  });

  it("sendContactEmail throws → { ok: false } (primary — not swallowed)", async () => {
    mockSendContactEmail.mockRejectedValue(new Error("Email provider down"));
    const result = await sendContactAction(makeValidInput());
    expect(result.ok).toBe(false);
  });

  it("sendContactEmail returns { success: true } → { ok: true, data: { sent: true } }", async () => {
    const result = await sendContactAction(makeValidInput());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ sent: true });
  });
});
