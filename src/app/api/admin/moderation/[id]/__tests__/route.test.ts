/**
 * Tests for GET /api/admin/moderation/[id] and PATCH /api/admin/moderation/[id]
 *
 * Both verbs: ROLES_ADMIN_MOD.
 * GET permission: admin:reviews:write. Uses ApiErrors.notFound() (not errorResponse).
 * PATCH: no explicit permission. No Zod schema — raw parseJsonBody. Injects reviewerId + reviewedAt.
 * Update errors → errorResponse(msg, 400).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockUpdate,
  mockParseJsonBody,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockParseJsonBody: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  moderationQueueRepository: {
    findById: mockFindById,
    update: mockUpdate,
  },
  parseJsonBody: mockParseJsonBody,
  normalizeError: vi.fn(),
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, params, user: _user ?? undefined });
    };
  },
}));

import { GET, PATCH } from "../route";

const params = { params: Promise.resolve({ id: "modq-report-001" }) };

const mockDoc = {
  id: "modq-report-001",
  type: "review",
  status: "pending",
  entityId: "review-charizard-001",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockDoc);
  mockParseJsonBody.mockResolvedValue({ status: "approved" });
  mockUpdate.mockResolvedValue({ ...mockDoc, status: "approved" });
});

describe("GET /api/admin/moderation/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("not found → 404 via ApiErrors.notFound", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Not found");
  });

  it("found → 200 with document", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("modq-report-001");
  });

  it("calls findById with correct id", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockFindById).toHaveBeenCalledWith("modq-report-001");
  });
});

describe("PATCH /api/admin/moderation/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD, no extra permission)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
  });

  it("injects reviewerId from user.uid", async () => {
    _user = { uid: "mod-uid-42", role: "moderator" };
    await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      "modq-report-001",
      expect.objectContaining({ reviewerId: "mod-uid-42" }),
    );
  });

  it("injects reviewedAt as a Date", async () => {
    await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      "modq-report-001",
      expect.objectContaining({ reviewedAt: expect.any(Date) }),
    );
  });

  it("body fields merged into update (no Zod schema — raw passthrough)", async () => {
    mockParseJsonBody.mockResolvedValue({ status: "approved", notes: "looks fine" });
    await PATCH(
      new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ status: "approved", notes: "looks fine" }) }) as never,
      params as never,
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      "modq-report-001",
      expect.objectContaining({ status: "approved", notes: "looks fine" }),
    );
  });

  it("update throws → 400 with error message", async () => {
    mockUpdate.mockRejectedValue(new Error("Invalid transition"));
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Invalid transition");
  });

  it("success → 200 with updated doc and 'Reviewed' message", async () => {
    const res = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: "{}" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string; data: { status: string } };
    expect(json.message).toBe("Reviewed");
    expect(json.data.status).toBe("approved");
  });
});
