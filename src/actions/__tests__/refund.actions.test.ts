import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockIssuePartialRefund,
  mockPreviewCancellationRefund,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockIssuePartialRefund: vi.fn(),
  mockPreviewCancellationRefund: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  issuePartialRefund: mockIssuePartialRefund,
  previewCancellationRefund: mockPreviewCancellationRefund,
}));

import {
  adminPartialRefundAction,
  previewCancellationRefundAction,
} from "../refund.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeRefundResult(overrides: Record<string, unknown> = {}) {
  return {
    refundAmount: 45000,
    orderId: "order-1-20260629-abc123",
    status: "REFUNDED",
    ...overrides,
  };
}

describe("adminPartialRefundAction — auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockIssuePartialRefund.mockResolvedValue(makeRefundResult());
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminPartialRefundAction({ orderId: "order-abc", deductFees: true });
    expect(result.ok).toBe(false);
  });

  it("role 'moderator' (not admin) → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminPartialRefundAction({ orderId: "order-abc", deductFees: true });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await adminPartialRefundAction({ orderId: "order-abc", deductFees: true });
    expect(result.ok).toBe(false);
  });
});

describe("adminPartialRefundAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockIssuePartialRefund.mockResolvedValue(makeRefundResult());
  });

  it("empty orderId → { ok: false }", async () => {
    const result = await adminPartialRefundAction({ orderId: "", deductFees: true });
    expect(result.ok).toBe(false);
  });

  it("refundNote > 500 chars → { ok: false }", async () => {
    const result = await adminPartialRefundAction({
      orderId: "order-abc",
      deductFees: true,
      refundNote: "x".repeat(501),
    });
    expect(result.ok).toBe(false);
  });
});

describe("adminPartialRefundAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockIssuePartialRefund.mockResolvedValue(makeRefundResult());
  });

  it("deductFees defaults to true when not provided", async () => {
    await adminPartialRefundAction({ orderId: "order-abc" } as any);
    expect(mockIssuePartialRefund).toHaveBeenCalledWith(
      "user-admin-1",
      "order-abc",
      true,
      undefined,
    );
  });

  it("valid → issuePartialRefund called with (adminUid, orderId, deductFees, refundNote)", async () => {
    await adminPartialRefundAction({ orderId: "order-abc", deductFees: false, refundNote: "Double charge" });
    expect(mockIssuePartialRefund).toHaveBeenCalledWith(
      "user-admin-1",
      "order-abc",
      false,
      "Double charge",
    );
  });

  it("returns { ok: true, data: PartialRefundResult }", async () => {
    const result = await adminPartialRefundAction({ orderId: "order-abc", deductFees: true });
    expect(result.ok).toBe(true);
    expect((result as { data: { refundAmount: number } }).data.refundAmount).toBe(45000);
  });
});

describe("previewCancellationRefundAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockPreviewCancellationRefund.mockResolvedValue(makeRefundResult());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await previewCancellationRefundAction("order-abc");
    expect(result.ok).toBe(false);
  });

  it("valid → previewCancellationRefund called with (uid, orderId)", async () => {
    await previewCancellationRefundAction("order-abc");
    expect(mockPreviewCancellationRefund).toHaveBeenCalledWith("user-buyer-1", "order-abc");
  });

  it("returns { ok: true, data: PartialRefundResult | null }", async () => {
    const result = await previewCancellationRefundAction("order-abc");
    expect(result.ok).toBe(true);
  });

  it("null result (no refund applicable) → { ok: true, data: null }", async () => {
    mockPreviewCancellationRefund.mockResolvedValue(null);
    const result = await previewCancellationRefundAction("order-abc");
    expect(result.ok).toBe(true);
    expect((result as { data: null }).data).toBeNull();
  });
});
