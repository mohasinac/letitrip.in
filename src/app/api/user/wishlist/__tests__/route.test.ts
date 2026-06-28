import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mock strategy for route tests:
 * - withProviders: passthrough (no DI init needed in tests)
 * - createRouteHandler: extracts the handler fn and calls it with a controlled
 *   user + parsed body. Auth gate is enforced by setting _user = null.
 */

let _user: { uid: string; role: string; email: string } | null = null;

vi.mock("@/providers.config", () => ({
  withProviders: (fn: unknown) => fn,
}));

vi.mock("@mohasinac/appkit", () => {
  const successResponse = (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status });
  const errorResponse = (error: string, status = 400, extra?: unknown) =>
    new Response(JSON.stringify({ ok: false, error, ...((extra as object) ?? {}) }), { status });

  return {
    normalizeError: vi.fn(),
    WISHLIST_MAX: 20,
    WishlistFullError: class WishlistFullError extends Error {
      current: number;
      limit: number;
      constructor(current: number, limit: number) {
        super("Wishlist full");
        this.current = current;
        this.limit = limit;
      }
    },
    wishlistRepository: {
      getWishlistItems: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
    },
    productRepository: {
      findById: vi.fn(),
    },
    normalizeListingType: vi.fn((p: { listingType?: string }) => p?.listingType ?? "standard"),
    successResponse,
    errorResponse,
    ERROR_MESSAGES: { PRODUCT: { NOT_FOUND: "Product not found" } },
    SUCCESS_MESSAGES: { WISHLIST: { ADDED: "Added to wishlist", REMOVED: "Removed from wishlist" } },
    createRouteHandler: (opts: {
      auth?: boolean;
      schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
      handler: (ctx: { user?: unknown; body?: unknown; request: Request; params: Record<string, string> }) => Promise<Response>;
    }) => {
      return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
        if (opts.auth && !_user) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
        }
        let body: unknown;
        if (request.method !== "GET") {
          try { body = await request.clone().json(); } catch { body = undefined; }
          if (opts.schema && body !== undefined) {
            const result = opts.schema.safeParse(body);
            if (!result.success) {
              return new Response(JSON.stringify({ ok: false, error: "Validation failed" }), { status: 400 });
            }
            body = result.data;
          } else if (opts.schema && body === undefined) {
            return new Response(JSON.stringify({ ok: false, error: "Validation failed" }), { status: 400 });
          }
        }
        return opts.handler({ user: _user ?? undefined, body, request, params: params ?? {} });
      };
    },
  };
});

import { GET, POST } from "../route";
import { wishlistRepository, productRepository, WishlistFullError } from "@mohasinac/appkit";

const mockGetWishlistItems = wishlistRepository.getWishlistItems as ReturnType<typeof vi.fn>;
const mockAddItem = wishlistRepository.addItem as ReturnType<typeof vi.fn>;
const mockFindProduct = productRepository.findById as ReturnType<typeof vi.fn>;

function makeReq(body?: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/user/wishlist", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "test-uid", role: "user", email: "test@test.com" };
  mockGetWishlistItems.mockResolvedValue([]);
  mockFindProduct.mockResolvedValue({
    id: "product-x",
    title: "Test Product",
    images: ["img.jpg"],
    price: 1000,
    listingType: "standard",
  });
  mockAddItem.mockResolvedValue(1);
});

