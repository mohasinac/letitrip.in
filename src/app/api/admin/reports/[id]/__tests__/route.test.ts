/**
 * Tests for GET/PATCH /api/admin/reports/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById via reportsRepository; ApiErrors.notFound if missing
 * PATCH: ROLES_ADMIN_MOD — raw parseJsonBody (no schema); always injects assignedTo: user.uid;
 *   errors from update → 400
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdate } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  reportsRepository: { findById: mockFindById, update: mockUpdate },
  ApiErrors: {
    notFound: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  normalizeError: vi.fn(),
  parseJsonBody: async (request: Request) => {
    try { return await request.json(); } catch { return {}; }
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, params, user: _user ?? undefined });
    };
  },
}));

import { GET, PATCH } from "../route";

const mockReport = { id: "report-001", type: "scam", status: "open", reporter: "user-ravi" };
const routeParams = { params: Promise.resolve({ id: "report-001" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockReport);
  mockUpdate.mockResolvedValue({ ...mockReport, status: "resolved", assignedTo: "admin-uid" });
});

describe("GET /api/admin/reports/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
  });

  it("report not found → 404 via ApiErrors.notFound", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Not found");
  });

  it("found → 200 with report data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("report-001");
  });
});

describe("PATCH /api/admin/reports/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("report not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("always injects assignedTo: user.uid regardless of body", async () => {
    await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    expect(mockUpdate).toHaveBeenCalledWith(
      "report-001",
      expect.objectContaining({ assignedTo: "admin-uid" }),
    );
  });

  it("body fields merged with assignedTo", async () => {
    await PATCH(makeRequest({ status: "dismissed", note: "Verified false report" }), routeParams as never);
    expect(mockUpdate).toHaveBeenCalledWith(
      "report-001",
      expect.objectContaining({ status: "dismissed", note: "Verified false report", assignedTo: "admin-uid" }),
    );
  });

  it("no schema — arbitrary body passes through", async () => {
    const res = await PATCH(makeRequest({ anything: "goes" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("update throws → 400 with error message", async () => {
    mockUpdate.mockRejectedValue(new Error("Invalid status value"));
    const res = await PATCH(makeRequest({ status: "INVALID" }), routeParams as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Invalid status value");
  });

  it("update throws non-Error → 400 with 'Update failed'", async () => {
    mockUpdate.mockRejectedValue("unknown error");
    const res = await PATCH(makeRequest({ status: "X" }), routeParams as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Update failed");
  });

  it("success → 200 with 'Updated' message", async () => {
    const res = await PATCH(makeRequest({ status: "resolved" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Updated");
  });
});
