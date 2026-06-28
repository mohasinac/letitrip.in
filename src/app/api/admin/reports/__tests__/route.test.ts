/**
 * Tests for GET /api/admin/reports and GET/PATCH /api/admin/reports/[id]
 * GET (list): ROLES_ADMIN_MOD + admin:reviews:read. Lists pending reports.
 * GET [id]:   ROLES_ADMIN_MOD + admin:reviews:write. 404 for missing.
 * PATCH [id]: ROLES_ADMIN_MOD. 404 guard. Injects assignedTo = user.uid.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListPending, mockFindById, mockUpdate } = vi.hoisted(() => ({
  mockListPending: vi.fn(),
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  reportsRepository: {
    listPending: mockListPending,
    findById: mockFindById,
    update: mockUpdate,
  },
  normalizeError: vi.fn(),
  parseJsonBody: async (req: Request) => req.clone().json().catch(() => ({})),
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
}));

import { GET as listGET } from "../route";
import { GET as detailGET, PATCH } from "../[id]/route";

const mockReports = [
  { id: "report-1", type: "counterfeit", status: "pending", reporterId: "user-1" },
  { id: "report-2", type: "spam", status: "pending", reporterId: "user-2" },
];

const listParams = {};
const detailParams = { params: Promise.resolve({ id: "report-1" }) };

const makeListReq = () => new Request("http://localhost/api/admin/reports");
const makePatchReq = (body: unknown) =>
  new Request("http://localhost/api/admin/reports/report-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListPending.mockResolvedValue({ items: mockReports });
  mockFindById.mockResolvedValue(mockReports[0]);
  mockUpdate.mockResolvedValue({ ...mockReports[0], status: "resolved" });
});

describe("GET /api/admin/reports", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await listGET(makeListReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (not in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await listGET(makeListReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await listGET(makeListReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns pending reports with total", async () => {
    const res = await listGET(makeListReq() as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("calls reportsRepository.listPending()", async () => {
    await listGET(makeListReq() as never);
    expect(mockListPending).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/admin/reports/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await detailGET(new Request("http://localhost") as never, detailParams as never);
    expect(res.status).toBe(401);
  });

  it("report not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await detailGET(new Request("http://localhost") as never, detailParams as never);
    expect(res.status).toBe(404);
  });

  it("report found → 200 with report data", async () => {
    const res = await detailGET(new Request("http://localhost") as never, detailParams as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("report-1");
  });
});

describe("PATCH /api/admin/reports/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makePatchReq({ status: "resolved" }) as never, detailParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makePatchReq({ status: "resolved" }) as never, detailParams as never);
    expect(res.status).toBe(403);
  });

  it("report not found → 404 before update", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makePatchReq({ status: "resolved" }) as never, detailParams as never);
    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("injects assignedTo = user.uid into update", async () => {
    await PATCH(makePatchReq({ status: "resolved" }) as never, detailParams as never);
    expect(mockUpdate).toHaveBeenCalledWith("report-1", expect.objectContaining({
      assignedTo: "admin-uid",
    }));
  });

  it("moderator → assignedTo = moderator uid", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    await PATCH(makePatchReq({ status: "dismissed" }) as never, detailParams as never);
    expect(mockUpdate).toHaveBeenCalledWith("report-1", expect.objectContaining({
      assignedTo: "mod-uid",
    }));
  });

  it("forwards body fields alongside assignedTo", async () => {
    await PATCH(makePatchReq({ status: "resolved", resolution: "Genuine item" }) as never, detailParams as never);
    expect(mockUpdate).toHaveBeenCalledWith("report-1", expect.objectContaining({
      status: "resolved",
      resolution: "Genuine item",
    }));
  });

  it("success → 200 with updated report", async () => {
    const res = await PATCH(makePatchReq({ status: "resolved" }) as never, detailParams as never);
    expect(res.status).toBe(200);
  });

  it("repo throws → 400 with error message", async () => {
    mockUpdate.mockRejectedValue(new Error("Invalid status"));
    const res = await PATCH(makePatchReq({ status: "bad-status" }) as never, detailParams as never);
    expect(res.status).toBe(400);
  });
});
