/**
 * Tests for GET /api/user/conversations
 * Lists authenticated buyer's conversations.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; storeId?: string } | null = null;

const { mockListConversationsForBuyer } = vi.hoisted(() => ({
  mockListConversationsForBuyer: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  listConversationsForBuyer: mockListConversationsForBuyer,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_req: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const mockConversations = [
  { id: "conv-1", buyerId: "buyer-uid", storeId: "store-1", lastMessageAt: "2026-06-01T10:00:00Z" },
  { id: "conv-2", buyerId: "buyer-uid", storeId: "store-2", lastMessageAt: "2026-06-02T10:00:00Z" },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockListConversationsForBuyer.mockResolvedValue(mockConversations);
});

describe("GET /api/user/conversations", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/user/conversations") as never);
    expect(res.status).toBe(401);
  });

  it("delegates to listConversationsForBuyer with uid", async () => {
    await GET(new Request("http://localhost/api/user/conversations") as never);
    expect(mockListConversationsForBuyer).toHaveBeenCalledWith("buyer-uid");
  });

  it("returns items array and total count", async () => {
    const res = await GET(new Request("http://localhost/api/user/conversations") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("empty conversation list → items: [], total: 0", async () => {
    mockListConversationsForBuyer.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/user/conversations") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(0);
    expect(json.data.items).toHaveLength(0);
  });
});
