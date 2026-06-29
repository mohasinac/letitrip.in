import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockRevokeSession,
  mockRevokeUserSessions,
  mockAdminUpdateOrder,
  mockAdminUpdatePayout,
  mockAdminUpdateUser,
  mockAdminDeleteUser,
  mockAdminUpdateStoreStatus,
  mockAdminUpdateProduct,
  mockAdminDeleteProduct,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockRevokeSession: vi.fn(),
  mockRevokeUserSessions: vi.fn(),
  mockAdminUpdateOrder: vi.fn(),
  mockAdminUpdatePayout: vi.fn(),
  mockAdminUpdateUser: vi.fn(),
  mockAdminDeleteUser: vi.fn(),
  mockAdminUpdateStoreStatus: vi.fn(),
  mockAdminUpdateProduct: vi.fn(),
  mockAdminDeleteProduct: vi.fn(),
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

vi.mock("@mohasinac/appkit", async () => {
  const { z } = await import("zod");
  return {
    requireRoleUser: mockRequireRoleUser,
    rateLimitByIdentifier: mockRateLimitByIdentifier,
    RateLimitPresets: { API: "api", STRICT: "strict" },
    AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
    ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
    revokeSession: mockRevokeSession,
    revokeUserSessions: mockRevokeUserSessions,
    adminUpdateOrder: mockAdminUpdateOrder,
    adminUpdatePayout: mockAdminUpdatePayout,
    adminUpdateUser: mockAdminUpdateUser,
    adminDeleteUser: mockAdminDeleteUser,
    adminUpdateStoreStatus: mockAdminUpdateStoreStatus,
    adminUpdateProduct: mockAdminUpdateProduct,
    adminCreateProduct: vi.fn().mockResolvedValue({ id: "product-new" }),
    adminDeleteProduct: mockAdminDeleteProduct,
    payoutStatusSchema: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED"]),
    userRoleSchema: z.enum(["user", "seller", "moderator", "admin"]),
    storeStatusSchema: z.enum(["pending", "active", "suspended", "rejected"]),
  };
});

vi.mock("@/validation/request-schemas", async () => {
  const { z } = await import("zod");
  return {
    validateRequestBody: (schema: { safeParse: (x: unknown) => { success: boolean; data?: unknown; error?: unknown } }, body: unknown) => {
      const r = schema.safeParse(body);
      return r.success ? { success: true, data: r.data } : { success: false, errors: r.error };
    },
    productCreateSchema: z.object({ title: z.string().min(1), price: z.number().positive() }),
    productUpdateSchema: z.object({ title: z.string().optional(), price: z.number().optional() }),
  };
});

import {
  revokeSessionAction,
  revokeUserSessionsAction,
  adminUpdateOrderAction,
  adminUpdatePayoutAction,
  adminUpdateUserAction,
  adminDeleteUserAction,
  adminUpdateStoreStatusAction,
  adminUpdateProductAction,
  adminDeleteProductAction,
} from "../admin.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

describe("revokeSessionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRevokeSession.mockResolvedValue({ success: true, message: "Session revoked" });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await revokeSessionAction({ sessionId: "session-abc" });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await revokeSessionAction({ sessionId: "session-abc" });
    expect(result.ok).toBe(false);
  });

  it("empty sessionId → { ok: false }", async () => {
    const result = await revokeSessionAction({ sessionId: "" });
    expect(result.ok).toBe(false);
  });

  it("valid → revokeSession called with (adminUid, sessionId)", async () => {
    await revokeSessionAction({ sessionId: "session-abc" });
    expect(mockRevokeSession).toHaveBeenCalledWith("user-admin-1", "session-abc");
  });

  it("returns { ok: true, data: { success, message } }", async () => {
    const result = await revokeSessionAction({ sessionId: "session-abc" });
    expect(result.ok).toBe(true);
  });
});

describe("revokeUserSessionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRevokeUserSessions.mockResolvedValue({ success: true, message: "All sessions revoked", revokedCount: 3 });
  });

  it("empty userId → { ok: false }", async () => {
    const result = await revokeUserSessionsAction({ userId: "" });
    expect(result.ok).toBe(false);
  });

  it("valid → revokeUserSessions called with (adminUid, userId)", async () => {
    await revokeUserSessionsAction({ userId: "user-buyer-1" });
    expect(mockRevokeUserSessions).toHaveBeenCalledWith("user-admin-1", "user-buyer-1");
  });

  it("returns { ok: true, data: { revokedCount } }", async () => {
    const result = await revokeUserSessionsAction({ userId: "user-buyer-1" });
    expect(result.ok).toBe(true);
    expect((result as { data: { revokedCount: number } }).data.revokedCount).toBe(3);
  });
});

describe("adminUpdateOrderAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateOrder.mockResolvedValue({ id: "order-1-20260629-abc123" });
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateOrderAction("order-abc", { status: "SHIPPED" });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await adminUpdateOrderAction("", { status: "SHIPPED" });
    expect(result.ok).toBe(false);
  });

  it("whitespace-only id → { ok: false }", async () => {
    const result = await adminUpdateOrderAction("   ", { status: "SHIPPED" });
    expect(result.ok).toBe(false);
  });

  it("valid → adminUpdateOrder called with (adminUid, id, parsedData)", async () => {
    await adminUpdateOrderAction("order-abc", { status: "SHIPPED", trackingNumber: "TRK123" });
    expect(mockAdminUpdateOrder).toHaveBeenCalledWith(
      "user-admin-1",
      "order-abc",
      expect.objectContaining({ status: "SHIPPED", trackingNumber: "TRK123" }),
    );
  });
});

