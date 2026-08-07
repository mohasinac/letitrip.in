import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockBecomeSeller,
  mockCreateStore,
  mockUpdateStore,
  mockRequestPayout,
  mockBulkSellerOrder,
  mockGetSellerStore,
  mockListSellerOrders,
  mockCustomShipOrder,
  mockUserRepository,
} = vi.hoisted(() => {
  const mockUserRepo = { findById: vi.fn(), update: vi.fn() };
  return {
    mockRequireAuthUser: vi.fn(),
    mockRequireRoleUser: vi.fn(),
    mockRateLimitByIdentifier: vi.fn(),
    mockBecomeSeller: vi.fn(),
    mockCreateStore: vi.fn(),
    mockUpdateStore: vi.fn(),
    mockRequestPayout: vi.fn(),
    mockBulkSellerOrder: vi.fn(),
    mockGetSellerStore: vi.fn(),
    mockListSellerOrders: vi.fn(),
    mockCustomShipOrder: vi.fn(),
    mockUserRepository: mockUserRepo,
  };
});

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  getStoreCapabilities: vi.fn().mockResolvedValue(["host_auctions", "host_preorders"]),
  ActionResult: {},
}));

vi.mock("@mohasinac/appkit", async () => {
  const { z } = await import("zod");
  return {
    requireAuthUser: mockRequireAuthUser,
    requireRoleUser: mockRequireRoleUser,
    rateLimitByIdentifier: mockRateLimitByIdentifier,
    RateLimitPresets: { API: "api", STRICT: "strict" },
    AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
    ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
    isAdminUser: (u: { role?: string }) => u?.role === "admin",
    becomeSeller: mockBecomeSeller,
    createStore: mockCreateStore,
    updateStore: mockUpdateStore,
    updatePayoutSettings: vi.fn().mockResolvedValue({}),
    requestPayout: mockRequestPayout,
    bulkSellerOrder: mockBulkSellerOrder,
    createSellerProduct: vi.fn().mockResolvedValue(undefined),
    getSellerStore: mockGetSellerStore,
    getSellerShipping: vi.fn().mockResolvedValue({}),
    getSellerPayoutSettings: vi.fn().mockResolvedValue({}),
    listSellerOrders: mockListSellerOrders,
    getSellerAnalytics: vi.fn().mockResolvedValue({}),
    listSellerPayouts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    listSellerCoupons: vi.fn().mockResolvedValue([]),
    listSellerMyProducts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    sellerUpdateProduct: vi.fn().mockResolvedValue({ id: "product-abc" }),
    sellerDeleteProduct: vi.fn().mockResolvedValue(undefined),
    customShipOrder: mockCustomShipOrder,
    userRepository: mockUserRepository,
    productRepository: { findById: vi.fn() },
    serverLogger: { info: vi.fn(), error: vi.fn() },
    JsonValue: {},
  };
});

vi.mock("@/validation/request-schemas", async () => {
  const { z } = await import("zod");
  return {
    mediaUrlSchema: z.string(),
    productCreateSchema: z.object({ title: z.string().min(1), price: z.number().positive() }),
    productUpdateSchema: z.object({ title: z.string().optional(), price: z.number().optional() }),
  };
});

import {
  becomeSellerAction,
  createStoreAction,
  updateStoreAction,
  requestPayoutAction,
  bulkSellerOrderAction,
  getSellerStoreAction,
  listSellerOrdersAction,
  shipOrderAction,
} from "../seller.actions";

function makeSeller(overrides: Record<string, unknown> = {}) {
  return { uid: "user-seller-1", email: "seller@test.com", role: "seller", name: "Test Seller", ...overrides };
}

function makeStore(overrides: Record<string, unknown> = {}) {
  return {
    id: "store-pokemon-palace",
    ownerId: "user-seller-1",
    storeName: "Pokemon Palace",
    status: "active",
    ...overrides,
  };
}

describe("becomeSellerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockBecomeSeller.mockResolvedValue({ success: true, storeId: "store-pokemon-palace" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await becomeSellerAction();
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await becomeSellerAction();
    expect(result.ok).toBe(false);
  });

  it("valid → becomeSeller called with uid", async () => {
    await becomeSellerAction();
    expect(mockBecomeSeller).toHaveBeenCalledWith("user-seller-1");
  });

  it("returns { ok: true, data: BecomeSellerResult }", async () => {
    const result = await becomeSellerAction();
    expect(result.ok).toBe(true);
  });
});

describe("createStoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateStore.mockResolvedValue({ store: makeStore() });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createStoreAction({ storeName: "My Store" });
    expect(result.ok).toBe(false);
  });

  it("storeName < 2 chars → { ok: false }", async () => {
    const result = await createStoreAction({ storeName: "A" });
    expect(result.ok).toBe(false);
  });

  it("storeName > 80 chars → { ok: false }", async () => {
    const result = await createStoreAction({ storeName: "A".repeat(81) });
    expect(result.ok).toBe(false);
  });

  it("valid → createStore called with (uid, name, parsedData)", async () => {
    await createStoreAction({ storeName: "Pokemon Palace" });
    expect(mockCreateStore).toHaveBeenCalledWith(
      "user-seller-1",
      "Test Seller",
      expect.objectContaining({ storeName: "Pokemon Palace" }),
    );
  });

  it("returns { ok: true, data: { store } }", async () => {
    const result = await createStoreAction({ storeName: "Pokemon Palace" });
    expect(result.ok).toBe(true);
  });
});

