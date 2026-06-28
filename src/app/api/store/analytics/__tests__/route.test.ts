/**
 * Tests for GET /api/store/analytics
 * Delegates to Firebase Function (storeAnalytics) when available.
 * Falls back to Firestore query (last 30 days, bounded to 50) when function unavailable.
 * Revenue and order count scoped to seller's store.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCallFirebaseFunction,
  mockStoreFindByOwner,
  mockOrderFindBy,
} = vi.hoisted(() => ({
  mockCallFirebaseFunction: vi.fn(),
  mockStoreFindByOwner: vi.fn(),
  mockOrderFindBy: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));
vi.mock("@/lib/firebase-gateway", () => ({ callFirebaseFunction: mockCallFirebaseFunction }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  orderRepository: { findBy: mockOrderFindBy },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  serverLogger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const makeReq = () => new Request("http://localhost/api/store/analytics");

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const functionResult = { summary: { revenue: 500000, orders: 10, aov: 50000 }, revenueByMonth: [], topProducts: [] };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockCallFirebaseFunction.mockResolvedValue(functionResult);
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockOrderFindBy.mockResolvedValue([]);
});

describe("GET /api/store/analytics", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("Firebase Function available → returns function data", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof functionResult };
    expect(json.data.summary.revenue).toBe(500000);
    expect(json.data.summary.orders).toBe(10);
  });

  it("Firebase Function unavailable (throws) → fallback to Firestore", async () => {
    mockCallFirebaseFunction.mockRejectedValue(new Error("Function unavailable"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    // Fallback returns summary shape
    const json = await res.clone().json() as { data: { summary: { revenue: number } } };
    expect(json.data.summary).toBeDefined();
  });

  it("Firebase Function returns null → fallback to Firestore", async () => {
    mockCallFirebaseFunction.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { summary: unknown } };
    expect(json.data.summary).toBeDefined();
  });

  it("fallback: no store → returns zero summary", async () => {
    mockCallFirebaseFunction.mockResolvedValue(null);
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { revenue: number; orders: number } } };
    expect(json.data.summary.revenue).toBe(0);
    expect(json.data.summary.orders).toBe(0);
  });

  it("fallback: revenue sums from orders in last 30 days", async () => {
    mockCallFirebaseFunction.mockResolvedValue(null);
    const recentDate = new Date(Date.now() - 5 * 86400_000).toISOString(); // 5 days ago
    const oldDate = new Date(Date.now() - 60 * 86400_000).toISOString();   // 60 days ago
    mockOrderFindBy.mockResolvedValue([
      { totalAmount: 100000, createdAt: recentDate },
      { totalAmount: 50000, createdAt: oldDate },  // should be excluded
    ]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { revenue: number; orders: number } } };
    expect(json.data.summary.revenue).toBe(100000);
    expect(json.data.summary.orders).toBe(1);
  });

  it("callFirebaseFunction called with seller uid", async () => {
    await GET(makeReq() as never);
    expect(mockCallFirebaseFunction).toHaveBeenCalledWith("storeAnalytics", { uid: "seller-uid" });
  });
});
