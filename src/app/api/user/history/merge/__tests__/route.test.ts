/**
 * Tests for POST /api/user/history/merge
 * Auth required. Any authenticated user.
 * Called on login to merge guest localStorage history into Firestore.
 *
 * Schema: { items: Array<{ productId, productType, viewedAt?, productSnapshot? }>.max(HISTORY_MAX * 4) }
 * - productType must be "product" | "auction" | "preorder"
 * - items array capped at HISTORY_MAX * 4 (too many → 400)
 *
 * Maps items: productSnapshot → snapshot (key rename before calling mergeGuestHistory).
 * Returns: { count, attempted: items.length, limit: HISTORY_MAX }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockMergeGuestHistory, HISTORY_MAX } = vi.hoisted(() => ({
  mockMergeGuestHistory: vi.fn(),
  HISTORY_MAX: 50,
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  mergeGuestHistory: mockMergeGuestHistory,
  HISTORY_MAX,
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: {
      safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } };
    };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { POST } from "../route";

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/user/history/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const sampleItem = {
  productId: "product-charizard",
  productType: "product" as const,
  viewedAt: "2026-06-01T10:00:00Z",
  productSnapshot: { title: "Charizard PSA-9", price: 50000, storeId: "store-1" },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockMergeGuestHistory.mockResolvedValue({ count: 1 });
});

describe("POST /api/user/history/merge", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ items: [sampleItem] }) as never);
    expect(res.status).toBe(401);
  });

  it("missing items field → 400", async () => {
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
    expect(mockMergeGuestHistory).not.toHaveBeenCalled();
  });

  it("invalid productType → 400", async () => {
    const res = await POST(
      makeRequest({ items: [{ ...sampleItem, productType: "bundle" }] }) as never,
    );
    expect(res.status).toBe(400);
  });

  it("items array exceeds HISTORY_MAX * 4 → 400", async () => {
    const tooManyItems = Array.from({ length: HISTORY_MAX * 4 + 1 }, (_, i) => ({
      productId: `product-${i}`,
      productType: "product" as const,
    }));
    const res = await POST(makeRequest({ items: tooManyItems }) as never);
    expect(res.status).toBe(400);
    expect(mockMergeGuestHistory).not.toHaveBeenCalled();
  });

  it("items array at exactly HISTORY_MAX * 4 → allowed", async () => {
    const maxItems = Array.from({ length: HISTORY_MAX * 4 }, (_, i) => ({
      productId: `product-${i}`,
      productType: "product" as const,
    }));
    mockMergeGuestHistory.mockResolvedValue({ count: HISTORY_MAX });
    const res = await POST(makeRequest({ items: maxItems }) as never);
    expect(res.status).toBe(200);
  });

  it("renames productSnapshot → snapshot when calling mergeGuestHistory", async () => {
    await POST(makeRequest({ items: [sampleItem] }) as never);
    expect(mockMergeGuestHistory).toHaveBeenCalledWith(
      "buyer-uid",
      expect.arrayContaining([
        expect.objectContaining({
          productId: "product-charizard",
          snapshot: expect.objectContaining({ title: "Charizard PSA-9" }),
        }),
      ]),
    );
  });

  it("does NOT pass productSnapshot key to mergeGuestHistory (must be snapshot)", async () => {
    await POST(makeRequest({ items: [sampleItem] }) as never);
    const mergedItems = mockMergeGuestHistory.mock.calls[0][1] as unknown[];
    expect((mergedItems[0] as Record<string, unknown>).productSnapshot).toBeUndefined();
    expect((mergedItems[0] as Record<string, unknown>).snapshot).toBeDefined();
  });

  it("calls mergeGuestHistory with the authenticated user's uid", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await POST(makeRequest({ items: [sampleItem] }) as never);
    expect(mockMergeGuestHistory).toHaveBeenCalledWith("specific-uid", expect.any(Array));
  });

  it("returns { count, attempted, limit: HISTORY_MAX }", async () => {
    mockMergeGuestHistory.mockResolvedValue({ count: 1 });
    const res = await POST(
      makeRequest({ items: [sampleItem] }) as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { count: number; attempted: number; limit: number };
    };
    expect(json.data.count).toBe(1);
    expect(json.data.attempted).toBe(1);
    expect(json.data.limit).toBe(HISTORY_MAX);
  });

  it("attempted = items.length sent (not count from mergeGuestHistory)", async () => {
    const twoItems = [sampleItem, { ...sampleItem, productId: "product-pikachu" }];
    // mergeGuestHistory dedupes, count may differ from attempted
    mockMergeGuestHistory.mockResolvedValue({ count: 1 });
    const res = await POST(makeRequest({ items: twoItems }) as never);
    const json = await res.clone().json() as { data: { count: number; attempted: number } };
    expect(json.data.attempted).toBe(2);
    expect(json.data.count).toBe(1);
  });

  it("items with no productSnapshot → snapshot: undefined passed to mergeGuestHistory", async () => {
    const itemWithoutSnapshot = { productId: "product-x", productType: "auction" as const };
    await POST(makeRequest({ items: [itemWithoutSnapshot] }) as never);
    const mergedItems = mockMergeGuestHistory.mock.calls[0][1] as { snapshot: unknown }[];
    expect(mergedItems[0].snapshot).toBeUndefined();
  });

  it("empty items array → calls mergeGuestHistory with empty array", async () => {
    mockMergeGuestHistory.mockResolvedValue({ count: 0 });
    const res = await POST(makeRequest({ items: [] }) as never);
    expect(res.status).toBe(200);
    expect(mockMergeGuestHistory).toHaveBeenCalledWith("buyer-uid", []);
    const json = await res.clone().json() as { data: { count: number; attempted: number } };
    expect(json.data.count).toBe(0);
    expect(json.data.attempted).toBe(0);
  });
});