describe("GET /api/user/wishlist", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq(undefined, "GET") as never);
    expect(res.status).toBe(401);
  });

  it("BUG-1 fix: 20 stored items (3 deleted products) → meta.total=20, meta.isFull=true", async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ productId: `product-${i}` }));
    mockGetWishlistItems.mockResolvedValue(items);
    // 3 items have null products
    mockFindProduct.mockImplementation(async (id: string) => {
      const idx = parseInt(id.split("-")[1]);
      if (idx < 3) return null;
      return { id, title: "Product", images: [], price: 1000, listingType: "standard" };
    });
    const res = await GET(makeReq(undefined, "GET") as never);
    const json = await res.clone().json() as { data: { meta: { total: number; isFull: boolean } } };
    expect(json.data.meta.total).toBe(20);
    expect(json.data.meta.isFull).toBe(true);
  });

  it("17 stored items → meta.total=17, meta.isFull=false", async () => {
    mockGetWishlistItems.mockResolvedValue(Array.from({ length: 17 }, (_, i) => ({ productId: `p-${i}` })));
    const res = await GET(makeReq(undefined, "GET") as never);
    const json = await res.clone().json() as { data: { meta: { total: number; isFull: boolean } } };
    expect(json.data.meta.total).toBe(17);
    expect(json.data.meta.isFull).toBe(false);
  });

  it("20 stored items (all exist) → meta.isFull=true", async () => {
    mockGetWishlistItems.mockResolvedValue(Array.from({ length: 20 }, (_, i) => ({ productId: `p-${i}` })));
    const res = await GET(makeReq(undefined, "GET") as never);
    const json = await res.clone().json() as { data: { meta: { isFull: boolean } } };
    expect(json.data.meta.isFull).toBe(true);
  });

  it("0 items → meta.total=0, meta.isFull=false", async () => {
    const res = await GET(makeReq(undefined, "GET") as never);
    const json = await res.clone().json() as { data: { meta: { total: number; isFull: boolean } } };
    expect(json.data.meta.total).toBe(0);
    expect(json.data.meta.isFull).toBe(false);
  });

  it("deleted products filtered from items[] but NOT from total/isFull count", async () => {
    const items = [
      { productId: "product-deleted" },
      { productId: "product-live" },
    ];
    mockGetWishlistItems.mockResolvedValue(items);
    mockFindProduct.mockImplementation(async (id: string) =>
      id === "product-deleted" ? null : { id, title: "Live", images: [], price: 1000, listingType: "standard" }
    );
    const res = await GET(makeReq(undefined, "GET") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; meta: { total: number } } };
    expect(json.data.items).toHaveLength(1); // only live item in items[]
    expect(json.data.meta.total).toBe(2);    // raw count unchanged
  });
});

describe("POST /api/user/wishlist", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ productId: "product-x" }) as never);
    expect(res.status).toBe(401);
  });

  it("missing productId → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("product not found → 404", async () => {
    mockFindProduct.mockResolvedValue(null);
    const res = await POST(makeReq({ productId: "nonexistent" }) as never);
    expect(res.status).toBe(404);
  });

  it("auction product → snapshot productType: auction", async () => {
    mockFindProduct.mockResolvedValue({
      id: "auction-test",
      title: "Test Auction",
      images: [],
      price: 5000,
      listingType: "auction",
    });
    const { normalizeListingType } = await import("@mohasinac/appkit");
    (normalizeListingType as ReturnType<typeof vi.fn>).mockReturnValue("auction");
    await POST(makeReq({ productId: "auction-test" }) as never);
    expect(mockAddItem).toHaveBeenCalledWith(
      "test-uid",
      "auction-test",
      expect.objectContaining({ productType: "auction" }),
    );
  });

  it("WishlistFullError → 409 with code WISHLIST_FULL", async () => {
    const WFE = (await import("@mohasinac/appkit")).WishlistFullError as new (c: number, l: number) => Error & { current: number; limit: number };
    mockAddItem.mockRejectedValue(new WFE(20, 20));
    const res = await POST(makeReq({ productId: "product-x" }) as never);
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { code?: string };
    expect(json.code).toBe("WISHLIST_FULL");
  });

  it("success → 201 with count, limit, isFull", async () => {
    mockAddItem.mockResolvedValue(5);
    const res = await POST(makeReq({ productId: "product-x" }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { count: number; limit: number; isFull: boolean } };
    expect(json.data.count).toBe(5);
    expect(json.data.limit).toBe(20);
    expect(json.data.isFull).toBe(false);
  });
});
