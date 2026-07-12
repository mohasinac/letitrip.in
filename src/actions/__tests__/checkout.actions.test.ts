import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockSendCheckoutConsentOtp,
  mockVerifyCheckoutConsentOtp,
  mockGrantCheckoutConsentViaSms,
  mockUserRepositoryFindById,
  mockWrapAction,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockSendCheckoutConsentOtp: vi.fn(),
  mockVerifyCheckoutConsentOtp: vi.fn(),
  mockGrantCheckoutConsentViaSms: vi.fn(),
  mockUserRepositoryFindById: vi.fn(),
  mockWrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: mockWrapAction,
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  sendCheckoutConsentOtp: mockSendCheckoutConsentOtp,
  verifyCheckoutConsentOtp: mockVerifyCheckoutConsentOtp,
  grantCheckoutConsentViaSms: mockGrantCheckoutConsentViaSms,
  userRepository: { findById: mockUserRepositoryFindById },
  CONSENT_OTP_VERIFY_RATE_LIMIT: "strict",
}));

import {
  sendConsentOtpAction,
  verifyConsentOtpAction,
  grantCheckoutConsentViaSmsAction,
} from "../checkout.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

describe("sendConsentOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockSendCheckoutConsentOtp.mockResolvedValue({ maskedEmail: "b***@test.com" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await sendConsentOtpAction("addr-1");
    expect(result.ok).toBe(false);
  });

  it("addressId empty string → { ok: false }", async () => {
    const result = await sendConsentOtpAction("");
    expect(result.ok).toBe(false);
  });

  it("user with no email → { ok: false }", async () => {
    mockRequireAuthUser.mockResolvedValue(makeUser({ email: null }));
    const result = await sendConsentOtpAction("addr-1");
    expect(result.ok).toBe(false);
  });

  it("valid → sendCheckoutConsentOtp called with (uid, email, addressId)", async () => {
    await sendConsentOtpAction("addr-1");
    expect(mockSendCheckoutConsentOtp).toHaveBeenCalledWith(
      "user-buyer-1",
      "buyer@test.com",
      "addr-1",
    );
  });

  it("sendCheckoutConsentOtp throws → { ok: false }", async () => {
    mockSendCheckoutConsentOtp.mockRejectedValue(new Error("OTP send failed"));
    const result = await sendConsentOtpAction("addr-1");
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/OTP send failed/i);
  });

  it("valid → returns { ok: true, data: { maskedEmail } }", async () => {
    const result = await sendConsentOtpAction("addr-1");
    expect(result.ok).toBe(true);
    expect((result as { data: { maskedEmail: string } }).data.maskedEmail).toBe("b***@test.com");
  });
});

describe("verifyConsentOtpAction — no wrapAction, throws raw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockVerifyCheckoutConsentOtp.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(verifyConsentOtpAction("addr-1", "123456")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(verifyConsentOtpAction("addr-1", "123456")).rejects.toThrow(/Too many attempts/i);
  });

  it("addressId missing → throws (schema parse fail)", async () => {
    await expect(verifyConsentOtpAction("", "123456")).rejects.toThrow();
  });

  it("code missing → throws (schema parse fail)", async () => {
    await expect(verifyConsentOtpAction("addr-1", "")).rejects.toThrow();
  });

  it("code not exactly 6 chars → throws", async () => {
    await expect(verifyConsentOtpAction("addr-1", "12345")).rejects.toThrow();
  });

  it("code contains non-digits → throws", async () => {
    await expect(verifyConsentOtpAction("addr-1", "12345a")).rejects.toThrow();
  });

  it("valid 6-digit code → verifyCheckoutConsentOtp called with (uid, addressId, code)", async () => {
    await verifyConsentOtpAction("addr-1", "123456");
    expect(mockVerifyCheckoutConsentOtp).toHaveBeenCalledWith(
      "user-buyer-1",
      "addr-1",
      "123456",
    );
  });

  it("rateLimitByIdentifier called with consent:otp:verify:{uid}", async () => {
    await verifyConsentOtpAction("addr-1", "123456");
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "consent:otp:verify:user-buyer-1",
      expect.anything(),
    );
  });

  it("verifyCheckoutConsentOtp throws → propagates error", async () => {
    mockVerifyCheckoutConsentOtp.mockRejectedValue(new Error("OTP invalid"));
    await expect(verifyConsentOtpAction("addr-1", "123456")).rejects.toThrow("OTP invalid");
  });
});

describe("grantCheckoutConsentViaSmsAction — no wrapAction, throws raw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockUserRepositoryFindById.mockResolvedValue({ phoneNumber: "+919876543210", role: "user" });
    mockGrantCheckoutConsentViaSms.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(grantCheckoutConsentViaSmsAction("addr-1")).rejects.toThrow();
  });

  it("addressId empty string → throws (schema parse fail)", async () => {
    await expect(grantCheckoutConsentViaSmsAction("")).rejects.toThrow();
  });

  it("valid → userRepository.findById called with uid", async () => {
    await grantCheckoutConsentViaSmsAction("addr-1");
    expect(mockUserRepositoryFindById).toHaveBeenCalledWith("user-buyer-1");
  });

  it("valid → grantCheckoutConsentViaSms called with (uid, phone, addressId)", async () => {
    await grantCheckoutConsentViaSmsAction("addr-1");
    expect(mockGrantCheckoutConsentViaSms).toHaveBeenCalledWith(
      "user-buyer-1",
      "+919876543210",
      "addr-1",
    );
  });

  it("user profile not found → grantCheckoutConsentViaSms called with undefined phone", async () => {
    mockUserRepositoryFindById.mockResolvedValue(null);
    await grantCheckoutConsentViaSmsAction("addr-1");
    expect(mockGrantCheckoutConsentViaSms).toHaveBeenCalledWith(
      "user-buyer-1",
      undefined,
      "addr-1",
    );
  });

  it("grantCheckoutConsentViaSms throws → propagates", async () => {
    mockGrantCheckoutConsentViaSms.mockRejectedValue(new Error("SMS failed"));
    await expect(grantCheckoutConsentViaSmsAction("addr-1")).rejects.toThrow("SMS failed");
  });
});
