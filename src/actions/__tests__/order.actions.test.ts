import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockCancelOrderForUser,
  mockListOrdersForUser,
  mockGetOrderByIdForUser,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCancelOrderForUser: vi.fn(),
  mockListOrdersForUser: vi.fn(),
  mockGetOrderByIdForUser: vi.fn(),
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
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  cancelOrderForUser: mockCancelOrderForUser,
  listOrdersForUser: mockListOrdersForUser,
  getOrderByIdForUser: mockGetOrderByIdForUser,
}));

import {
  cancelOrderAction,
  listOrdersAction,
  getOrderByIdAction,
} from "../order.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1-20260629-abc",
    buyerId: "user-buyer-1",
    status: "PENDING",
    totalAmount: 100000,
    ...overrides,
  };
}

describe("cancelOrderAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCancelOrderForUser.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(cancelOrderAction("order-1-20260629-abc")).rejects.toThrow();
  });

  it("rate limit exceeded (STRICT preset) → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(cancelOrderAction("order-1-20260629-abc")).rejects.toThrow();
  });
});

describe("cancelOrderAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCancelOrderForUser.mockResolvedValue(undefined);
  });

  it("empty id → throws ValidationError('Invalid input')", async () => {
    await expect(cancelOrderAction("")).rejects.toThrow(/invalid input/i);
  });

  it("reason > 500 chars → throws ValidationError('Invalid input')", async () => {
    const longReason = "x".repeat(501);
    await expect(cancelOrderAction("order-1-20260629-abc", longReason)).rejects.toThrow(/invalid input/i);
  });
});

describe("cancelOrderAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCancelOrderForUser.mockResolvedValue(undefined);
  });

  it("valid → cancelOrderForUser called with (uid, id, reason)", async () => {
    await cancelOrderAction("order-1-20260629-abc", "Changed my mind");
    expect(mockCancelOrderForUser).toHaveBeenCalledWith(
      "user-buyer-1",
      "order-1-20260629-abc",
      "Changed my mind",
    );
  });

  it("reason omitted → cancelOrderForUser called with default 'Cancelled by user'", async () => {
    await cancelOrderAction("order-1-20260629-abc");
    const callArg = mockCancelOrderForUser.mock.calls[0][2];
    expect(callArg).toBe("Cancelled by user");
  });
});

describe("listOrdersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockListOrdersForUser.mockResolvedValue([makeOrder()]);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await listOrdersAction();
    expect(result.ok).toBe(false);
  });

  it("valid → listOrdersForUser called with uid", async () => {
    await listOrdersAction();
    expect(mockListOrdersForUser).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: OrderDocument[] }", async () => {
    const result = await listOrdersAction();
    expect(result.ok).toBe(true);
  });
});

describe("getOrderByIdAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetOrderByIdForUser.mockResolvedValue(makeOrder());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getOrderByIdAction("order-1-20260629-abc");
    expect(result.ok).toBe(false);
  });

  it("valid → getOrderByIdForUser called with (uid, id)", async () => {
    await getOrderByIdAction("order-1-20260629-abc");
    expect(mockGetOrderByIdForUser).toHaveBeenCalledWith("user-buyer-1", "order-1-20260629-abc");
  });

  it("returns { ok: true, data: OrderDocument }", async () => {
    const result = await getOrderByIdAction("order-1-20260629-abc");
    expect(result.ok).toBe(true);
  });
});
