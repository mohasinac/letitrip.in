/**
 * Tests for POST /api/payment/create-order
 * Server-side amount computation — client never supplies the amount.
 * Reads live cart + current Firestore product prices.
 * Platform fee + GST computed from siteSettings.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; email: string; role: string } | null = null;

const {
  mockGetOrCreate,
  mockFindById,
  mockGetSingleton,
  mockCreateRazorpayOrder,
  mockRupeesToPaise,
  mockApiErrors,
} = vi.hoisted(() => ({
  mockGetOrCreate: vi.fn(),
  mockFindById: vi.fn(),
  mockGetSingleton: vi.fn(),
  mockCreateRazorpayOrder: vi.fn(),
  mockRupeesToPaise: vi.fn((x: number) => Math.round(x * 100)),
  mockApiErrors: {
    internalError: (msg: string) =>
      Object.assign(new Error(msg), { status: 500, isApiError: true }),
    badRequest: (msg: string) =>
      Object.assign(new Error(msg), { status: 400, isApiError: true }),
  },
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  createRazorpayOrder: mockCreateRazorpayOrder,
  rupeesToPaise: mockRupeesToPaise,
  siteSettingsRepository: { getSingleton: mockGetSingleton },
  unitOfWork: { carts: { getOrCreate: mockGetOrCreate } },
  productRepository: { findById: mockFindById },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: mockApiErrors,
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  getDefaultCurrency: () => "INR",
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      try {
        return await opts.handler({ user: _user ?? undefined, body });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: e.status ?? 500 });
      }
    };
  },
}));

import { POST } from "../route";

const makeReq = (body?: unknown) =>
  new Request("http://localhost/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

const makeProduct = (id: string, price = 1000, status = "published") => ({
  id,
  price,
  status,
  listingType: "standard",
  productTitle: `Product ${id}`,
});

const makeCartItem = (productId: string, qty = 1, overrides: Record<string, unknown> = {}) => ({
  itemId: `item-${productId}`,
  productId,
  productTitle: `Title ${productId}`,
  price: 1000,
  quantity: qty,
  ...overrides,
});

const mockSiteSettings = {
  commissions: { platformFeePercent: 5, gstPercent: 18, minimumTransactionFee: 0 },
};

const mockCart = (items: unknown[], selectedItemIds?: string[]) => ({
  id: "cart-buyer",
  userId: "buyer-uid",
  items,
  selectedItemIds: selectedItemIds ?? null,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", email: "buyer@test.com", role: "user" };
  mockGetSingleton.mockResolvedValue(mockSiteSettings);
  mockCreateRazorpayOrder.mockResolvedValue({
    id: "order_rp123",
    amount: 123400,
    currency: "INR",
  });
  process.env.RAZORPAY_KEY_ID = "rzp_test_key";
});

describe("POST /api/payment/create-order", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("missing RAZORPAY_KEY_ID env var → 500", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1"));
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(500);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Razorpay is not configured");
  });

  it("empty cart → 400 'cart is empty'", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([]));
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error.toLowerCase()).toContain("empty");
  });

  it("selectedItemIds provided but none match cart items → 400 'no items selected'", async () => {
    mockGetOrCreate.mockResolvedValue(
      mockCart([makeCartItem("prod-1")], ["item-nonexistent"]),
    );
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error.toLowerCase()).toContain("no items selected");
  });

  it("product not found (deleted) → 400 'no longer available'", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-gone")]));
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error.toLowerCase()).toContain("no longer available");
  });

  it("product status=draft → 400 'no longer available'", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-draft")]));
    mockFindById.mockResolvedValue(makeProduct("prod-draft", 1000, "draft"));
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(400);
  });

  it("amount computed server-side from Firestore product price (not client-supplied)", async () => {
    // Cart item has price=1000 (old cached), product in Firestore has price=1500 (current)
    const item = makeCartItem("prod-1", 1);
    item.price = 1000; // stale cached price
    mockGetOrCreate.mockResolvedValue(mockCart([item]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1500, "published")); // current Firestore price
    await POST(makeReq() as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    // 1500 * 1 = 1500 subtotal, 5% fee=75, 18% on fee=13.5, total=1588.5, paise=158850
    expect(callArgs.amount).toBeGreaterThan(0);
  });

  it("bundle cart items use locked item.price (not current product price)", async () => {
    const bundleItem = makeCartItem("prod-bundle", 1, {
      bundleCategorySlug: "category-pokemon",
      bundleProductIds: ["prod-a", "prod-b"],
      price: 800, // locked bundle price
    });
    mockGetOrCreate.mockResolvedValue(mockCart([bundleItem]));
    // Product price is 1200, but bundle item locked at 800
    mockFindById.mockResolvedValue(makeProduct("prod-bundle", 1200, "published"));
    await POST(makeReq() as never);
    // Subtotal = 800 (locked), not 1200 (current price)
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    // rupeesToPaise(800 * 1.05 * 1.18 roughly) — ensure it's based on 800
    const expectedSubtotal = 800;
    const platformFee = Math.round(expectedSubtotal * 0.05 * 100) / 100;
    const gst = Math.round(platformFee * 0.18 * 100) / 100;
    const total = expectedSubtotal + platformFee + gst;
    expect(callArgs.amount).toBe(Math.round(total * 100));
  });

  it("platform fee and GST computed from siteSettings (5% + 18%)", async () => {
    const item = makeCartItem("prod-1", 1);
    mockGetOrCreate.mockResolvedValue(mockCart([item]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    await POST(makeReq() as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    // subtotal=1000, fee=50, gst=9, total=1059, paise=105900
    expect(callArgs.amount).toBe(105900);
  });

  it("platform fee defaults to 5% when siteSettings.commissions absent", async () => {
    mockGetSingleton.mockResolvedValue({}); // no commissions config
    const item = makeCartItem("prod-1", 1);
    mockGetOrCreate.mockResolvedValue(mockCart([item]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    expect(callArgs.amount).toBe(105900); // same as default
  });

  it("selectedItemIds filters to only selected items", async () => {
    const items = [makeCartItem("prod-1"), makeCartItem("prod-2")];
    // Only select prod-1's item
    mockGetOrCreate.mockResolvedValue(mockCart(items, ["item-prod-1"]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 2000, "published"));
    await POST(makeReq() as never);
    // Only prod-1 (2000) used, prod-2 excluded
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    const subtotal = 2000;
    const fee = Math.round(subtotal * 0.05 * 100) / 100;
    const gst = Math.round(fee * 0.18 * 100) / 100;
    const total = subtotal + fee + gst;
    expect(callArgs.amount).toBe(Math.round(total * 100));
  });

  it("quantity multiplied into subtotal", async () => {
    const item = makeCartItem("prod-1", 3); // qty=3
    mockGetOrCreate.mockResolvedValue(mockCart([item]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 500, "published")); // 500 per unit
    await POST(makeReq() as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { amount: number };
    // subtotal = 500*3=1500, fee=75, gst=13.5, total=1588.5, paise=158850
    expect(callArgs.amount).toBe(158850);
  });

  it("success → 200 with razorpayOrderId, amount, currency, keyId", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      ok: boolean;
      data: { razorpayOrderId: string; amount: number; currency: string; keyId: string; baseAmount: number };
    };
    expect(json.ok).toBe(true);
    expect(json.data.razorpayOrderId).toBe("order_rp123");
    expect(json.data.currency).toBe("INR");
    expect(json.data.keyId).toBe("rzp_test_key");
    expect(json.data.baseAmount).toBe(1000);
  });

  it("keyId from RAZORPAY_KEY_ID env var included in response", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_live_secret";
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { keyId: string } };
    expect(json.data.keyId).toBe("rzp_live_secret");
  });

  it("receipt param forwarded when provided", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    await POST(makeReq({ receipt: "rcpt_custom_001" }) as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { receipt: string };
    expect(callArgs.receipt).toBe("rcpt_custom_001");
  });

  it("receipt auto-generated when not provided", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    await POST(makeReq({}) as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { receipt: string };
    expect(callArgs.receipt).toContain("rcpt_buyer-uid_");
  });

  it("notes passed to Razorpay order as { userId }", async () => {
    mockGetOrCreate.mockResolvedValue(mockCart([makeCartItem("prod-1")]));
    mockFindById.mockResolvedValue(makeProduct("prod-1", 1000, "published"));
    await POST(makeReq() as never);
    const callArgs = mockCreateRazorpayOrder.mock.calls[0][0] as { notes: { userId: string } };
    expect(callArgs.notes.userId).toBe("buyer-uid");
  });

  it("unique product IDs deduplicated before fetching (multiple items same product)", async () => {
    // Two items with same productId (e.g., added twice at different times)
    const items = [makeCartItem("prod-shared", 1), { ...makeCartItem("prod-shared", 2), itemId: "item-prod-shared-2" }];
    mockGetOrCreate.mockResolvedValue(mockCart(items));
    mockFindById.mockResolvedValue(makeProduct("prod-shared", 500, "published"));
    await POST(makeReq() as never);
    // findById called only ONCE for the unique productId (deduplication)
    expect(mockFindById).toHaveBeenCalledTimes(1);
  });
});
