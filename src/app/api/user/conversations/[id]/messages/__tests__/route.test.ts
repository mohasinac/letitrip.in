/**
 * Tests for POST /api/user/conversations/[id]/messages
 * Send a message in a conversation. Auth + role resolution via resolveConversationRole.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; storeId?: string } | null = null;

const {
  mockGetConversation,
  mockResolveConversationRole,
  mockSendMessage,
  mockPingConversationRtdb,
} = vi.hoisted(() => ({
  mockGetConversation: vi.fn(),
  mockResolveConversationRole: vi.fn(),
  mockSendMessage: vi.fn(),
  mockPingConversationRtdb: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/conversations/authorise", () => ({
  resolveConversationRole: mockResolveConversationRole,
}));

vi.mock("@mohasinac/appkit", () => ({
  getConversation: mockGetConversation,
  sendMessage: mockSendMessage,
  pingConversationRtdb: mockPingConversationRtdb,
  MESSAGE_MAX_LENGTH: 2000,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: { CONVERSATIONS: { NOT_FOUND: "Conversation not found" } },
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
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

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/user/conversations/conv-abc/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockContext = { params: Promise.resolve({ id: "conv-abc" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockGetConversation.mockResolvedValue(mockConv);
  mockResolveConversationRole.mockResolvedValue({ role: "buyer", sellerOwnerId: "seller-uid" });
  mockSendMessage.mockResolvedValue({ id: "conv-abc", messages: [] });
  mockPingConversationRtdb.mockResolvedValue(undefined);
});

describe("POST /api/user/conversations/[id]/messages", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ body: "Hello!" }) as never, mockContext as never);
    expect(res.status).toBe(401);
  });

  it("empty body string → 400", async () => {
    const res = await POST(makeReq({ body: "" }) as never, mockContext as never);
    expect(res.status).toBe(400);
  });

  it("body too long (>MESSAGE_MAX_LENGTH) → 400", async () => {
    const res = await POST(makeReq({ body: "x".repeat(2001) }) as never, mockContext as never);
    expect(res.status).toBe(400);
  });

  it("conversation not found → 404", async () => {
    mockGetConversation.mockResolvedValue(null);
    const res = await POST(makeReq({ body: "Hello!" }) as never, mockContext as never);
    expect(res.status).toBe(404);
  });

  it("user not in conversation (resolveConversationRole returns null) → 404", async () => {
    mockResolveConversationRole.mockResolvedValue(null);
    const res = await POST(makeReq({ body: "Hello!" }) as never, mockContext as never);
    expect(res.status).toBe(404);
  });

  it("valid message → sendMessage called with correct params", async () => {
    await POST(makeReq({ body: "Hello store!" }) as never, mockContext as never);
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-abc",
        senderId: "buyer-uid",
        senderRole: "buyer",
        body: "Hello store!",
      }),
    );
  });

  it("valid message → pingConversationRtdb called with buyerId + sellerOwnerId", async () => {
    await POST(makeReq({ body: "Hello!" }) as never, mockContext as never);
    expect(mockPingConversationRtdb).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-abc",
        buyerId: "buyer-uid",
        sellerOwnerId: "seller-uid",
      }),
    );
  });

  it("success → 200 with updated conversation", async () => {
    const res = await POST(makeReq({ body: "Hello!" }) as never, mockContext as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
