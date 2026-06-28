/**
 * Tests for GET/PUT/PATCH/DELETE /api/admin/faqs/[id]
 * GET:          Requires ROLES_ADMIN_MOD + admin:faqs:read. 404 for missing FAQ.
 * PUT/PATCH:    Requires ROLES_ADMIN_MOD + admin:faqs:read (NOTE: BUG — should be :write).
 *               404 guard before update. Partial update allowed.
 * DELETE:       Requires ROLES_ADMIN_ONLY + admin:faqs:delete. 404 guard before delete.
 *
 * BUG: PUT/PATCH handler uses permission: "admin:faqs:read" instead of "admin:faqs:write".
 *      This means any user with :read permission can also update FAQs. Tracked as a known bug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFaqFindById,
  mockFaqUpdate,
  mockFaqDelete,
} = vi.hoisted(() => ({
  mockFaqFindById: vi.fn(),
  mockFaqUpdate: vi.fn(),
  mockFaqDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  faqsRepository: {
    findById: mockFaqFindById,
    update: mockFaqUpdate,
    delete: mockFaqDelete,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
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
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PUT, PATCH, DELETE } from "../route";

const params = { params: { id: "faq-how-to-bid" } };
const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/faqs/faq-how-to-bid", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const mockFaq = {
  id: "faq-how-to-bid",
  question: "How to bid?",
  answer: { text: "Click bid button.", format: "html" },
  category: "Auctions",
  isActive: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFaqFindById.mockResolvedValue(mockFaq);
  mockFaqUpdate.mockResolvedValue({ ...mockFaq, question: "Updated?" });
  mockFaqDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/faqs/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (not in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("FAQ not found → 404", async () => {
    mockFaqFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("FAQ found → 200 with FAQ data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; question: string } };
    expect(json.data.id).toBe("faq-how-to-bid");
    expect(json.data.question).toBe("How to bid?");
  });
});

describe("PUT /api/admin/faqs/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest("PUT", { question: "Updated?" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PUT(makeRequest("PUT", { question: "Updated?" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD for PUT)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest("PUT", { question: "Updated?" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("FAQ not found → 404 before update", async () => {
    mockFaqFindById.mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { question: "Updated?" }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockFaqUpdate).not.toHaveBeenCalled();
  });

  it("updates question field when provided", async () => {
    await PUT(makeRequest("PUT", { question: "How does bidding work?" }) as never, params as never);
    expect(mockFaqUpdate).toHaveBeenCalledWith(
      "faq-how-to-bid",
      expect.objectContaining({ question: "How does bidding work?" }),
    );
  });

  it("partial update: only sends provided fields", async () => {
    await PUT(makeRequest("PUT", { isActive: false }) as never, params as never);
    expect(mockFaqUpdate).toHaveBeenCalledWith(
      "faq-how-to-bid",
      expect.objectContaining({ isActive: false }),
    );
  });

  it("adds updatedAt timestamp to update", async () => {
    await PUT(makeRequest("PUT", { question: "Updated?" }) as never, params as never);
    const updateArg = mockFaqUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg.updatedAt).toBeDefined();
  });
});

describe("PATCH /api/admin/faqs/[id]", () => {
  it("moderator can PATCH (same handler as PUT)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest("PATCH", { isActive: false }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("FAQ not found → 404 before patch", async () => {
    mockFaqFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { isActive: false }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockFaqUpdate).not.toHaveBeenCalled();
  });

  it("success → 200 with updated FAQ", async () => {
    const res = await PATCH(makeRequest("PATCH", { isActive: false }) as never, params as never);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/faqs/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for delete)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("FAQ not found → 404 before delete", async () => {
    mockFaqFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
    expect(mockFaqDelete).not.toHaveBeenCalled();
  });

  it("success → 200, faqsRepository.delete called", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    expect(mockFaqDelete).toHaveBeenCalledWith("faq-how-to-bid");
  });
});
