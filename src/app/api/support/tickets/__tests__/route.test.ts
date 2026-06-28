/**
 * Tests for GET/POST /api/support/tickets
 * GET: Returns current user's tickets (paginated). Auth required.
 * POST: Creates a new support ticket with business guards:
 *   - Soft-ban check (blocked if banned from create_support_tickets, unless unban_request)
 *   - Active ticket limit (MAX=2, except order_issue and unban_request)
 *   - order_issue: orderId required, order must belong to user, must be active (not DELIVERED/CANCELLED/REFUNDED)
 *   - order_issue: only one open ticket per orderId
 *   - category same as existing waiting_on_user → 422
 *   - unban_request bypasses ban check AND ticket limit
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; email?: string; displayName?: string } | null = null;

const {
  mockSupportGetUserTickets,
  mockSupportCountActiveTickets,
  mockSupportGetActiveOrderTicket,
  mockSupportGetActiveCategoryTicket,
  mockSupportCreateTicket,
  mockOrderFindById,
  mockUserFindById,
  mockIsSoftBanned,
} = vi.hoisted(() => ({
  mockSupportGetUserTickets: vi.fn(),
  mockSupportCountActiveTickets: vi.fn(),
  mockSupportGetActiveOrderTicket: vi.fn(),
  mockSupportGetActiveCategoryTicket: vi.fn(),
  mockSupportCreateTicket: vi.fn(),
  mockOrderFindById: vi.fn(),
  mockUserFindById: vi.fn(),
  mockIsSoftBanned: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@mohasinac/appkit/server", () => ({ isSoftBanned: mockIsSoftBanned }));

vi.mock("@mohasinac/appkit", () => ({
  supportRepository: {
    getUserTickets: mockSupportGetUserTickets,
    countActiveTickets: mockSupportCountActiveTickets,
    getActiveOrderTicket: mockSupportGetActiveOrderTicket,
    getActiveCategoryTicket: mockSupportGetActiveCategoryTicket,
    createTicket: mockSupportCreateTicket,
  },
  orderRepository: { findById: mockOrderFindById },
  userRepository: { findById: mockUserFindById },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/support/tickets");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/support/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  category: "general",
  subject: "Test issue",
  description: "This is a test description with enough content.",
};

const mockOrder = {
  id: "order-abc",
  userId: "buyer-uid",
  status: "PROCESSING",
};

const mockTicket = {
  id: "ticket-1",
  userId: "buyer-uid",
  category: "general",
  subject: "Test issue",
  status: "open",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user", email: "buyer@test.com", displayName: "Test Buyer" };
  mockIsSoftBanned.mockReturnValue(false);
  mockUserFindById.mockResolvedValue({ uid: "buyer-uid", role: "user", softBans: [] });
  mockSupportCountActiveTickets.mockResolvedValue(0);
  mockSupportGetActiveOrderTicket.mockResolvedValue(null);
  mockSupportGetActiveCategoryTicket.mockResolvedValue(null);
  mockSupportCreateTicket.mockResolvedValue(mockTicket);
  mockSupportGetUserTickets.mockResolvedValue({ items: [], total: 0 });
  mockOrderFindById.mockResolvedValue(mockOrder);
});

describe("GET /api/support/tickets", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns user's own tickets → 200", async () => {
    mockSupportGetUserTickets.mockResolvedValue({ items: [mockTicket], total: 1 });
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    expect(mockSupportGetUserTickets).toHaveBeenCalledWith("buyer-uid", 1, 20);
  });

  it("pagination params forwarded", async () => {
    await GET(makeGetReq({ page: "2", pageSize: "10" }) as never);
    expect(mockSupportGetUserTickets).toHaveBeenCalledWith("buyer-uid", 2, 10);
  });
});

describe("POST /api/support/tickets", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("missing category → 400", async () => {
    const res = await POST(makePostReq({ subject: "Test", description: "Long enough desc" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing subject → 400", async () => {
    const res = await POST(makePostReq({ category: "general", description: "Long enough desc" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing description → 400", async () => {
    const res = await POST(makePostReq({ category: "general", subject: "Test" }) as never);
    expect(res.status).toBe(400);
  });

  it("soft-banned user → 403 with ban reason", async () => {
    mockIsSoftBanned.mockReturnValue(true);
    mockUserFindById.mockResolvedValue({
      uid: "buyer-uid",
      softBans: [{ action: "create_support_tickets", reason: "Spam" }],
    });
    const res = await POST(makePostReq(validBody) as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Spam");
  });

  it("soft-ban check skipped for unban_request category", async () => {
    mockIsSoftBanned.mockReturnValue(true);
    const res = await POST(makePostReq({
      category: "unban_request",
      subject: "Please unban me",
      description: "I should not be banned, this was a mistake.",
    }) as never);
    // Should NOT return 403 for ban check
    expect(mockSupportCreateTicket).toHaveBeenCalled();
  });

  it("active ticket count >= 2 → 422", async () => {
    mockSupportCountActiveTickets.mockResolvedValue(2);
    const res = await POST(makePostReq(validBody) as never);
    expect(res.status).toBe(422);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("2 open tickets");
  });

  it("active ticket limit skipped for order_issue category", async () => {
    mockSupportCountActiveTickets.mockResolvedValue(2);
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Order problem",
      description: "My order was not delivered.",
      orderId: "order-abc",
    }) as never);
    // Should NOT be blocked by general ticket limit
    expect(res.status).not.toBe(422);
  });

  it("active ticket limit skipped for unban_request category", async () => {
    mockSupportCountActiveTickets.mockResolvedValue(2);
    const res = await POST(makePostReq({
      category: "unban_request",
      subject: "Please unban me",
      description: "I should not be banned.",
    }) as never);
    expect(res.status).not.toBe(422);
  });

  it("order_issue without orderId → 400", async () => {
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Order problem",
      description: "My order was not delivered.",
    }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("orderId is required");
  });

  it("order_issue: order not found → 404", async () => {
    mockOrderFindById.mockResolvedValue(null);
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Order problem",
      description: "My order was not delivered.",
      orderId: "order-missing",
    }) as never);
    expect(res.status).toBe(404);
  });

  it("order_issue: order belongs to different user → 403", async () => {
    mockOrderFindById.mockResolvedValue({ ...mockOrder, userId: "other-user-uid" });
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Order problem",
      description: "My order was not delivered.",
      orderId: "order-abc",
    }) as never);
    expect(res.status).toBe(403);
  });

  it("order_issue: DELIVERED order → 400 (ineligible status)", async () => {
    mockOrderFindById.mockResolvedValue({ ...mockOrder, status: "DELIVERED" });
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Delivered but damaged",
      description: "My order was delivered but damaged.",
      orderId: "order-abc",
    }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("active orders");
  });

  it("order_issue: CANCELLED order → 400 (ineligible status)", async () => {
    mockOrderFindById.mockResolvedValue({ ...mockOrder, status: "CANCELLED" });
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Cancelled order",
      description: "I need help with a cancelled order.",
      orderId: "order-abc",
    }) as never);
    expect(res.status).toBe(400);
  });

  it("order_issue: REFUNDED order → 400 (ineligible status)", async () => {
    mockOrderFindById.mockResolvedValue({ ...mockOrder, status: "REFUNDED" });
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Refunded order",
      description: "I need help with my refunded order.",
      orderId: "order-abc",
    }) as never);
    expect(res.status).toBe(400);
  });

  it("order_issue: already has open ticket for this orderId → 422", async () => {
    mockSupportGetActiveOrderTicket.mockResolvedValue({ id: "existing-ticket" });
    const res = await POST(makePostReq({
      category: "order_issue",
      subject: "Another order problem",
      description: "Second ticket for same order.",
      orderId: "order-abc",
    }) as never);
    expect(res.status).toBe(422);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("already have an open ticket");
  });

  it("same category as existing waiting_on_user ticket → 422", async () => {
    mockSupportGetActiveCategoryTicket.mockResolvedValue({ id: "cat-ticket", status: "waiting_on_user" });
    const res = await POST(makePostReq(validBody) as never);
    expect(res.status).toBe(422);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("unanswered question");
  });

  it("existing category ticket but NOT waiting_on_user → allowed", async () => {
    mockSupportGetActiveCategoryTicket.mockResolvedValue({ id: "cat-ticket", status: "open" });
    const res = await POST(makePostReq(validBody) as never);
    // "open" status is not "waiting_on_user" — should proceed
    expect(mockSupportCreateTicket).toHaveBeenCalled();
  });

  it("success → 201 with created ticket", async () => {
    const res = await POST(makePostReq(validBody) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("ticket-1");
  });

  it("createTicket called with correct userId and user email", async () => {
    await POST(makePostReq(validBody) as never);
    expect(mockSupportCreateTicket).toHaveBeenCalledWith(expect.objectContaining({
      userId: "buyer-uid",
      userEmail: "buyer@test.com",
      category: "general",
    }));
  });
});