describe("adminUpdatePayoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdatePayout.mockResolvedValue({ id: "payout-abc" });
  });

  it("role 'moderator' (not admin) → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdatePayoutAction("payout-abc", { status: "PAID" });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await adminUpdatePayoutAction("", { status: "PAID" });
    expect(result.ok).toBe(false);
  });

  it("valid → adminUpdatePayout called with (adminUid, id, parsedData)", async () => {
    await adminUpdatePayoutAction("payout-abc", { status: "PAID" });
    expect(mockAdminUpdatePayout).toHaveBeenCalledWith(
      "user-admin-1",
      "payout-abc",
      expect.objectContaining({ status: "PAID" }),
    );
  });
});

describe("adminUpdateUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateUser.mockResolvedValue({ uid: "user-buyer-1", role: "seller" });
  });

  it("role 'moderator' (not admin) → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateUserAction("user-buyer-1", { role: "seller" });
    expect(result.ok).toBe(false);
  });

  it("empty uid → { ok: false }", async () => {
    const result = await adminUpdateUserAction("", { role: "seller" });
    expect(result.ok).toBe(false);
  });

  it("invalid role value → { ok: false }", async () => {
    const result = await adminUpdateUserAction("user-buyer-1", { role: "superuser" as any });
    expect(result.ok).toBe(false);
  });

  it("valid role change → adminUpdateUser called with (adminUid, uid, parsedData)", async () => {
    await adminUpdateUserAction("user-buyer-1", { role: "seller" });
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "user-admin-1",
      "user-buyer-1",
      expect.objectContaining({ role: "seller" }),
    );
  });

  it("returns { ok: true, data: UserDocument }", async () => {
    const result = await adminUpdateUserAction("user-buyer-1", { role: "seller" });
    expect(result.ok).toBe(true);
  });
});

describe("adminDeleteUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminDeleteUser.mockResolvedValue(undefined);
  });

  it("role 'moderator' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteUserAction("user-buyer-1")).rejects.toThrow();
  });

  it("empty uid → throws", async () => {
    await expect(adminDeleteUserAction("")).rejects.toThrow();
  });

  it("uid === admin.uid (self-delete) → throws ValidationError", async () => {
    await expect(adminDeleteUserAction("user-admin-1")).rejects.toThrow(/own account/i);
  });

  it("valid → adminDeleteUser called with (adminUid, uid)", async () => {
    await adminDeleteUserAction("user-buyer-1");
    expect(mockAdminDeleteUser).toHaveBeenCalledWith("user-admin-1", "user-buyer-1");
  });
});

describe("adminUpdateStoreStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateStoreStatus.mockResolvedValue(undefined);
  });

  it("role 'moderator' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminUpdateStoreStatusAction({ uid: "user-seller-1", action: "approve" })).rejects.toThrow();
  });

  it("invalid action (not approve/reject) → throws ValidationError", async () => {
    await expect(adminUpdateStoreStatusAction({ uid: "user-seller-1", action: "ban" as any })).rejects.toThrow();
  });

  it("valid approve → adminUpdateStoreStatus called with (adminUid, { uid, action: 'approve' })", async () => {
    await adminUpdateStoreStatusAction({ uid: "user-seller-1", action: "approve" });
    expect(mockAdminUpdateStoreStatus).toHaveBeenCalledWith("user-admin-1", { uid: "user-seller-1", action: "approve" });
  });

  it("valid reject → adminUpdateStoreStatus called with action: 'reject'", async () => {
    await adminUpdateStoreStatusAction({ uid: "user-seller-1", action: "reject" });
    expect(mockAdminUpdateStoreStatus).toHaveBeenCalledWith(
      "user-admin-1",
      expect.objectContaining({ action: "reject" }),
    );
  });
});

describe("adminUpdateProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateProduct.mockResolvedValue({ id: "product-charizard-psa9" });
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateProductAction("product-abc", { isFeatured: true });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await adminUpdateProductAction("", { isFeatured: true });
    expect(result.ok).toBe(false);
  });

  it("valid → adminUpdateProduct called with (adminUid, id, parsedData)", async () => {
    await adminUpdateProductAction("product-abc", { isFeatured: true, isPromoted: false });
    expect(mockAdminUpdateProduct).toHaveBeenCalledWith(
      "user-admin-1",
      "product-abc",
      expect.objectContaining({ isFeatured: true }),
    );
  });

  it("returns { ok: true, data: ProductDocument }", async () => {
    const result = await adminUpdateProductAction("product-abc", { status: "published" });
    expect(result.ok).toBe(true);
  });
});

describe("adminDeleteProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminDeleteProduct.mockResolvedValue(undefined);
  });

  it("role 'moderator' → throws (admin only)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteProductAction("product-abc")).rejects.toThrow();
  });

  it("empty id → throws ValidationError", async () => {
    await expect(adminDeleteProductAction("")).rejects.toThrow();
  });

  it("whitespace id → throws ValidationError", async () => {
    await expect(adminDeleteProductAction("   ")).rejects.toThrow();
  });

  it("valid → adminDeleteProduct called with (adminUid, id)", async () => {
    await adminDeleteProductAction("product-abc");
    expect(mockAdminDeleteProduct).toHaveBeenCalledWith("user-admin-1", "product-abc");
  });
});
