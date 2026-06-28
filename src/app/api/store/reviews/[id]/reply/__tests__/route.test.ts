/**
 * Tests for POST /api/store/reviews/[id]/reply
 * Seller can add/update a reply on a review for their store.
 * Review must belong to seller's store → AuthorizationError if not.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockReviewFindById,
  mockStoreFindByOwner,
  mockReviewUpdate,
} = vi.hoisted(() => ({
  mockReviewFindById: vi.fn(),
  mockStoreFindByOwner: vi.fn(),
  mockReviewUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  reviewRepository: { findById: mockReviewFindById, update: mockReviewUpdate },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  AuthorizationError: class AuthorizationError extends Error {
    constructor(msg: string) { super(msg); this.name = "AuthorizationError"; }
  },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      try {
        return await opts.handler({ user: _user ?? undefined, body, params: context?.params });
      } catch (e: unknown) {
        const name = (e as Error)?.name;
        if (name === "AuthorizationError") return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), { status: 403 });
        return new Response(JSON.stringify({ ok: false }), { status: 500 });
      }
    };
  },
}));

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/store/reviews/review-123/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const mockReview = { id: "review-123", storeId: "store-pokemon-palace", rating: 5, body: "Great!" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockReviewFindById.mockResolvedValue(mockReview);
  mockReviewUpdate.mockResolvedValue(undefined);
});

describe("POST /api/store/reviews/[id]/reply", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ reply: "Thank you!" }) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeReq({ reply: "Thank you!" }) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(403);
  });

  it("missing reply → 400", async () => {
    const res = await POST(makeReq({}) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(400);
  });

  it("review not found → 404", async () => {
    mockReviewFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ reply: "Thanks" }) as never, { params: { id: "nonexistent" } });
    expect(res.status).toBe(404);
  });

  it("review belongs to different store → 403 (AuthorizationError)", async () => {
    mockReviewFindById.mockResolvedValue({ ...mockReview, storeId: "store-OTHER" });
    const res = await POST(makeReq({ reply: "Thanks" }) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(403);
  });

  it("seller has no store → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await POST(makeReq({ reply: "Thanks" }) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(403);
  });

  it("stores sellerReply and sellerRepliedAt on review", async () => {
    const before = new Date();
    await POST(makeReq({ reply: "Thank you for your feedback!" }) as never, { params: { id: "review-123" } });
    const updateArg = mockReviewUpdate.mock.calls[0][1] as { sellerReply: string; sellerRepliedAt: Date };
    expect(updateArg.sellerReply).toBe("Thank you for your feedback!");
    expect(updateArg.sellerRepliedAt).toBeInstanceOf(Date);
    expect(updateArg.sellerRepliedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("success → 200", async () => {
    const res = await POST(makeReq({ reply: "Thanks!" }) as never, { params: { id: "review-123" } });
    expect(res.status).toBe(200);
  });
});
