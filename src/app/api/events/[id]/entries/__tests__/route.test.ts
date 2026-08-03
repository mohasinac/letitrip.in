/**
 * Tests for POST /api/events/[id]/entries
 * Auth is optional — guests can submit entries too.
 * Soft-banned users (join_events) are rejected with 403.
 * enterEvent does the heavy lifting; we verify the guard and delegation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; displayName: string; email: string } | null = null;

const { mockEnterEvent, mockFindById, mockIsSoftBanned } = vi.hoisted(() => ({
  mockEnterEvent: vi.fn(),
  mockFindById: vi.fn(),
  mockIsSoftBanned: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/features", () => ({
  withFeatureGuard: (_flag: string, handler: unknown) => handler,
  getFlag: () => true,
}));

vi.mock("@mohasinac/appkit", () => ({
  createRouteHandler: (opts: {
    authOptional?: boolean;
    handler: (ctx: { user?: unknown; request: Request; params: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise
        ? await (context.params as Promise<unknown>)
        : context?.params;
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
  enterEvent: mockEnterEvent,
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  parseJsonBody: async (req: Request) => {
    try { return await req.clone().json(); } catch { return {}; }
  },
  userRepository: { findById: mockFindById },
  isSoftBanned: mockIsSoftBanned,
}));

vi.mock("@mohasinac/appkit/server", () => ({
  isSoftBanned: mockIsSoftBanned,
}));

import { POST } from "../route";

const makeReq = (body: unknown = {}) =>
  new Request("http://localhost/api/events/event-summer-sale/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeCtx = (id = "event-summer-sale") => ({
  params: Promise.resolve({ id }),
});

const makeUserDoc = (overrides: Record<string, unknown> = {}) => ({
  uid: "user-ravi",
  displayName: "Ravi Kumar",
  email: "ravi@example.com",
  softBans: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "user-ravi", displayName: "Ravi Kumar", email: "ravi@example.com" };
  mockFindById.mockResolvedValue(makeUserDoc());
  mockIsSoftBanned.mockReturnValue(false);
  mockEnterEvent.mockResolvedValue({ id: "entry-abc", eventId: "event-summer-sale", status: "CONFIRMED" });
});

describe("POST /api/events/[id]/entries", () => {
  it("authenticated user → 201 with entry", async () => {
    const res = await POST(makeReq({ answer: "yes" }) as never, makeCtx());
    expect(res.status).toBe(201);
    const body = await res.json() as { ok: boolean; data: { id: string } };
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe("entry-abc");
  });

  it("enterEvent called with eventId + body + safeUser", async () => {
    const entryBody = { answer: "Pikachu" };
    await POST(makeReq(entryBody) as never, makeCtx("event-pokemon-tournament"));
    expect(mockEnterEvent).toHaveBeenCalledWith(
      "event-pokemon-tournament",
      expect.objectContaining(entryBody),
      expect.objectContaining({ uid: "user-ravi" }),
    );
  });

  it("guest (no auth) → enterEvent called with undefined safeUser", async () => {
    _user = null;
    await POST(makeReq({ answer: "yes" }) as never, makeCtx());
    expect(mockEnterEvent).toHaveBeenCalledWith(
      "event-summer-sale",
      expect.any(Object),
      undefined,
    );
    // No user lookup for guest
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("soft-banned user (join_events) → 403 before enterEvent is called", async () => {
    mockIsSoftBanned.mockReturnValue(true);
    mockFindById.mockResolvedValue(
      makeUserDoc({
        softBans: [{ action: "join_events", reason: "Spam entries", expiresAt: null }],
      }),
    );
    const res = await POST(makeReq() as never, makeCtx());
    expect(res.status).toBe(403);
    expect(mockEnterEvent).not.toHaveBeenCalled();
  });

  it("user not in Firestore (findById returns null) → proceeds without ban check", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ answer: "yes" }) as never, makeCtx());
    // null userDoc skips the ban check, entry proceeds normally
    expect(res.status).toBe(201);
    expect(mockEnterEvent).toHaveBeenCalled();
  });
});
