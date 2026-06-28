/**
 * Tests for GET/POST/DELETE /api/cart
 * GET: Returns cart with itemCount and subtotal. Hydrates missing storeName from store doc.
 * POST: Validates product exists, is published, is not sold, not OOS.
 *       Rejects auction/classified/live listing types (cartEligible=false).
 *       Enforces CART_MAX_ITEMS=50 cap for new product adds.
 *       Quantity > availableQuantity → 400.
 * DELETE: Clears cart.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCartGetOrCreate,
  mockCartAddItem,
  mockCartClearCart,
  mockCartGetItemCount,
  mockCartGetSubtotal,
  mockProductFindById,
  mockStoreFindById,
} = vi.hoisted(() => ({
  mockCartGetOrCreate: vi.fn(),
  mockCartAddItem: vi.fn(),
  mockCartClearCart: vi.fn(),
  mockCartGetItemCount: vi.fn(),
  mockCartGetSubtotal: vi.fn(),
  mockProductFindById: vi.fn(),
  mockStoreFindById: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  cartRepository: {
    getOrCreate: mockCartGetOrCreate,
    addItem: mockCartAddItem,
    clearCart: mockCartClearCart,
    getItemCount: mockCartGetItemCount,
    getSubtotal: mockCartGetSubtotal,
  },
  productRepository: { findById: mockProductFindById },
  storeRepository: { findById: mockStoreFindById },
  normalizeListingType: (p: { listingType?: string }) => p.listingType ?? "standard",
  getListingRule: (type: string) => ({
    cartEligible: !["auction", "classified", "live"].includes(type),
  }),
  ProductStatusValues: { PUBLISHED: "published" },
  CART_MAX_ITEMS: 50,
  ERROR_MESSAGES: {
    CART: {
      PRODUCT_NOT_FOUND: "Product not found",
      OUT_OF_STOCK: "Out of stock",
      INSUFFICIENT_STOCK: "Insufficient stock",
    },
  },
  SUCCESS_MESSAGES: {
    CART: {
      ITEM_ADDED: "Item added to cart",
      CLEARED: "Cart cleared",
    },
  },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400, _extra?: unknown) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST, DELETE } from "../route";

const makeReq = (method = "GET", body?: unknown) =>
  new Request("http://localhost/api/cart", {
    method,
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });

const mockEmptyCart = { items: [], userId: "seller-uid" };
const mockProduct = {
  id: "product-charizard",
  storeId: "store-pokemon-palace",
  title: "Charizard PSA 9",
  status: "published",
  isSold: false,
  availableQuantity: 10,
  listingType: "standard",
  price: 50000,
  currency: "INR",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockCartGetOrCreate.mockResolvedValue(mockEmptyCart);
  mockCartAddItem.mockResolvedValue({ ...mockEmptyCart, items: [{ productId: "product-charizard", quantity: 1 }] });
  mockCartClearCart.mockResolvedValue(mockEmptyCart);
  mockCartGetItemCount.mockReturnValue(0);
  mockCartGetSubtotal.mockReturnValue(0);
  mockProductFindById.mockResolvedValue(mockProduct);
  mockStoreFindById.mockResolvedValue({ id: "store-pokemon-palace", storeName: "Pokemon Palace" });
});

describe("GET /api/cart", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns cart with itemCount and subtotal", async () => {
    mockCartGetItemCount.mockReturnValue(3);
    mockCartGetSubtotal.mockReturnValue(150000);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { itemCount: number; subtotal: number } };
    expect(json.data.itemCount).toBe(3);
    expect(json.data.subtotal).toBe(150000);
  });

  it("hydrates missing storeName from store doc", async () => {
    const cartWithMissingStoreName = {
      items: [{ productId: "product-1", storeId: "store-pokemon-palace", storeName: undefined }],
      userId: "seller-uid",
    };
    mockCartGetOrCreate.mockResolvedValue(cartWithMissingStoreName);
    await GET(makeReq() as never);
    expect(mockStoreFindById).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("skips storeName hydration when already present", async () => {
    const cartWithStoreName = {
      items: [{ productId: "product-1", storeId: "store-pokemon-palace", storeName: "Pokemon Palace" }],
      userId: "seller-uid",
    };
    mockCartGetOrCreate.mockResolvedValue(cartWithStoreName);
    await GET(makeReq() as never);
    expect(mockStoreFindById).not.toHaveBeenCalled();
  });
});

describe("POST /api/cart (add item)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq("POST", { productId: "product-1", quantity: 1 }) as never);
    expect(res.status).toBe(401);
  });

  it("missing productId → 400", async () => {
    const res = await POST(makeReq("POST", { quantity: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("quantity < 1 → 400", async () => {
    const res = await POST(makeReq("POST", { productId: "product-1", quantity: 0 }) as never);
    expect(res.status).toBe(400);
  });

  it("product not found → 404", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await POST(makeReq("POST", { productId: "product-missing", quantity: 1 }) as never);
    expect(res.status).toBe(404);
  });

  it("product not published → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, status: "draft" });
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("product isSold → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, isSold: true });
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("product availableQuantity = 0 → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, availableQuantity: 0 });
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("auction product → 400 (not cart eligible)", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, listingType: "auction" });
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/bid on the auction/i);
  });

  it("classified product → 400 with contact seller hint", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, listingType: "classified" });
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/Contact Seller/i);
  });

  it("quantity > availableQuantity → 400", async () => {
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 20 }) as never);
    expect(res.status).toBe(400);
  });

  it("cart at CART_MAX_ITEMS (50) for new product → 409", async () => {
    const fullCart = { items: Array(50).fill({ productId: "other-product", quantity: 1 }), userId: "seller-uid" };
    mockCartGetOrCreate.mockResolvedValue(fullCart);
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/Cart full/i);
  });

  it("product already in cart → quantity bump allowed even at cap", async () => {
    const cartAtCap = {
      items: [
        { productId: "product-charizard", quantity: 1 },
        ...Array(49).fill({ productId: "other-product", quantity: 1 }),
      ],
      userId: "seller-uid",
    };
    mockCartGetOrCreate.mockResolvedValue(cartAtCap);
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    // Already in cart → quantity bump → not blocked by cap
    expect(res.status).toBe(201);
  });

  it("success → 201 with cart data", async () => {
    const res = await POST(makeReq("POST", { productId: "product-charizard", quantity: 1 }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { cart: unknown } };
    expect(json.data.cart).toBeDefined();
  });

  it("cartRepository.addItem called with product details", async () => {
    await POST(makeReq("POST", { productId: "product-charizard", quantity: 2 }) as never);
    expect(mockCartAddItem).toHaveBeenCalledWith("seller-uid", expect.objectContaining({
      productId: "product-charizard",
      price: 50000,
      quantity: 2,
    }));
  });
});

describe("DELETE /api/cart (clear cart)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq("DELETE") as never);
    expect(res.status).toBe(401);
  });

  it("calls clearCart and returns empty cart", async () => {
    const res = await DELETE(makeReq("DELETE") as never);
    expect(mockCartClearCart).toHaveBeenCalledWith("seller-uid");
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { itemCount: number; subtotal: number } };
    expect(json.data.itemCount).toBe(0);
    expect(json.data.subtotal).toBe(0);
  });
});
