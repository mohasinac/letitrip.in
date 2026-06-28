/**
 * Tests for GET /api/user/offers
 * Auth required. Any authenticated user (buyer).
 * Returns authenticated buyer's offers via offerRepository.findByBuyer(uid).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindByBuyer } = vi.hoisted(() => ({
  mockFindByBuyer: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  offerRepository: { findByBuyer: mockFindByBuyer },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const mockOffers = [
  { id: "offer-1", productId: "product-charizard", buyerId: "buyer-uid", offerPrice: 45000, status: "pending" },
  { id: "offer-2", productId: "product-pikachu", buyerId: "buyer-uid", offerPrice: 30000, status: "countered" },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindByBuyer.mockResolvedValue({ items: mockOffers, total: 2 });
});

describe("GET /api/user/offers", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(401);
  });

  it("calls findByBuyer with authenticated user's uid", async () => {
    await GET(new Request("http://localhost") as never);
    expect(mockFindByBuyer).toHaveBeenCalledWith("buyer-uid");
  });

  it("uses uid from auth token (not from query params)", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await GET(new Request("http://localhost") as never);
    expect(mockFindByBuyer).toHaveBeenCalledWith("specific-uid");
  });

  it("returns offers in response", async () => {
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("no offers → returns empty result", async () => {
    mockFindByBuyer.mockResolvedValue({ items: [], total: 0 });
    const res = await GET(new Request("http://localhost") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(0);
  });
});