describe("updateStoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateStore.mockResolvedValue({ store: makeStore({ storeName: "Updated Store" }) });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateStoreAction({ storeName: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("valid → updateStore called with (uid, parsedData)", async () => {
    await updateStoreAction({ storeName: "Updated Palace", isVacationMode: false });
    expect(mockUpdateStore).toHaveBeenCalledWith(
      "user-seller-1",
      expect.objectContaining({ storeName: "Updated Palace" }),
    );
  });
});

describe("requestPayoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRequestPayout.mockResolvedValue({ payoutId: "payout-abc" });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await requestPayoutAction({ paymentMethod: "upi", upiId: "test@upi" });
    expect(result.ok).toBe(false);
  });

  it("upi method without upiId → { ok: false }", async () => {
    const result = await requestPayoutAction({ paymentMethod: "upi" });
    expect(result.ok).toBe(false);
  });

  it("bank_transfer without bankAccount → { ok: false }", async () => {
    const result = await requestPayoutAction({ paymentMethod: "bank_transfer" });
    expect(result.ok).toBe(false);
  });

  it("valid upi → requestPayout called with (uid, name, email, parsedData)", async () => {
    await requestPayoutAction({ paymentMethod: "upi", upiId: "seller@upi" });
    expect(mockRequestPayout).toHaveBeenCalledWith(
      "user-seller-1",
      "Test Seller",
      "seller@test.com",
      expect.objectContaining({ paymentMethod: "upi", upiId: "seller@upi" }),
    );
  });
});

describe("bulkSellerOrderAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUserRepository.findById.mockResolvedValue({ uid: "user-seller-1", displayName: "Test Seller" });
    mockBulkSellerOrder.mockResolvedValue({ success: true, results: [] });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await bulkSellerOrderAction(["order-abc"]);
    expect(result.ok).toBe(false);
  });

  it("empty orderIds array → { ok: false }", async () => {
    const result = await bulkSellerOrderAction([]);
    expect(result.ok).toBe(false);
  });

  it("valid → bulkSellerOrder called with (uid, role, name, email, orderIds)", async () => {
    await bulkSellerOrderAction(["order-1", "order-2"]);
    expect(mockBulkSellerOrder).toHaveBeenCalledWith(
      "user-seller-1",
      "seller",
      expect.any(String),
      "seller@test.com",
      ["order-1", "order-2"],
    );
  });
});

describe("getSellerStoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeSeller());
    mockGetSellerStore.mockResolvedValue(makeStore());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getSellerStoreAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getSellerStore called with uid", async () => {
    await getSellerStoreAction();
    expect(mockGetSellerStore).toHaveBeenCalledWith("user-seller-1");
  });
});

describe("listSellerOrdersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeSeller());
    mockListSellerOrders.mockResolvedValue({ items: [], total: 0 });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await listSellerOrdersAction();
    expect(result.ok).toBe(false);
  });

  it("valid → listSellerOrders called with (uid, params)", async () => {
    await listSellerOrdersAction({ page: 1, pageSize: 20 });
    expect(mockListSellerOrders).toHaveBeenCalledWith("user-seller-1", { page: 1, pageSize: 20 });
  });
});

describe("shipOrderAction — custom method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCustomShipOrder.mockResolvedValue({ orderId: "order-abc", method: "custom" });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await shipOrderAction("order-abc", {
      method: "custom",
      shippingCarrier: "FedEx",
      trackingNumber: "TRK123",
      trackingUrl: "https://track.fedex.com/TRK123",
    });
    expect(result.ok).toBe(false);
  });

  it("custom: empty shippingCarrier → { ok: false }", async () => {
    const result = await shipOrderAction("order-abc", {
      method: "custom",
      shippingCarrier: "",
      trackingNumber: "TRK123",
      trackingUrl: "https://track.fedex.com/TRK123",
    });
    expect(result.ok).toBe(false);
  });

  it("custom: invalid trackingUrl (not a URL) → { ok: false }", async () => {
    const result = await shipOrderAction("order-abc", {
      method: "custom",
      shippingCarrier: "FedEx",
      trackingNumber: "TRK123",
      trackingUrl: "not-a-url",
    });
    expect(result.ok).toBe(false);
  });

  it("valid custom → customShipOrder called with (uid, role, orderId, details)", async () => {
    await shipOrderAction("order-abc", {
      method: "custom",
      shippingCarrier: "FedEx",
      trackingNumber: "TRK123",
      trackingUrl: "https://track.fedex.com/TRK123",
    });
    expect(mockCustomShipOrder).toHaveBeenCalledWith(
      "user-seller-1",
      "seller",
      "order-abc",
      expect.objectContaining({ shippingCarrier: "FedEx", trackingNumber: "TRK123" }),
    );
  });

  it("returns { ok: true, data: { orderId, method } }", async () => {
    const result = await shipOrderAction("order-abc", {
      method: "custom",
      shippingCarrier: "FedEx",
      trackingNumber: "TRK123",
      trackingUrl: "https://track.fedex.com/TRK123",
    });
    expect(result.ok).toBe(true);
  });
});
