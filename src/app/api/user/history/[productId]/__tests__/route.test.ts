/**
 * Tests for DELETE /api/user/history/[productId]
 * Auth required. Any authenticated user.
 * Calls removeHistoryItem(uid, productId).
 * Returns { productId, removed: true } on success.
 * No 404 guard — idempotent (no-op if item not in history).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockRemoveHistoryItem } = vi.hoisted(() => ({
  mockRemoveHistoryItem: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  removeHistoryItem: mockRemoveHistoryItem,
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

const params = { params: { productId: "product-charizard-psa9" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockRemoveHistoryItem.mockResolvedValue(undefined);
});

describe("DELETE /api/user/history/[productId]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("calls removeHistoryItem with user uid and productId from params", async () => {
    await DELETE(new Request("http://localhost") as never, params as never);
    expect(mockRemoveHistoryItem).toHaveBeenCalledWith("buyer-uid", "product-charizard-psa9");
  });

  it("uses uid from auth token", async () => {
    _user = { uid: "other-uid", role: "user" };
    await DELETE(new Request("http://localhost") as never, params as never);
    expect(mockRemoveHistoryItem).toHaveBeenCalledWith("other-uid", expect.any(String));
  });

  it("returns { productId, removed: true } on success", async () => {
    const res = await DELETE(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { productId: string; removed: boolean } };
    expect(json.data.productId).toBe("product-charizard-psa9");
    expect(json.data.removed).toBe(true);
  });

  it("productId in response matches the param (not uid or any other field)", async () => {
    const auctionParams = { params: { productId: "auction-pikachu-trophy" } };
    const res = await DELETE(new Request("http://localhost") as never, auctionParams as never);
    const json = await res.clone().json() as { data: { productId: string } };
    expect(json.data.productId).toBe("auction-pikachu-trophy");
  });

  it("non-existent productId → still 200 (idempotent, no 404 guard)", async () => {
    const res = await DELETE(
      new Request("http://localhost") as never,
      { params: { productId: "product-not-in-history" } } as never,
    );
    expect(res.status).toBe(200);
    expect(mockRemoveHistoryItem).toHaveBeenCalledWith("buyer-uid", "product-not-in-history");
  });
});
