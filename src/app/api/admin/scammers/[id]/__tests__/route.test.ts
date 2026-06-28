/**
 * Tests for GET/PATCH/DELETE /api/admin/scammers/[id]
 * PATCH: sets verifiedBy/verifiedAt when status→verified or rejected.
 * DELETE: admin-only hard delete.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_TRUST_SAFETY: ["admin", "employee"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  scammerRepository: { findById: mockFindById, update: mockUpdate, delete: mockDelete },
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
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params: context?.params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const makeReq = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/scammers/scammer-123", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockScammer = {
  id: "scammer-123",
  displayNames: ["Fake Guy"],
  status: "pending_review",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockScammer);
  mockUpdate.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/scammers/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("GET") as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(401);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(makeReq("GET") as never, { params: { id: "scammer-nonexistent" } });
    expect(res.status).toBe(404);
  });

  it("found → 200 with scammer data", async () => {
    const res = await GET(makeReq("GET") as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockScammer };
    expect(json.data.id).toBe("scammer-123");
  });
});

describe("PATCH /api/admin/scammers/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeReq("PATCH", { status: "verified" }) as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(401);
  });

  it("invalid status value → 400", async () => {
    const res = await PATCH(makeReq("PATCH", { status: "fake-status" }) as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(400);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeReq("PATCH", { status: "verified" }) as never, { params: { id: "scammer-x" } });
    expect(res.status).toBe(404);
  });

  it("status=verified → sets verifiedBy and verifiedAt", async () => {
    await PATCH(makeReq("PATCH", { status: "verified" }) as never, { params: { id: "scammer-123" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { status: string; verifiedBy: string; verifiedAt: Date };
    expect(updateArg.status).toBe("verified");
    expect(updateArg.verifiedBy).toBe("admin-uid");
    expect(updateArg.verifiedAt).toBeInstanceOf(Date);
  });

  it("status=rejected → sets verifiedBy and verifiedAt", async () => {
    await PATCH(makeReq("PATCH", { status: "rejected" }) as never, { params: { id: "scammer-123" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { status: string; verifiedBy: string };
    expect(updateArg.status).toBe("rejected");
    expect(updateArg.verifiedBy).toBe("admin-uid");
  });

  it("status=pending_review → does NOT set verifiedBy", async () => {
    await PATCH(makeReq("PATCH", { status: "pending_review" }) as never, { params: { id: "scammer-123" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { status: string; verifiedBy?: string };
    expect(updateArg.status).toBe("pending_review");
    expect(updateArg.verifiedBy).toBeUndefined();
  });

  it("verificationNote → updated when provided", async () => {
    await PATCH(makeReq("PATCH", { verificationNote: "Confirmed scammer" }) as never, { params: { id: "scammer-123" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { verificationNote: string };
    expect(updateArg.verificationNote).toBe("Confirmed scammer");
  });

  it("success → 200 with { id }", async () => {
    const res = await PATCH(makeReq("PATCH", { status: "verified" }) as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("scammer-123");
  });

  it("updatedAt always set on update", async () => {
    const before = new Date();
    await PATCH(makeReq("PATCH", { verificationNote: "test" }) as never, { params: { id: "scammer-123" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { updatedAt: Date };
    expect(updateArg.updatedAt).toBeInstanceOf(Date);
    expect(updateArg.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

describe("DELETE /api/admin/scammers/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq("DELETE") as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(401);
  });

  it("employee role → 403 (admin-only hard delete)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await DELETE(makeReq("DELETE") as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(403);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(makeReq("DELETE") as never, { params: { id: "scammer-x" } });
    expect(res.status).toBe(404);
  });

  it("success → deletes and returns 200 with { id }", async () => {
    const res = await DELETE(makeReq("DELETE") as never, { params: { id: "scammer-123" } });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith("scammer-123");
  });
});
