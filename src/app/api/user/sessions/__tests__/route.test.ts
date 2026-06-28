import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindAllByUser,
  mockCountActive,
  mockRevokeSession,
} = vi.hoisted(() => ({
  mockFindAllByUser: vi.fn(),
  mockCountActive: vi.fn(),
  mockRevokeSession: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  sessionRepository: {
    findAllByUser: mockFindAllByUser,
    countActiveByUser: mockCountActive,
  },
  revokeSession: mockRevokeSession,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request; params: Record<string, string> }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      return opts.handler({ user: _user ?? undefined, request, params: params ?? {} });
    };
  },
}));

import { GET } from "../route";
import { DELETE } from "../[id]/route";

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "test-uid", role: "user" };
  mockFindAllByUser.mockResolvedValue([
    { id: "sess-1", isActive: true, lastActivity: new Date() },
    { id: "sess-2", isActive: false, lastActivity: new Date() },
  ]);
  mockCountActive.mockResolvedValue(1);
  mockRevokeSession.mockResolvedValue(undefined);
});

function makeGetReq(): Request {
  return new Request("http://localhost/api/user/sessions", { method: "GET" });
}

function makeDeleteReq(id: string): Request {
  return new Request(`http://localhost/api/user/sessions/${id}`, { method: "DELETE" });
}

describe("GET /api/user/sessions", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns sessions for authenticated user", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { sessions: unknown[]; activeCount: number; total: number } };
    expect(json.data.sessions).toHaveLength(2);
    expect(json.data.activeCount).toBe(1);
    expect(json.data.total).toBe(2);
  });

  it("delegates to sessionRepository.findAllByUser with uid", async () => {
    await GET(makeGetReq() as never);
    expect(mockFindAllByUser).toHaveBeenCalledWith("test-uid", 20);
  });

  it("includes activeCount from countActiveByUser", async () => {
    mockCountActive.mockResolvedValue(3);
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { activeCount: number } };
    expect(json.data.activeCount).toBe(3);
  });
});

describe("DELETE /api/user/sessions/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeDeleteReq("sess-1") as never, { params: Promise.resolve({ id: "sess-1" }) } as never);
    expect(res.status).toBe(401);
  });

  it("calls revokeSession with sessionId and uid", async () => {
    await DELETE(makeDeleteReq("sess-abc") as never, { params: Promise.resolve({ id: "sess-abc" }) } as never);
    expect(mockRevokeSession).toHaveBeenCalledWith("sess-abc", "test-uid");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeDeleteReq("sess-1") as never, { params: Promise.resolve({ id: "sess-1" }) } as never);
    expect(res.status).toBe(200);
  });
});
