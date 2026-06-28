/**
 * Tests for GET /api/user/reviews
 * Auth required. Any authenticated user (buyer).
 * Returns all reviews authored by the authenticated user.
 * total = reviews.length (computed in route, not a separate count query).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindByUser } = vi.hoisted(() => ({
  mockFindByUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  reviewRepository: { findByUser: mockFindByUser },
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

const mockReviews = [
  {
    id: "review-charizard-ravi-20260601",
    productId: "product-charizard-psa9",
    buyerId: "buyer-uid",
    rating: 5,
    title: "Amazing card!",
    body: "Fast delivery and great packaging.",
    publishedAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "review-pikachu-ravi-20260602",
    productId: "product-pikachu-holo",
    buyerId: "buyer-uid",
    rating: 4,
    title: "Good value",
    body: "Slightly bent corner but otherwise perfect.",
    publishedAt: "2026-06-02T10:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindByUser.mockResolvedValue(mockReviews);
});

describe("GET /api/user/reviews", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(401);
  });

  it("calls findByUser with authenticated user's uid", async () => {
    await GET(new Request("http://localhost") as never);
    expect(mockFindByUser).toHaveBeenCalledWith("buyer-uid");
  });

  it("uses uid from auth token (not from query params)", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await GET(new Request("http://localhost") as never);
    expect(mockFindByUser).toHaveBeenCalledWith("specific-uid");
  });

  it("returns { reviews, total } where total = reviews.length", async () => {
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { reviews: unknown[]; total: number } };
    expect(json.data.reviews).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("total is computed from reviews.length (not a separate count query)", async () => {
    // Only one findByUser call expected — no separate count
    await GET(new Request("http://localhost") as never);
    expect(mockFindByUser).toHaveBeenCalledTimes(1);
  });

  it("no reviews → { reviews: [], total: 0 }", async () => {
    mockFindByUser.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost") as never);
    const json = await res.clone().json() as { data: { reviews: unknown[]; total: number } };
    expect(json.data.reviews).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });
});
