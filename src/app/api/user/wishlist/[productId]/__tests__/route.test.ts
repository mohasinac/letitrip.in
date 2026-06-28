/**
 * Tests for DELETE /api/user/wishlist/[productId]
 * Auth required. Any authenticated user.
 * Calls removeFromWishlist(uid, productId).
 * No 404 guard — removeFromWishlist is idempotent (removing a non-existent item is a no-op).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockRemoveFromWishlist } = vi.hoisted(() => ({
  mockRemoveFromWishlist: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  removeFromWishlist: mockRemoveFromWishlist,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { DELETE } from "../route";

const params = { params: { productId: "product-hot-wheels-redline" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockRemoveFromWishlist.mockResolvedValue(undefined);
});

describe("DELETE /api/user/wishlist/[productId]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("calls removeFromWishlist with user uid and productId from params", async () => {
    await DELETE(new Request("http://localhost") as never, params as never);
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith(
      "buyer-uid",
      "product-hot-wheels-redline",
    );
  });

  it("uses uid from auth token (not body or query)", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await DELETE(new Request("http://localhost") as never, params as never);
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith("specific-uid", expect.any(String));
  });

  it("success → 200", async () => {
    const res = await DELETE(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("non-existent productId → still calls removeFromWishlist (idempotent), 200", async () => {
    // removeFromWishlist is a no-op for missing productIds — no 404 guard in the route
    const missingParams = { params: { productId: "product-does-not-exist" } };
    const res = await DELETE(new Request("http://localhost") as never, missingParams as never);
    expect(res.status).toBe(200);
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith("buyer-uid", "product-does-not-exist");
  });

  it("seller can also delete from their wishlist", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await DELETE(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
  });
});
