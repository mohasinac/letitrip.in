/**
 * Tests for GET / PATCH / DELETE /api/admin/reviews/[id]
 *
 * GET: ROLES_ADMIN_MOD — reviewRepository.findById(id) → 404 if null
 * PATCH: ROLES_ADMIN_MOD — findById check → reviewRepository.update(id, { ...body, updatedAt })
 * DELETE: ROLES_ADMIN_ONLY — findById check → reviewRepository.delete(id)
 *
 * BUSINESS NOTE: Both PATCH and DELETE perform an existence check via findById first.
 * This means findById is called TWICE for PATCH and DELETE.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockReviewFindById,
  mockReviewUpdate,
  mockReviewDelete,
} = vi.hoisted(() => ({
  mockReviewFindById: vi.fn(),
  mockReviewUpdate: vi.fn(),
  mockReviewDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  reviewRepository: {
    findById: mockReviewFindById,
    update: mockReviewUpdate,
    delete: mockReviewDelete,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "review-charizard-psa9-ravi-20260508" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/reviews/review-charizard-psa9-ravi-20260508", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockReview = {
  id: "review-charizard-psa9-ravi-20260508",
  productId: "product-charizard-psa9",
  buyerId: "user-ravi-k",
  rating: 5,
  status: "pending",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockReviewFindById.mockResolvedValue(mockReview);
  mockReviewUpdate.mockResolvedValue({ ...mockReview, status: "approved" });
  mockReviewDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/reviews/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("review not found → 404", async () => {
    mockReviewFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("found review → 200 with review data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockReview };
    expect(json.data.id).toBe("review-charizard-psa9-ravi-20260508");
    expect(json.data.status).toBe("pending");
  });
});

describe("PATCH /api/admin/reviews/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { status: "approved" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest("PATCH", { status: "approved" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("invalid status value → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "published" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("review not found → 404 (existence check before update)", async () => {
    mockReviewFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { status: "approved" }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("valid status=pending → 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "pending" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("valid status=approved → 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "approved" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("valid status=rejected → 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "rejected" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("calls reviewRepository.update with id and body+updatedAt", async () => {
    await PATCH(makeRequest("PATCH", { status: "approved", featured: true }) as never, params as never);
    expect(mockReviewUpdate).toHaveBeenCalledWith(
      "review-charizard-psa9-ravi-20260508",
      expect.objectContaining({ status: "approved", featured: true, updatedAt: expect.any(Date) }),
    );
  });

  it("partial update (only featured, no status) → allowed", async () => {
    const res = await PATCH(makeRequest("PATCH", { featured: true }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("success → 200 with updated review message", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "approved" }) as never, params as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toContain("updated");
  });
});

describe("DELETE /api/admin/reviews/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("review not found → 404 (existence check before delete)", async () => {
    mockReviewFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("calls reviewRepository.delete with id after existence check", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockReviewFindById).toHaveBeenCalledWith("review-charizard-psa9-ravi-20260508");
    expect(mockReviewDelete).toHaveBeenCalledWith("review-charizard-psa9-ravi-20260508");
  });

  it("success → 200 with null data and deleted message", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: null; message: string };
    expect(json.data).toBeNull();
    expect(json.message).toContain("deleted");
  });
});
