/**
 * Tests for POST /api/user/conversations/[id]/read
 * Marks all inbound messages as read + zeroes unread counter for the caller.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; storeId?: string } | null = null;

const {
  mockGetConversation,
  mockResolveConversationRole,
  mockMarkConversationRead,
  mockPingConversationRtdb,
} = vi.hoisted(() => ({
  mockGetConversation: vi.fn(),
  mockResolveConversationRole: vi.fn(),
  mockMarkConversationRead: vi.fn(),
  mockPingConversationRtdb: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/conversations/authorise", () => ({
  resolveConversationRole: mockResolveConversationRole,
}));

vi.mock("@mohasinac/appkit", () => ({
  getConversation: mockGetConversation,
  markConversationRead: mockMarkConversationRead,
  pingConversationRtdb: mockPingConversationRtdb,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: { CONVERSATIONS: { NOT_FOUND: "Conversation not found" } },
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_req: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { POST } from "../route";

const mockConv = {
  id: "conv-abc",
  buyerId: "buyer-uid",
  storeId: "store-1",
  sellerOwnerId: "seller-uid",
};

const makeReq = () =>
  new Request("http://localhost/api/user/conversations/conv-abc/read", { method: "POST" });

const mockContext = { params: Promise.resolve({ id: "conv-abc" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockGetConversation.mockResolvedValue(mockConv);
  mockResolveConversationRole.mockResolvedValue({ role: "buyer", sellerOwnerId: "seller-uid" });
  mockMarkConversationRead.mockResolvedValue(undefined);
  mockPingConversationRtdb.mockResolvedValue(undefined);
});

describe("POST /api/user/conversations/[id]/read", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never, mockContext as never);
    expect(res.status).toBe(401);
  });

  it("conversation not found → 404", async () => {
    mockGetConversation.mockResolvedValue(null);
    const res = await POST(makeReq() as never, mockContext as never);
    expect(res.status).toBe(404);
  });

  it("caller not part of conversation (resolveConversationRole returns null) → 404", async () => {
    mockResolveConversationRole.mockResolvedValue(null);
    const res = await POST(makeReq() as never, mockContext as never);
    expect(res.status).toBe(404);
  });

  it("valid → markConversationRead called with conversationId and caller's role", async () => {
    await POST(makeReq() as never, mockContext as never);
    expect(mockMarkConversationRead).toHaveBeenCalledWith("conv-abc", "buyer");
  });

  it("seller marks read → markConversationRead called with role: seller", async () => {
    _user = { uid: "seller-uid", role: "seller", storeId: "store-1" };
    mockResolveConversationRole.mockResolvedValue({ role: "seller", sellerOwnerId: "seller-uid" });
    await POST(makeReq() as never, mockContext as never);
    expect(mockMarkConversationRead).toHaveBeenCalledWith("conv-abc", "seller");
  });

  it("valid → pingConversationRtdb called after marking read", async () => {
    await POST(makeReq() as never, mockContext as never);
    expect(mockPingConversationRtdb).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-abc",
        buyerId: "buyer-uid",
        sellerOwnerId: "seller-uid",
      }),
    );
  });

  it("success → 200 with { ok: true }", async () => {
    const res = await POST(makeReq() as never, mockContext as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
