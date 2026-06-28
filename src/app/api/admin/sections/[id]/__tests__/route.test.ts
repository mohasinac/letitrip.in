/**
 * Tests for PATCH + DELETE /api/admin/sections/[id]
 * PATCH: local validation; updates section; fetches updated doc for response.
 * DELETE: hard deletes section.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockUpdate,
  mockFindById,
  mockDelete,
} = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockFindById: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));
vi.mock("@/validation/request-schemas", () => ({
  validateRequestBody: (schema: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { path: string[]; message: string }[] } } }, body: unknown) => {
    const result = schema.safeParse(body);
    if (result.success) return { success: true, data: result.data };
    return { success: false, errors: result.error?.issues ?? [] };
  },
  formatZodErrors: (issues: { path: string[]; message: string }[]) => {
    const map: Record<string, string[]> = {};
    for (const issue of issues) {
      const key = issue.path[0] ?? "root";
      (map[key] ??= []).push(issue.message);
    }
    return map;
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  homepageSectionsRepository: { update: mockUpdate, findById: mockFindById, delete: mockDelete },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  normalizeError: vi.fn(),
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  ERROR_MESSAGES: {
    VALIDATION: { FAILED: "Validation failed" },
    SECTION: { NOT_FOUND: "Section not found" },
  },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request; params?: Record<string, string> }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request, params: context?.params });
    };
  },
}));

import { PATCH, DELETE } from "../route";

const makeReq = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/sections/section-welcome", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockSection = { id: "section-welcome", type: "welcome", order: 1, enabled: true };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockUpdate.mockResolvedValue(undefined);
  mockFindById.mockResolvedValue(mockSection);
  mockDelete.mockResolvedValue(undefined);
});

describe("PATCH /api/admin/sections/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeReq("PATCH", { enabled: false }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (admin-only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await PATCH(makeReq("PATCH", { enabled: false }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(403);
  });

  it("updates section with provided fields", async () => {
    await PATCH(makeReq("PATCH", { enabled: false, order: 3 }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(mockUpdate).toHaveBeenCalledWith("section-welcome", expect.objectContaining({ enabled: false, order: 3 }));
  });

  it("section not found after update → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeReq("PATCH", { enabled: false }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(404);
  });

  it("update throws → 500", async () => {
    mockUpdate.mockRejectedValue(new Error("DB error"));
    const res = await PATCH(makeReq("PATCH", { enabled: false }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(500);
  });

  it("success → 200 with updated section", async () => {
    const res = await PATCH(makeReq("PATCH", { enabled: false }) as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockSection };
    expect(json.data.id).toBe("section-welcome");
  });
});

describe("DELETE /api/admin/sections/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (admin-only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(403);
  });

  it("deletes section by id", async () => {
    await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(mockDelete).toHaveBeenCalledWith("section-welcome");
  });

  it("delete throws → 500", async () => {
    mockDelete.mockRejectedValue(new Error("DB error"));
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(500);
  });

  it("success → 200 with { success: true }", async () => {
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "section-welcome" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { success: boolean } };
    expect(json.data.success).toBe(true);
  });
});
