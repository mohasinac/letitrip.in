import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockHeaders,
  mockRateLimitByIdentifier,
  mockSubscribeNewsletter,
} = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockSubscribeNewsletter: vi.fn(),
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
  subscribeNewsletter: mockSubscribeNewsletter,
  NEWSLETTER_SUBSCRIBER_FIELDS: {
    SOURCE_VALUES: {
      FOOTER: "footer",
      HOMEPAGE: "homepage",
      CHECKOUT: "checkout",
      POPUP: "popup",
    },
  },
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  ERROR_MESSAGES: {
    VALIDATION: {
      INVALID_EMAIL: "Invalid email address",
      FAILED: "Validation failed",
    },
  },
}));

import { subscribeNewsletterAction } from "../newsletter.actions";

function makeHeadersGet(forwardedFor: string | null = null, realIp: string | null = null) {
  return (name: string) => {
    if (name === "x-forwarded-for") return forwardedFor;
    if (name === "x-real-ip") return realIp;
    return null;
  };
}

describe("subscribeNewsletterAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: makeHeadersGet("1.2.3.4") });
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockSubscribeNewsletter.mockResolvedValue({ subscribed: true });
  });

  it("rate limit exceeded (STRICT by IP) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await subscribeNewsletterAction({ email: "test@test.com" });
    expect(result.ok).toBe(false);
  });

  it("rate limit key includes IP from x-forwarded-for", async () => {
    await subscribeNewsletterAction({ email: "test@test.com" });
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "newsletter:1.2.3.4",
      expect.anything(),
    );
  });

  it("rate limit falls back to 'anonymous' when no IP headers", async () => {
    mockHeaders.mockResolvedValue({ get: makeHeadersGet(null, null) });
    await subscribeNewsletterAction({ email: "test@test.com" });
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "newsletter:anonymous",
      expect.anything(),
    );
  });

  it("email missing → { ok: false }", async () => {
    const result = await subscribeNewsletterAction({ email: "" });
    expect(result.ok).toBe(false);
  });

  it("email invalid format → { ok: false }", async () => {
    const result = await subscribeNewsletterAction({ email: "not-an-email" });
    expect(result.ok).toBe(false);
  });

  it("source omitted → valid (source is optional)", async () => {
    const result = await subscribeNewsletterAction({ email: "test@test.com" });
    expect(result.ok).toBe(true);
  });

  it("source provided with invalid enum value → { ok: false }", async () => {
    const result = await subscribeNewsletterAction({ email: "test@test.com", source: "invalid-source" as any });
    expect(result.ok).toBe(false);
  });

  it("valid with source='footer' → subscribeNewsletter called with source='footer'", async () => {
    await subscribeNewsletterAction({ email: "test@test.com", source: "footer" as any });
    expect(mockSubscribeNewsletter).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@test.com", source: "footer" }),
    );
  });

  it("valid with source='homepage' → subscribeNewsletter called with source='homepage'", async () => {
    await subscribeNewsletterAction({ email: "test@test.com", source: "homepage" as any });
    expect(mockSubscribeNewsletter).toHaveBeenCalledWith(
      expect.objectContaining({ source: "homepage" }),
    );
  });

  it("valid without source → subscribeNewsletter called with source=undefined", async () => {
    await subscribeNewsletterAction({ email: "test@test.com" });
    const call = mockSubscribeNewsletter.mock.calls[0][0];
    expect(call.source).toBeUndefined();
  });

  it("ipAddress extracted from x-forwarded-for and passed to subscribeNewsletter", async () => {
    await subscribeNewsletterAction({ email: "test@test.com" });
    const call = mockSubscribeNewsletter.mock.calls[0][0];
    expect(call.ipAddress).toBe("1.2.3.4");
  });

  it("ipAddress is undefined when IP is 'anonymous'", async () => {
    mockHeaders.mockResolvedValue({ get: makeHeadersGet(null, null) });
    await subscribeNewsletterAction({ email: "test@test.com" });
    const call = mockSubscribeNewsletter.mock.calls[0][0];
    expect(call.ipAddress).toBeUndefined();
  });

  it("returns { ok: true, data: { subscribed: boolean } }", async () => {
    const result = await subscribeNewsletterAction({ email: "test@test.com" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ subscribed: true });
  });

  it("subscribeNewsletter throws → { ok: false }", async () => {
    mockSubscribeNewsletter.mockRejectedValue(new Error("Email provider error"));
    const result = await subscribeNewsletterAction({ email: "test@test.com" });
    expect(result.ok).toBe(false);
  });
});
